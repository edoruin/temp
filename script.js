const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_TOKEN = "HF_TOKEN_PLACEHOLDER";

let skillsData = [];

const SYSTEM_PROMPT = `Eres un tutor amigable y paciente para estudiantes de 1ero de secundaria (11-12 años). 
Tu nombre es "Ayudante de Programación". 
Estás ayudando a los estudiantes a aprender programación a través de una plataforma educativa llamada "Programación con Propósito".
El tema del curso es "Tecnología con Propósito: Salvando el Ecosistema y la Creatividad".
Los estudiantes aprenden mediante retos de programación interactivos relacionados con IA, lógica de bloques, y desarrollo de juegos.

Tienes acceso a información sobre cada reto (sus SKILLS). Cuando un estudiante pregunte sobre un reto específico, usa esa información para ayudar.
Cuando el estudiante no pueda avanzar en un reto, dale pistas SIN dar la solución directa. Anímalo a pensar por sí mismo.
Usa un lenguaje sencillo, amigable y motivate. Usa emojis ocasionalmente.
Si no sabes algo, sé honesto y dime que buscarás la respuesta.

REGLAS IMPORTANTES:
1. Siempre sé paciente y amable
2. NO des la solución directa - guía al estudiante para que la descubra
3. Usa el nombre del estudiante si lo已知
4. celebrated los logros y esfuerzos
5. Si el estudiante pregunta algo fuera del contexto del curso, gentle redirect hacia los retos`;

async function loadSkills() {
    const skillFiles = [
        'skills/ai-birds.json',
        'skills/ocean-ai.json',
        'skills/blockly.json',
        'skills/codemonkey.json',
        'skills/scratch.json',
        'skills/code-art.json',
        'skills/codecombat.json',
        'skills/sports-game.json'
    ];

    for (const file of skillFiles) {
        try {
            const response = await fetch(file);
            const data = await response.json();
            skillsData.push(data);
        } catch (error) {
            console.error(`Error cargando ${file}:`, error);
        }
    }
}

async function loadRetos() {
    try {
        const response = await fetch('data/links.json');
        const data = await response.json();
        renderRetos(data.retos);
    } catch (error) {
        console.error('Error cargando retos:', error);
        document.getElementById('retosGrid').innerHTML = '<p>Error al cargar los retos</p>';
    }
}

function renderRetos(retos) {
    const grid = document.getElementById('retosGrid');
    grid.innerHTML = '';

    retos.forEach(reto => {
        const card = document.createElement('div');
        card.className = 'reto-card';
        
        card.innerHTML = `
            <div class="reto-header">
                <span class="reto-icon">${reto.icono}</span>
                <span class="reto-dia">Día ${reto.dia}</span>
            </div>
            <div class="reto-body">
                <h3 class="reto-title">${reto.titulo}</h3>
                <p class="reto-desc">${reto.descripcion}</p>
                <div class="reto-meta">
                    <span class="reto-tag">${reto.fase}</span>
                    <span class="reto-tag">${reto.categoria}</span>
                </div>
                <button class="reto-btn" onclick="openReto(${reto.id}, '${reto.url}')">
                    🎮 ¡Empezar!
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function isRetoCompleted(id) {
    const progress = JSON.parse(localStorage.getItem('progreso_retos') || '[]');
    return progress.includes(id);
}

function openReto(id, url) {
    window.open(url, '_blank');
}

function markRetoCompleted(id) {
    const progress = JSON.parse(localStorage.getItem('progreso_retos') || '[]');
    if (!progress.includes(id)) {
        progress.push(id);
        localStorage.setItem('progreso_retos', JSON.stringify(progress));
        loadRetos();
    }
}

function loadProgress() {
    const progress = JSON.parse(localStorage.getItem('progreso_retos') || '[]');
    const percentage = Math.round((progress.length / 8) * 100);
    document.getElementById('progressFill').style.width = percentage + '%';
    document.getElementById('progressText').textContent = progress.length;
}

function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;

            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });
}

function setupChat() {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const status = document.getElementById('chatStatus');
    const message = input.value.trim();

    if (!message) return;

    if (!HF_TOKEN || HF_TOKEN.length < 10) {
        addMessage(message, 'user');
        addMessage('⚠️ Necesitas un token de HuggingFace para usar el chatbot. Ingrésalo cuando te lo pida.', 'bot');
        input.value = '';
        return;
    }

    addMessage(message, 'user');
    input.value = '';
    sendBtn.disabled = true;
    status.textContent = '🤔 Pensando...';
    status.classList.add('loading');

    try {
        const response = await getAgentResponse(message);
        addMessage(response, 'bot');
    } catch (error) {
        console.error('Error:', error);
        addMessage('😔 Lo siento, tuve un problema al responder. Intenta de nuevo.', 'bot');
    }

    sendBtn.disabled = false;
    status.textContent = '';
    status.classList.remove('loading');
}

function addMessage(text, type) {
    const messages = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = `message ${type === 'user' ? 'user-message' : 'bot-message'}`;
    div.innerHTML = `<p>${text}</p>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

async function getAgentResponse(userMessage) {
    const skillsContext = skillsData.map(skill => 
        `- ${skill.nombre} (Día ${skill.dia}): ${skill.descripcion}. Objetivos: ${skill.objetivo}. Consejos: ${skill.consejos.join(', ')}`
    ).join('\n');

    const fullPrompt = `${SYSTEM_PROMPT}

INFORMACIÓN DE RETOS DISPONIBLES:
${skillsContext}

PREGUNTA DEL ESTUDIANTE: ${userMessage}`;

    const response = await fetch(HF_API_URL, {
        headers: {
            'Authorization': `Bearer ${HF_TOKEN}`,
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            model: "meta-llama/Llama-3.2-1B-Instruct",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "system", content: "INFORMACIÓN DE RETOS DISPONIBLES:\n" + skillsContext },
                { role: "user", content: userMessage }
            ],
            max_tokens: 300,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error('API request failed: ' + errorText);
    }

    const result = await response.json();
    return result.choices?.[0]?.message?.content || result[0]?.generated_text || 'Lo siento, no pude generar una respuesta.';
}

document.addEventListener('DOMContentLoaded', () => {
    loadSkills();
    loadRetos();
    setupTabs();
    setupChat();
});