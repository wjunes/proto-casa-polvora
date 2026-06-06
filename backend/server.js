// Minimal Express server to proxy chat requests to the AI provider.
// Reads DEEPSEEK_API_KEY (and optional DEEPSEEK_API_URL) from .env
// If DEEPSEEK_API_URL is not set, the server returns a local mock reply.

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = (process.env.DEEPSEEK_API_KEY || '').trim();
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const UPSTREAM = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';

const SERVE_STATIC = ['1', 'true', 'yes', 'on'].includes(
  String(process.env.SERVE_STATIC || '').toLowerCase().trim()
);
const FRONTEND_ROOT = path.resolve(__dirname, '..');

if (SERVE_STATIC) {
  app.use(express.static(FRONTEND_ROOT));
}

let SYSTEM_PROMPT = '';
let FAQ_TEXT = '';
let parsedFaqs = null;

// Helper: try multiple candidate locations for prompt/faqs to support different layouts
function firstExisting(...candidates) {
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return p;
    } catch (_) { }
  }
  return null;
}

try {
  const promptPath = firstExisting(
    path.join(__dirname, 'PROMPT-BOT.md'),
    path.join(__dirname, 'pages', 'chat-bot', 'PROMPT-BOT.md'),
    path.join(__dirname, '..', 'pages', 'chat-bot', 'PROMPT-BOT.md')
  );
  if (promptPath) {
    SYSTEM_PROMPT = fs.readFileSync(promptPath, 'utf8').trim();
    console.log('Loaded system prompt from', promptPath);
  }
} catch (e) {
  console.warn('Could not load PROMPT-BOT.md', e && e.message);
}

try {
  const faqPath = firstExisting(
    path.join(__dirname, 'faqs.json'),
    path.join(__dirname, 'pages', 'chat-bot', 'faqs.json'),
    path.join(__dirname, '..', 'pages', 'chat-bot', 'faqs.json')
  );
  if (faqPath) {
    const raw = fs.readFileSync(faqPath, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.faq)) {
      parsedFaqs = parsed.faq;
      FAQ_TEXT = parsed.faq
        .map((q, i) => `Q${i + 1}: ${q.question}\nA: ${q.answer}`)
        .join('\n\n');
      console.log('Loaded FAQs from', faqPath);
    }
  }
} catch (e) {
  console.warn('Could not load faqs.json', e && e.message);
}

// Lightweight FAQ retrieval: token-overlap ranking (no external deps)
function normalizeText(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');
}
function tokenize(s) {
  return normalizeText(s).split(/[^a-z0-9]+/).filter(Boolean);
}
function scoreFaqMatch(queryTokens, faq) {
  const qTokens = tokenize(faq.question || '');
  const aTokens = tokenize(faq.answer || '');
  const qSet = new Set(qTokens);
  const aSet = new Set(aTokens);
  let score = 0;
  for (const t of queryTokens) {
    if (qSet.has(t)) score += 3;
    else if (aSet.has(t)) score += 1;
    else if (
      t.length > 3 &&
      (qTokens.join(' ').includes(t) || aTokens.join(' ').includes(t))
    ) {
      score += 0.5;
    }
  }
  return score;
}
function findTopFaqs(query, topN = 3) {
  if (!parsedFaqs || !query) return [];
  const qTokens = tokenize(query);
  const scored = parsedFaqs.map((f, idx) => ({ f, score: scoreFaqMatch(qTokens, f), idx }));
  scored.sort((a, b) => b.score - a.score || a.idx - b.idx);
  return scored.filter((s) => s.score > 0).slice(0, topN).map((s) => s.f);
}

