// Frontend API wrapper for Polvorina.
// Sends the user's message to the server-side endpoint `/api/chat`.
// The server should keep the DEEPSEEK_API_KEY in `.env` and forward the request to the real provider.

/**
 * Send a user message to the server-side Polvorina endpoint.
 * @param {string} message
 * @returns {Promise<{reply: string}>}
 */
async function sendToPolvorina(message) {
	try {
		// Resolve endpoint:
		// Priority: query param `?api=...` in iframe URL -> global override window.POLVORINA_API_URL -> heuristics -> relative '/api/chat'
		let endpoint = '/api/chat';
		if (typeof window !== 'undefined') {
			try {
				const params = new URLSearchParams(window.location.search || '');
				const apiParam = params.get('api');
				if (apiParam) {
					endpoint = apiParam;
				} else if (window.POLVORINA_API_URL) {
					endpoint = window.POLVORINA_API_URL;
				} else if (window.location && window.location.protocol === 'file:') {
					endpoint = 'http://localhost:3000/api/chat';
				} else if (window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port && window.location.port !== '3000') {
					endpoint = 'http://localhost:3000/api/chat';
				}
			} catch (e) {
				// fallback to defaults
			}
		}

		let res = await fetch(endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ message })
		});

		// If we got 404/405 from the current origin, try the local backend on port 3000 as a fallback
		if (res && !res.ok && (res.status === 404 || res.status === 405)) {
			try {
				const fallback = 'http://localhost:3000/api/chat';
				if (!endpoint.includes('localhost:3000')) {
					console.warn('Primary API returned', res.status, '— retrying with', fallback);
					res = await fetch(fallback, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ message })
					});
				}
			} catch (e) {
				console.warn('Fallback fetch failed', e);
			}
		}

		if (!res.ok) {
			const txt = await res.text();
			console.error('Polvorina API error', res.status, txt);
			return { reply: 'Error del servidor al procesar la solicitud.' };
		}

		const data = await res.json();
		return { reply: data.reply || 'Sin respuesta del servidor.' };
	} catch (err) {
		console.error('Error enviando a /api/chat', err);
		return { reply: 'No se pudo conectar con el servidor. Intentá de nuevo más tarde.' };
	}
}

/**
 * Streamed version: POST to /api/chat/stream and read the chunked response.
 * onToken will be called repeatedly with partial text chunks as they arrive.
 * Returns a Promise that resolves when the stream ends.
 */
async function sendToPolvorinaStream(message, onToken) {
	try {
		// Resolve endpoint similarly, but point to the streaming route
		let endpoint = '/api/chat';
		if (typeof window !== 'undefined') {
			try {
				const params = new URLSearchParams(window.location.search || '');
				const apiParam = params.get('api');
				if (apiParam) {
					endpoint = apiParam;
				} else if (window.POLVORINA_API_URL) {
					endpoint = window.POLVORINA_API_URL;
				} else if (window.location && window.location.protocol === 'file:') {
					endpoint = 'http://localhost:3000/api/chat';
				} else if (window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port && window.location.port !== '3000') {
					endpoint = 'http://localhost:3000/api/chat';
				}
			} catch (e) {
				// fallback
			}
		}

		// target the stream path
		if (endpoint.endsWith('/api/chat')) endpoint = endpoint.replace(/\/api\/chat$/, '/api/chat/stream');
		else endpoint = endpoint.replace(/\/$/, '') + '/api/chat/stream';

		const res = await fetch(endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ message })
		});

		if (!res.ok) {
			const txt = await res.text();
			console.error('Polvorina stream API error', res.status, txt);
			throw new Error('Stream endpoint error');
		}

		if (!res.body) {
			// not a streaming body; fall back to json
			const data = await res.json();
			if (data && data.reply) onToken(data.reply);
			return;
		}

		const reader = res.body.getReader();
		const decoder = new TextDecoder();
		let done = false;
		while (!done) {
			const { value, done: d } = await reader.read();
			if (d) { done = true; break; }
			if (value) {
				const chunk = decoder.decode(value, { stream: true });
				// Call onToken with the raw chunk; caller will append it.
				try { onToken(chunk); } catch (e) { /* ignore */ }
			}
		}
		// stream finished
		return;
	} catch (err) {
		console.error('Error sending to polvorina stream', err);
		throw err;
	}
}

// Expose as globals for simple script usage
if (typeof window !== 'undefined') {
	window.polvorinaApi = window.polvorinaApi || {};
	window.polvorinaApi.sendToPolvorina = window.polvorinaApi.sendToPolvorina || ((msg) => sendToPolvorina(msg));
	window.polvorinaApi.sendToPolvorinaStream = window.polvorinaApi.sendToPolvorinaStream || ((msg, onToken) => sendToPolvorinaStream(msg, onToken));
	window.sendToPolvorina = window.sendToPolvorina || sendToPolvorina;
}
