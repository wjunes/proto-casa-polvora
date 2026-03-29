// Minimal Express server to proxy chat requests to the AI provider.
// Reads DEEPSEEK_API_KEY (and optional DEEPSEEK_API_URL) from .env
// If DEEPSEEK_API_URL is not set, the server returns a local mock reply.

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const KEY = process.env.DEEPSEEK_API_KEY;
// Use the provided DeepSeek endpoint by default if DEEPSEEK_API_URL not set.
const UPSTREAM = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/chat/completions';
const MODEL = process.env.DEEPSEEK_MODEL || undefined;

// Load strict system prompt and FAQs from pages/chat-bot
const fs = require('fs');
const path = require('path');
let SYSTEM_PROMPT = '';
let FAQ_TEXT = '';
let parsedFaqs = null;

// Helper: try multiple candidate locations for prompt/faqs to support different layouts
function firstExisting(...candidates) {
  for (const p of candidates) {
    try { if (fs.existsSync(p)) return p; } catch (e) { /* ignore */ }
  }
  return null;
}

try {
  const candidates = [
    path.join(__dirname, 'PROMPT-BOT.md'),
    path.join(__dirname, 'pages', 'chat-bot', 'PROMPT-BOT.md'),
    path.join(__dirname, '..', 'pages', 'chat-bot', 'PROMPT-BOT.md')
  ];
  const promptPath = firstExisting(...candidates);
  if (promptPath) {
    SYSTEM_PROMPT = fs.readFileSync(promptPath, 'utf8').trim();
    console.log('Loaded system prompt from', promptPath);
  }
} catch (e) {
  console.warn('Could not load PROMPT-BOT.md', e && e.message);
}

try {
  const candidates = [
    path.join(__dirname, 'faqs.json'),
    path.join(__dirname, 'pages', 'chat-bot', 'faqs.json'),
    path.join(__dirname, '..', 'pages', 'chat-bot', 'faqs.json')
  ];
  const faqPath = firstExisting(...candidates);
  if (faqPath) {
    const raw = fs.readFileSync(faqPath, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.faq)) {
      parsedFaqs = parsed.faq;
      FAQ_TEXT = parsed.faq.map((q, i) => `Q${i+1}: ${q.question}\nA: ${q.answer}`).join('\n\n');
      console.log('Loaded FAQs from', faqPath);
    }
  }
} catch (e) {
  console.warn('Could not load faqs.json', e && e.message);
}

// Lightweight FAQ retrieval: token-overlap ranking (no external deps)
function normalizeText(s) {
  return String(s || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
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
    if (qSet.has(t)) score += 3; // question matches are more important
    else if (aSet.has(t)) score += 1;
    else if (t.length > 3 && (qTokens.join(' ').includes(t) || aTokens.join(' ').includes(t))) score += 0.5;
  }
  return score;
}
function findTopFaqs(query, topN = 3) {
  if (!parsedFaqs || !query) return [];
  const qTokens = tokenize(query);
  const scored = parsedFaqs.map((f, idx) => ({ f, score: scoreFaqMatch(qTokens, f), idx }));
  scored.sort((a, b) => b.score - a.score || a.idx - b.idx);
  return scored.filter(s => s.score > 0).slice(0, topN).map(s => s.f);
}

function buildMessagesFromRequest(reqBody, userMessage) {
  // Start with the strict system prompt if available
  const msgs = [];
  if (SYSTEM_PROMPT) msgs.push({ role: 'system', content: SYSTEM_PROMPT });
  // Attach relevant FAQs (retrieval) unless explicitly disabled by the client
  const useFaqs = !(reqBody && typeof reqBody.use_faqs !== 'undefined' && reqBody.use_faqs === false);
  if (useFaqs) {
    if (parsedFaqs && userMessage) {
      const relevant = findTopFaqs(userMessage, 3);
      if (relevant && relevant.length) {
        const block = relevant.map((q, i) => `Q: ${q.question}\nA: ${q.answer}`).join('\n\n');
        msgs.push({ role: 'system', content: 'Use the following relevant FAQs as factual references when answering:\n\n' + block });
      } else if (FAQ_TEXT) {
        // Fallback: include full FAQ block if retrieval failed to find matches
        msgs.push({ role: 'system', content: 'Refer to these FAQs when answering user questions:\n\n' + FAQ_TEXT });
      }
    } else if (FAQ_TEXT) {
      // If no user message available, include a compact FAQ block as context
      msgs.push({ role: 'system', content: 'Refer to these FAQs when answering user questions:\n\n' + FAQ_TEXT });
    }
  }

  // If caller provided a full messages array, trust it but append the user's message if present
  if (reqBody && Array.isArray(reqBody.messages) && reqBody.messages.length) {
    // Append the provided messages after the system messages
    msgs.push(...reqBody.messages);
  } else if (typeof userMessage === 'string') {
    msgs.push({ role: 'user', content: userMessage });
  }
  return msgs;
}

