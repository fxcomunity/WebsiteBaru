// Groq AI Chat Integration
const GROQ_API_KEY = 'YOUR_GROQ_API_KEY';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Gemini AI Integration
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const ADMIN_WA = '62895404147521';

// Model Selection
let currentModel = 'groq';

function changeAIModel() {
    const select = document.getElementById('aiModelSelect');
    if (select) {
        currentModel = select.value;
        let modelName = currentModel === 'groq' ? 'Groq (Llama 3)' : 'Gemini (Google)';
        addAIMessage(`🤖 Model AI diubah ke **${modelName}**.`);
    }
}

// === Token System ===
const TOKEN_KEY = 'fx_chat_tokens';
const TOKEN_DATE_KEY = 'fx_chat_token_date';
const MAX_TOKENS = 10;

function getTodayDate() {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function getTokens() {
    const saved = localStorage.getItem(TOKEN_KEY);
    const savedDate = localStorage.getItem(TOKEN_DATE_KEY);
    const today = getTodayDate();

    // Reset daily
    if (savedDate !== today || saved === null) {
        localStorage.setItem(TOKEN_KEY, MAX_TOKENS);
        localStorage.setItem(TOKEN_DATE_KEY, today);
        return MAX_TOKENS;
    }

    return parseInt(saved, 10);
}

function useToken() {
    const current = getTokens();
    if (current <= 0) return false;
    localStorage.setItem(TOKEN_KEY, current - 1);
    return true;
}

function updateTokenUI() {
    const isAdmin = sessionStorage.getItem('fx_isAdmin') === '1';
    const tokenCount = document.getElementById('tokenCount');
    const tokenDisplay = document.getElementById('tokenDisplay');
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');

    if (isAdmin) {
        if (tokenDisplay) tokenDisplay.innerHTML = '<i class="fas fa-shield-alt"></i> Admin — Unlimited';
        if (tokenDisplay) tokenDisplay.classList.remove('token-low', 'token-empty');
        if (tokenDisplay) tokenDisplay.classList.add('token-admin');
        return;
    }

    const remaining = getTokens();

    if (tokenCount) tokenCount.textContent = remaining;

    if (tokenDisplay) {
        tokenDisplay.classList.remove('token-low', 'token-empty', 'token-admin');
        if (remaining === 0) {
            tokenDisplay.classList.add('token-empty');
        } else if (remaining <= 3) {
            tokenDisplay.classList.add('token-low');
        }
    }

    // Block input if no tokens
    if (remaining === 0) {
        if (input) {
            input.disabled = true;
            input.placeholder = 'Token habis. Kembali besok atau hubungi admin.';
        }
        if (sendBtn) sendBtn.disabled = true;
    } else {
        if (input) {
            input.disabled = false;
            input.placeholder = 'Ketik pesan...';
        }
        if (sendBtn) sendBtn.disabled = false;
    }
}

// === State ===
let isChatOpen = false;
let isMinimized = false;
let chatHistory = [];

// === Contact Flow State ===
let contactFlowActive = false;
let contactFlowStep = null;
let contactData = { name: '', message: '' };

// ======= Time Helpers =======
function getTimeString() {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Selamat Pagi';
    else if (hour >= 12 && hour < 15) return 'Selamat Siang';
    else if (hour >= 15 && hour < 18) return 'Selamat Sore';
    else return 'Selamat Malam';
}

// ======= Initialize Chat =======
function initChat() {
    const isAdmin = sessionStorage.getItem('fx_isAdmin') === '1';
    const adminName = sessionStorage.getItem('fx_adminName') || 'Min';
    const greeting = getGreeting();
    const userGreeting = isAdmin ? `${greeting}, ${adminName}!` : `${greeting}!`;

    chatHistory = [
        {
            role: "system",
            content: `Anda adalah asisten CS (Customer Service) profesional untuk website "FX Community - Koleksi PDF Trading".
            
            Tugas Anda adalah membantu pengunjung menemukan materi trading yang tepat. Selalu gunakan bahasa ramah dan sopan.
            
            Konteks Website:
            - Koleksi lengkap PDF materi forex, saham, dan analisis teknikal.
            - Fitur: Music Player, Gempabumi, dan Favorit.
            - Kontak Admin: WhatsApp tersedia di sidebar.
            
            PDF Unggulan: "The Psychology of Money", "Smart Money Concept (SMC)", "Supply and Demand",
            "Chart Pattern & Candlesticks", "ICT Concepts" (Order Block, Liquidity, MMXM), "Crypto Trading Guide".
            
            Panduan:
            - Pemula → sarankan "Pengenalan Forex" atau "Basic Teknikal & Fundamental".
            - Lanjut → sarankan "SMC", "ICT", atau "Orderflow".
            - Saham → informasikan materi BEI segera hadir (Coming Soon).
            - Gunakan emoji sesekali, jawab ringkas dan to-the-point.
            `
        }
    ];

    addDateSeparator();
    addAIMessage(`${userGreeting} Saya **FX Assistant** 🤖, CS digital FX Community.\n\nSaya siap membantu Anda menemukan materi trading yang tepat, atau jika ingin menghubungi admin klik **📞 Hubungi Admin** di bawah.`);
    updateTokenUI();
}

// ======= Hubungi Kami Flow =======
function startContactFlow() {
    const qr = document.getElementById('quickReplies');
    if (qr) qr.classList.add('hidden');
    contactFlowActive = true;
    contactFlowStep = 'name';
    contactData = { name: '', message: '' };
    addAIMessage(`Tentu! Saya akan bantu menghubungkan Anda dengan admin 📲\n\nMohon tuliskan **nama lengkap** Anda terlebih dahulu:`);
    focusInput('Nama kamu...');
}

function handleContactFlow(text) {
    if (contactFlowStep === 'name') {
        contactData.name = text;
        contactFlowStep = 'message';
        addUserMessage(text);
        setTimeout(() => {
            addAIMessage(`Halo **${text}** 👋\n\nSekarang tuliskan **pesan atau pertanyaan** yang ingin disampaikan ke admin:`);
            focusInput('Tuliskan pesanmu...');
        }, 400);
        return true;
    }
    if (contactFlowStep === 'message') {
        contactData.message = text;
        contactFlowStep = null;
        contactFlowActive = false;
        addUserMessage(text);
        setTimeout(() => showContactSummary(), 400);
        return true;
    }
    return false;
}

function showContactSummary() {
    const waText = encodeURIComponent(
        `Halo Admin FX Community! 👋\n\nNama: ${contactData.name}\nPesan: ${contactData.message}\n\n(Dikirim via FX Assistant Chat)`
    );
    const waUrl = `https://wa.me/${ADMIN_WA}?text=${waText}`;
    addAIMessageHTML(`
        ✅ Pesan siap dikirim!<br><br>
        📋 <strong>Ringkasan:</strong><br>
        👤 Nama: <strong>${escapeHtml(contactData.name)}</strong><br>
        💬 Pesan: <em>${escapeHtml(contactData.message)}</em><br><br>
        <a href="${waUrl}" target="_blank" class="wa-send-btn">
            <i class="fab fa-whatsapp"></i> Kirim ke WhatsApp Admin
        </a>
        <br><br>
        <button class="contact-again-btn" onclick="startContactFlow()">🔄 Ubah Pesan</button>
    `);
    setTimeout(() => {
        const qr = document.getElementById('quickReplies');
        if (qr) qr.classList.remove('hidden');
    }, 1000);
}

function focusInput(placeholder) {
    const input = document.getElementById('chatInput');
    if (input && !input.disabled) {
        input.placeholder = placeholder;
        input.focus();
    }
}

// ======= Toggle / Minimize =======
function toggleGroqChat() {
    const widget = document.getElementById('groqChatWidget');
    const btn = document.getElementById('groqFloatingBtn');
    const badge = document.getElementById('fabBadge');
    const tooltip = document.querySelector('.fab-tooltip');

    isChatOpen = !isChatOpen;

    if (isChatOpen) {
        if (badge) badge.classList.add('hidden');
        if (tooltip) tooltip.style.display = 'none';
        widget.style.display = 'flex';
        widget.classList.remove('minimized');
        isMinimized = false;
        if (btn) btn.style.display = 'none';
        setTimeout(() => {
            widget.classList.add('active');
            updateTokenUI();
            const input = document.getElementById('chatInput');
            if (input && !input.disabled) input.focus();
        }, 10);
    } else {
        contactFlowActive = false;
        contactFlowStep = null;
        widget.classList.remove('active');
        setTimeout(() => {
            widget.style.display = 'none';
            if (btn) btn.style.display = 'flex';
        }, 350);
    }
}

function minimizeChat() {
    const widget = document.getElementById('groqChatWidget');
    isMinimized = !isMinimized;
    widget.classList.toggle('minimized', isMinimized);
}

// ======= Input Handlers =======
function handleChatInput(event) {
    if (event.key === 'Enter') sendMessage();
}

function sendQuickReply(text) {
    const qr = document.getElementById('quickReplies');
    if (qr) qr.classList.add('hidden');
    const input = document.getElementById('chatInput');
    if (input) input.value = text;
    sendMessage();
}

// ======= Send Message =======
async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;
    input.value = '';
    input.placeholder = 'Ketik pesan...';

    // Route to contact flow if active (doesn't cost tokens)
    if (contactFlowActive && contactFlowStep) {
        handleContactFlow(message);
        return;
    }

    // Check tokens (admin bypass)
    const isAdmin = sessionStorage.getItem('fx_isAdmin') === '1';
    if (!isAdmin) {
        const canSend = useToken();
        if (!canSend) {
            updateTokenUI();
            showNoTokensMessage();
            return;
        }
        updateTokenUI();
    }

    // Hide quick replies on first real message
    const qr = document.getElementById('quickReplies');
    if (qr) qr.classList.add('hidden');

    addUserMessage(message);
    chatHistory.push({ role: "user", content: message });

    // Keyword → contact flow
    const lower = message.toLowerCase();
    if (lower.includes('hubungi') || lower.includes('contact') || lower.includes('kontak') || lower.includes('wa') || lower.includes('whatsapp')) {
        setTimeout(() => startContactFlow(), 300);
        return;
    }

    const typingId = showTypingIndicator();

    try {
        let aiText = '';
        if (currentModel === 'groq') {
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: chatHistory,
                    model: "llama-3.3-70b-versatile",
                    temperature: 0.7,
                    max_tokens: 1024
                })
            });
            if (!response.ok) throw new Error(`Groq API Error: ${response.status}`);
            const data = await response.json();
            aiText = data.choices[0].message.content;
        } else {
            // Gemini API
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        role: 'user',
                        parts: [{ text: chatHistory.map(h => h.content).join('\n') }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1024,
                    }
                })
            });
            if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);
            const data = await response.json();
            aiText = data.candidates[0].content.parts[0].text;
        }

        removeTypingIndicator(typingId);
        addAIMessage(aiText);
        chatHistory.push({ role: "assistant", content: aiText });

    } catch (error) {
        console.error('AI Error:', error);
        removeTypingIndicator(typingId);
        addAIMessage('Maaf, terjadi gangguan koneksi. Silakan coba lagi ya 🙏');
    }
}