function buildMessagesFromRequest(reqBody, userMessage) {
  const msgs = [];
  if (SYSTEM_PROMPT) msgs.push({ role: 'system', content: SYSTEM_PROMPT });

  const useFaqs = !(reqBody && typeof reqBody.use_faqs !== 'undefined' && reqBody.use_faqs === false);
  if (useFaqs) {
    if (parsedFaqs && userMessage) {
      const relevant = findTopFaqs(userMessage, 3);
      if (relevant.length) {
        const block = relevant.map((q) => `Q: ${q.question}\nA: ${q.answer}`).join('\n\n');
        msgs.push({
          role: 'system',
          content: 'Use the following relevant FAQs as factual references when answering:\n\n' + block
        });
      } else if (FAQ_TEXT) {
        msgs.push({
          role: 'system',
          content: 'Refer to these FAQs when answering user questions:\n\n' + FAQ_TEXT
        });
      }
    } else if (FAQ_TEXT) {
      msgs.push({
        role: 'system',
        content: 'Refer to these FAQs when answering user questions:\n\n' + FAQ_TEXT
      });
    }
  }

  if (reqBody && Array.isArray(reqBody.messages) && reqBody.messages.length) {
    msgs.push(...reqBody.messages);
  } else if (typeof userMessage === 'string') {
    msgs.push({ role: 'user', content: userMessage });
  }

  return msgs;
}

function mockReply(message) {
  const lower = (message || '').trim().toLowerCase();
  if (!lower) return 'Perdón, no recibí ningún mensaje.';
  if (lower.includes('horario')) {
    return 'Nuestros horarios son: martes a viernes 14:00-20:00, sábados 10:00-14:00.';
  }
  if (lower.includes('dirección') || lower.includes('direccion') || lower.includes('llegar') || lower.includes('dónde')) {
    return 'Estamos en Bulgaria esq Pasaje de la Pólvora, Cerro, Montevideo.';
  }
  if (lower.includes('gracias') || lower.includes('muchas')) {
    return '¡De nada! Si querés puedo contarte sobre nuestras actividades.';
  }
  return `Entendido: "${message}" — puedo ayudarte con información sobre actividades, historia o cómo participar.`;
}

app.post('/api/chat', async (req, res) => {
  const { message } = req.body || {};
  if (typeof message !== 'string') return res.status(400).json({ error: 'missing message' });

  // If no API key or no upstream configured, return mock reply for development
  if (!API_KEY) {
    return res.status(500).json({ error: 'missing_api_key' });
  }

  try {
    // Determine model: prefer model provided in request body, otherwise use configured MODEL env var
    let modelToSend = req.body?.model || DEEPSEEK_MODEL;
    if (!modelToSend) modelToSend = process.env.DEEPSEEK_MODEL_FALLBACK || 'gpt-3.5';

    const payload = { model: modelToSend };
    // Build messages: prepend strict system prompt and FAQs, then caller messages or user message
    payload.messages = buildMessagesFromRequest(req.body, message);

    // Optional parameters: temperature, max_tokens, top_p
    const envTemp = process.env.DEEPSEEK_TEMPERATURE;
    const envMax = process.env.DEEPSEEK_MAX_TOKENS;
    const temperature = typeof req.body.temperature !== 'undefined'
      ? parseFloat(req.body.temperature)
      : (envTemp ? parseFloat(envTemp) : undefined);
    const max_tokens = typeof req.body.max_tokens !== 'undefined'
      ? parseInt(req.body.max_tokens, 10)
      : (envMax ? parseInt(envMax, 10) : undefined);
    const top_p = typeof req.body.top_p !== 'undefined'
      ? parseFloat(req.body.top_p)
      : undefined;

    if (!Number.isNaN(temperature)) payload.temperature = temperature;
    if (!Number.isNaN(max_tokens)) payload.max_tokens = max_tokens;
    if (!Number.isNaN(top_p)) payload.top_p = top_p;

    // Forward the request to the upstream DEEPSEEK-compatible endpoint
    const upstreamRes = await fetch(UPSTREAM, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!upstreamRes.ok) {
      const txt = await upstreamRes.text();
      console.error('Upstream error', upstreamRes.status, txt);

      // If DeepSeek complains that the model doesn't exist, fall back to a local mock reply
      try {
        const parsed = JSON.parse(txt);
        const msg = parsed?.error?.message || '';
        if (upstreamRes.status === 400 && msg.toLowerCase().includes('model not exist')) {
          return res.json({
            reply: mockReply(message),
            note: 'Upstream model not found — using local mock.'
          });
        }
      } catch (_) { }

      // If the upstream indicates insufficient balance, return a clear 402 to the client
      if (upstreamRes.status === 402) {
        return res.status(402).json({
          error: 'insufficient_balance',
          message: 'Insufficient Balance'
        });
      }

      return res.status(502).json({ error: 'upstream_error', details: txt });
    }

    const data = await upstreamRes.json();
    // Try to extract a sensible reply from common response shapes (OpenAI-like / DeepSeek-like)
    let reply = null;
    if (data.reply) reply = data.reply;
    else if (data.choices?.[0]?.message?.content) reply = data.choices[0].message.content;
    else if (data.choices?.[0]?.text) reply = data.choices[0].text;
    else if (data.result) reply = data.result;
    else reply = typeof data === 'string' ? data : JSON.stringify(data);

    return res.json({ reply });
  } catch (err) {
    console.error('Error proxying to upstream', err);
    return res.status(500).json({ error: 'internal_error' });
  }
});