function mockReply(message) {
  const lower = (message || '').trim().toLowerCase();
  if (!lower) return 'Perdón, no recibí ningún mensaje.';
  if (lower.includes('horario')) return 'Nuestros horarios son: martes a viernes 14:00-20:00, sábados 10:00-14:00.';
  if (lower.includes('dirección') || lower.includes('llegar') || lower.includes('dónde')) return 'Estamos en Bulgaria esq Pasaje de la Pólvora, Cerro, Montevideo.';
  if (lower.includes('gracias') || lower.includes('muchas')) return '¡De nada! Si querés puedo contarte sobre nuestras actividades.';
  return `Entendido: "${message}" — puedo ayudarte con información sobre actividades, historia o cómo participar.`;
}

app.post('/api/chat', async (req, res) => {
  const { message } = req.body || {};
  if (typeof message !== 'string') return res.status(400).json({ error: 'missing message' });

  // If no API key or no upstream configured, return mock reply for development
  if (!KEY || !UPSTREAM) {
    console.log('DEEPSEEK_API_KEY or DEEPSEEK_API_URL not set — returning mock reply');
    const reply = mockReply(message);
    return res.json({ reply });
  }

  try {
      // Determine model: prefer model provided in request body, otherwise use configured MODEL env var
      const requestModel = (req.body && req.body.model) ? req.body.model : MODEL;
      let modelToSend = requestModel;
      if (!modelToSend) {
        // Fallback to a safe default to avoid 400 from DeepSeek in development.
        // Recommend setting DEEPSEEK_MODEL in .env for predictable results.
        const FALLBACK = process.env.DEEPSEEK_MODEL_FALLBACK || 'gpt-3.5';
        console.warn('No model specified; falling back to default model:', FALLBACK);
        modelToSend = FALLBACK;
      }

      // Build a chat-completions style payload
      const payload = { model: modelToSend };
      // Build messages: prepend strict system prompt and FAQs, then caller messages or user message
      payload.messages = buildMessagesFromRequest(req.body, message);

      // Optional parameters: temperature, max_tokens, top_p
      const envTemp = process.env.DEEPSEEK_TEMPERATURE;
      const envMax = process.env.DEEPSEEK_MAX_TOKENS;
      const temperature = (typeof req.body.temperature !== 'undefined') ? parseFloat(req.body.temperature) : (envTemp ? parseFloat(envTemp) : undefined);
      const max_tokens = (typeof req.body.max_tokens !== 'undefined') ? parseInt(req.body.max_tokens, 10) : (envMax ? parseInt(envMax, 10) : undefined);
      const top_p = (typeof req.body.top_p !== 'undefined') ? parseFloat(req.body.top_p) : undefined;

      if (!Number.isNaN(temperature) && typeof temperature === 'number') payload.temperature = temperature;
      if (!Number.isNaN(max_tokens) && typeof max_tokens === 'number') payload.max_tokens = max_tokens;
      if (!Number.isNaN(top_p) && typeof top_p === 'number') payload.top_p = top_p;

    // Forward the request to the upstream DEEPSEEK-compatible endpoint
    const upstreamRes = await fetch(UPSTREAM, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!upstreamRes.ok) {
      const txt = await upstreamRes.text();
      console.error('Upstream error', upstreamRes.status, txt);
      // If DeepSeek complains that the model doesn't exist, fall back to a local mock reply
      try {
        const parsed = JSON.parse(txt);
        const msg = parsed && parsed.error && parsed.error.message ? parsed.error.message : '';
        if (upstreamRes.status === 400 && msg && msg.toLowerCase().includes('model not exist')) {
          console.warn('Upstream responded Model Not Exist — returning mock reply and advising to set DEEPSEEK_MODEL in .env');
          const reply = mockReply(message);
          return res.json({ reply, note: 'Upstream model not found — using local mock. Set DEEPSEEK_MODEL in .env to a valid model name.' });
        }
      } catch (e) {
        // ignore parse errors
      }

      return res.status(502).json({ error: 'Upstream error', details: txt });
    }

    const data = await upstreamRes.json();
    // Try to extract a sensible reply from common response shapes (OpenAI-like / DeepSeek-like)
    let reply = null;
    if (data.reply) reply = data.reply;
    else if (data.choices && data.choices[0]) {
      const choice = data.choices[0];
      if (choice.message && choice.message.content) reply = choice.message.content;
      else if (choice.text) reply = choice.text;
    } else if (data.result) reply = data.result;
    else if (typeof data === 'string') reply = data;
    else reply = JSON.stringify(data);

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
  const streamText = async (text, delayMs = 40) => {
    try {
      // Set headers for chunked text streaming
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('X-Accel-Buffering', 'no');
      if (res.flushHeaders) res.flushHeaders();

      const words = String(text).split(/(\s+)/); // keep whitespace as tokens
      for (const w of words) {
        // Write the chunk. Clients will receive partial text.
        res.write(w);
        // small pause to create the streaming effect
        await new Promise((r) => setTimeout(r, delayMs));
      }
      // end the response
      res.end();
    } catch (err) {
      try { res.end(); } catch (e) {}
      console.error('Error streaming text', err);
    }
  };

  // If no API key or no upstream configured, stream a local mock reply
  if (!KEY || !UPSTREAM) {
    const reply = mockReply(message);
    return streamText(reply);
  }

  try {
    // Reuse the same payload logic as /api/chat
    const requestModel = (req.body && req.body.model) ? req.body.model : MODEL;
    let modelToSend = requestModel;
    if (!modelToSend) {
      const FALLBACK = process.env.DEEPSEEK_MODEL_FALLBACK || 'gpt-3.5';
      modelToSend = FALLBACK;
    }

    const payload = { model: modelToSend };
    payload.messages = buildMessagesFromRequest(req.body, message);

    const envTemp = process.env.DEEPSEEK_TEMPERATURE;
    const envMax = process.env.DEEPSEEK_MAX_TOKENS;
    const temperature = (typeof req.body.temperature !== 'undefined') ? parseFloat(req.body.temperature) : (envTemp ? parseFloat(envTemp) : undefined);
    const max_tokens = (typeof req.body.max_tokens !== 'undefined') ? parseInt(req.body.max_tokens, 10) : (envMax ? parseInt(envMax, 10) : undefined);
    const top_p = (typeof req.body.top_p !== 'undefined') ? parseFloat(req.body.top_p) : undefined;

    if (!Number.isNaN(temperature) && typeof temperature === 'number') payload.temperature = temperature;
    if (!Number.isNaN(max_tokens) && typeof max_tokens === 'number') payload.max_tokens = max_tokens;
    if (!Number.isNaN(top_p) && typeof top_p === 'number') payload.top_p = top_p;

    // Ask upstream for a normal (non-streaming) completion and then stream it to the client.
    const upstreamRes = await fetch(UPSTREAM, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!upstreamRes.ok) {
      const txt = await upstreamRes.text();
      console.error('Upstream error (stream)', upstreamRes.status, txt);
      try {
        const parsed = JSON.parse(txt);
        const msg = parsed && parsed.error && parsed.error.message ? parsed.error.message : '';
        if (upstreamRes.status === 400 && msg && msg.toLowerCase().includes('model not exist')) {
          const reply = mockReply(message);
          return streamText(reply);
        }
      } catch (e) {
        // ignore
      }
      return res.status(502).json({ error: 'Upstream error', details: txt });
    }

    const data = await upstreamRes.json();
    let reply = null;
    if (data.reply) reply = data.reply;
    else if (data.choices && data.choices[0]) {
      const choice = data.choices[0];
      if (choice.message && choice.message.content) reply = choice.message.content;
      else if (choice.text) reply = choice.text;
    } else if (data.result) reply = data.result;
    else if (typeof data === 'string') reply = data;
    else reply = JSON.stringify(data);

    return streamText(reply);
  } catch (err) {
    console.error('Error proxying to upstream (stream)', err);
    return res.status(500).json({ error: 'internal_error' });
  }
});

app.listen(PORT, () => {
  console.log(`Polvorina server listening on http://localhost:${PORT}`);
  // Optional: serve the frontend static files from the project root when requested.
  // In production (cPanel) you can set SERVE_STATIC=1 in the Node.js app environment
  // so this server will serve the frontend (index.html and static assets) from
  // the parent directory of backend (assumes repo layout where backend is a subfolder).
  try {
    const serveStaticFlag = String(process.env.SERVE_STATIC || '').toLowerCase();
    if (serveStaticFlag === '1' || serveStaticFlag === 'true') {
      const staticRoot = path.join(__dirname, '..');
      app.use(express.static(staticRoot));
      // Ensure index.html is served at root
      app.get('/', (req, res) => {
        res.sendFile(path.join(staticRoot, 'index.html'));
      });
      console.log('Serving static frontend from', staticRoot);
    }
  } catch (e) {
    console.warn('Could not enable static serving', e && e.message);
  }
});