function showNoTokensMessage() {
    const waUrl = `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent('Halo Admin FX Community! Saya ingin meminta tambahan token chat AI.')}`;
    addAIMessageHTML(`
        ⚡ <strong>Token Anda habis!</strong><br><br>
        Token akan direset otomatis besok. Anda masih bisa menggunakan tombol 📞 Hubungi Admin untuk menghubungi kami langsung.<br><br>
        <a href="${waUrl}" target="_blank" class="wa-send-btn">
            <i class="fab fa-whatsapp"></i> Hubungi Admin
        </a>
    `);
}

// ======= UI Helpers =======
function addDateSeparator() {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const sep = document.createElement('div');
    sep.className = 'chat-date-separator';
    sep.textContent = today;
    container.appendChild(sep);
}

function addUserMessage(text) {
    const container = document.getElementById('chatMessages');
    const row = document.createElement('div');
    row.className = 'message-row user-row';
    row.innerHTML = `
        <div class="message-wrap">
            <div class="message-bubble">${escapeHtml(text)}</div>
            <div class="msg-time">${getTimeString()}</div>
        </div>
    `;
    container.appendChild(row);
    scrollToBottom();
}

function addAIMessage(text) {
    const container = document.getElementById('chatMessages');
    const row = document.createElement('div');
    row.className = 'message-row ai-row';
    row.innerHTML = `
        <div class="msg-avatar">CS</div>
        <div class="message-wrap">
            <div class="message-bubble">${formatText(text)}</div>
            <div class="msg-time">FX Assistant &bull; ${getTimeString()}</div>
        </div>
    `;
    container.appendChild(row);
    scrollToBottom();
}

function addAIMessageHTML(html) {
    const container = document.getElementById('chatMessages');
    const row = document.createElement('div');
    row.className = 'message-row ai-row';
    row.innerHTML = `
        <div class="msg-avatar">CS</div>
        <div class="message-wrap">
            <div class="message-bubble">${html}</div>
            <div class="msg-time">FX Assistant &bull; ${getTimeString()}</div>
        </div>
    `;
    container.appendChild(row);
    scrollToBottom();
}

function showTypingIndicator() {
    const container = document.getElementById('chatMessages');
    const id = 'typing-' + Date.now();
    const row = document.createElement('div');
    row.className = 'message-row ai-row';
    row.id = id;
    row.innerHTML = `
        <div class="msg-avatar">CS</div>
        <div class="message-wrap">
            <div class="message-bubble">
                <div class="typing-dots"><span></span><span></span><span></span></div>
            </div>
        </div>
    `;
    container.appendChild(row);
    scrollToBottom();
    return id;
}

function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function formatText(text) {
    return escapeHtml(text)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function scrollToBottom() {
    const container = document.getElementById('chatMessages');
    if (container) container.scrollTop = container.scrollHeight;
}

// Init on DOM ready
document.addEventListener('DOMContentLoaded', initChat);
