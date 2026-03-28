// Polvorina UI logic: send messages, show assistant replies (mock), clear, and request modal close.
// Uses the `sendToPolvorina` function from `polvorina-api.js` (or the global fallback `window.polvorinaApi`).

(function () {
	const $ = (sel, ctx = document) => ctx.querySelector(sel);
	const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

	const messagesEl = $('#messages');
	const inputEl = $('#input-text');
	const sendBtn = $('#btn-send');
	const clearBtn = $('#btn-clear');
	const closeBtn = $('#btn-close');

	function formatTimestamp() {
		const d = new Date();
		return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	function createMessageEl(text, who = 'assistant') {
		const wrap = document.createElement('div');
		wrap.className = `msg ${who}`;
		const bubble = document.createElement('div');
		bubble.className = 'bubble';
		bubble.textContent = text;
		const meta = document.createElement('div');
		meta.className = 'meta';
		meta.textContent = formatTimestamp();
		wrap.appendChild(bubble);
		wrap.appendChild(meta);
		return wrap;
	}

	function scrollToBottom() {
		messagesEl.scrollTop = messagesEl.scrollHeight;
	}

	async function sendMessage() {
		const text = inputEl.value.trim();
		if (!text) return;
		// append user message
		const userMsg = createMessageEl(text, 'user');
		messagesEl.appendChild(userMsg);
		inputEl.value = '';
		inputEl.style.height = '';
		scrollToBottom();

		// prepare assistant bubble for streaming reply
		const assistantMsg = createMessageEl('', 'assistant');
		assistantMsg.classList.add('typing');
		messagesEl.appendChild(assistantMsg);
		const assistantBubble = assistantMsg.querySelector('.bubble');
		scrollToBottom();

		// visually indicate loading: disable input and show spinner in send button
		try {
			sendBtn.classList.add('loading');
			sendBtn.setAttribute('aria-busy', 'true');
			sendBtn.disabled = true;
			inputEl.disabled = true;
			inputEl.setAttribute('aria-busy', 'true');
		} catch (e) {
			// ignore
		}

		// call API (prefer streaming API if available)
		let streamFn = null;
		try {
			if (typeof sendToPolvorinaStream === 'function') streamFn = sendToPolvorinaStream;
		} catch (e) {}
		if (!streamFn && window.polvorinaApi && window.polvorinaApi.sendToPolvorinaStream) {
			streamFn = window.polvorinaApi.sendToPolvorinaStream;
		}

		if (streamFn) {
			// stream tokens into assistant bubble
			try {
				await streamFn(text, (chunk) => {
					assistantBubble.textContent += chunk;
					scrollToBottom();
				});
			} catch (err) {
				assistantBubble.textContent = 'Error de conexión. Intenta de nuevo.';
				console.error('Polvorina streaming error', err);
			}
			// remove typing marker and finalize
			assistantMsg.classList.remove('typing');
		} else {
			// fallback to non-streaming API
			let apiFn = null;
			try {
				if (typeof sendToPolvorina === 'function') apiFn = sendToPolvorina;
			} catch (e) {}
			if (!apiFn) apiFn = (window.polvorinaApi && window.polvorinaApi.sendToPolvorina) || (msg => Promise.resolve({ reply: 'Polvorina no está disponible.' }));

			try {
				const res = await apiFn(text);
				assistantBubble.textContent = res && res.reply ? res.reply : 'Lo siento, hubo un error.';
			} catch (err) {
				assistantBubble.textContent = 'Error de conexión. Intenta de nuevo.';
				console.error('Polvorina API error', err);
			}
			assistantMsg.classList.remove('typing');
		}

		// restore input state
		sendBtn.classList.remove('loading');
		sendBtn.removeAttribute('aria-busy');
		sendBtn.disabled = false;
		inputEl.disabled = false;
		inputEl.removeAttribute('aria-busy');
		inputEl.focus();
	}

	function clearMessages() {
		messagesEl.innerHTML = '';
		// add a small assistant greeting
		const greeting = createMessageEl('Hola — soy Polvorina, la asistente cultural del Cerro. Preguntame por horarios, actividades o cómo participar.', 'assistant');
		messagesEl.appendChild(greeting);
		scrollToBottom();
		inputEl.focus();
	}

	function requestClose() {
		// ask parent to close the modal
		try {
			window.parent.postMessage({ type: 'polvorina-close' }, '*');
		} catch (e) {
			console.warn('No se pudo enviar postMessage para cerrar el modal', e);
		}
	}

	function autoResizeTextarea() {
		inputEl.style.height = 'auto';
		inputEl.style.height = Math.min(200, inputEl.scrollHeight) + 'px';
	}

	// Event bindings
	document.addEventListener('DOMContentLoaded', () => {
		if (!messagesEl || !inputEl) return;

		// initial greeting
		clearMessages();

		sendBtn.addEventListener('click', (e) => {
			e.preventDefault();
			sendMessage();
		});

		clearBtn.addEventListener('click', (e) => {
			e.preventDefault();
			clearMessages();
		});

		closeBtn.addEventListener('click', (e) => {
			e.preventDefault();
			requestClose();
		});

		inputEl.addEventListener('keydown', (ev) => {
			if (ev.key === 'Enter' && !ev.shiftKey) {
				ev.preventDefault();
				sendMessage();
			}
		});

		inputEl.addEventListener('input', autoResizeTextarea);
		// small accessibility: focus textarea on load
		setTimeout(() => inputEl.focus(), 300);
	});

	// expose for debugging
	window.polvorinaUI = {
		sendMessage,
		clearMessages,
		requestClose
	};

})();