// Streaming endpoint: returns the assistant reply in a chunked response so the
// client can render tokens as they arrive. If upstream doesn't provide a
// streaming response, we compute the full reply and stream it word-by-word
// to simulate token streaming.
app.post('/api/chat/stream', async (req, res) => {
  const { message } = req.body || {};
  if (typeof message !== 'string') return res.status(400).json({ error: 'missing message' });

  // helper to stream text word-by-word
  const streamText = async (text, delayMs = 30) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Accel-Buffering', 'no');
    if (res.flushHeaders) res.flushHeaders();

    const parts = String(text).split(/(\s+)/);
    for (const p of parts) {
      res.write(p);
      await new Promise((r) => setTimeout(r, delayMs));
    }
    res.end();
  };

  // If no API key or no upstream configured, stream a local mock reply
  if (!API_KEY || !UPSTREAM) {
    return streamText(mockReply(message));
  }

  try {
    let modelToSend = req.body?.model || DEEPSEEK_MODEL;
    if (!modelToSend) modelToSend = process.env.DEEPSEEK_MODEL_FALLBACK || 'gpt-3.5';

    const payload = { model: modelToSend };
    payload.messages = buildMessagesFromRequest(req.body, message);

    // Ask upstream for a normal (non-streaming) completion and then stream it to the client.
    const upstreamRes = await fetch(UPSTREAM, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!upstreamRes.ok) {
      const txt = typeof upstreamRes.text === 'function' ? await upstreamRes.text() : '';
      console.error('Upstream error (stream)', upstreamRes.status, txt);

      if (upstreamRes.status === 402) {
        return streamText('Error: upstream provider - Insufficient Balance. Please refill provider account.');
      }

      return res.status(502).json({ error: 'upstream_error', status: upstreamRes.status });
    }

    const data = await upstreamRes.json();
    let reply = null;
    if (data.reply) reply = data.reply;
    else if (data.choices?.[0]?.message?.content) reply = data.choices[0].message.content;
    else if (data.choices?.[0]?.text) reply = data.choices[0].text;
    else if (data.result) reply = data.result;
    else reply = typeof data === 'string' ? data : JSON.stringify(data);

    return streamText(reply || mockReply(message));
  } catch (err) {
    console.error('Error proxying to upstream (stream)', err);
    return res.status(500).json({ error: 'internal_error' });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Polvorina server listening on http://localhost:${PORT}`);
    if (SERVE_STATIC) {
      console.log(`Serving static frontend from ${FRONTEND_ROOT}`);
    }
  });
}

module.exports = app;
