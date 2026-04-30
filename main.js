/**
 * 📡 BTEK.FM // PROJECT SPEAKEASY
 * FUNCTIONAL CORE V.02 // STRICT TERMINAL EDITION
 */

document.addEventListener('DOMContentLoaded', () => {
    const igniteBtn = document.getElementById('ignite-signal');
    const playbackStatus = document.getElementById('playback-status');
    const peerDisplay = document.getElementById('peer-id');
    const statusLog = document.getElementById('status-log');
    const logWindow = document.getElementById('log-window');
    
    const masterVol = document.getElementById('master-vol');
    const ambientLoop = document.getElementById('ambient-loop');
    
    const dialIdInput = document.getElementById('dial-id');
    const dialBtn = document.getElementById('dial-btn');
    const chatInput = document.getElementById('chat-input');
    const zoneBtns = document.querySelectorAll('.zone-btn');

    let localStream = null;
    let isSignalActive = false;
    let peer = null;
    let connections = {};
    let currentZone = 'main';

    // --- 1. PEERJS INIT ---
    function initPeer() {
        const uniqueId = `btek_unit_${Math.floor(Math.random() * 8888)}`;
        peer = new Peer(uniqueId, { debug: 2 });

        peer.on('open', (id) => {
            peerDisplay.textContent = id;
            updateLog(`UNIT_ID_SECURED: ${id}`);
        });

        peer.on('connection', (conn) => {
            setupDataConnection(conn);
            updateLog(`DATA_LINK_ESTABLISHED: ${conn.peer}`);
        });

        peer.on('call', (call) => {
            updateLog(`INCOMING_VOICE_LINK...`);
            call.answer(localStream);
            handleVoiceStream(call);
        });
    }

    function setupDataConnection(conn) {
        connections[conn.peer] = conn;
        conn.on('data', (data) => {
            updateLog(`[${conn.peer}] ${data}`);
        });
    }

    // --- 2. AUDIO LOGIC ---
    async function igniteSignal() {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            updateLog(`MIC_CAPTURED // PIRATE_PROTOCOL: ON`);

            ambientLoop.volume = masterVol.value / 100;
            ambientLoop.play();
            
            isSignalActive = true;
            igniteBtn.textContent = '[ TERMINATE_SIGNAL ]';
            igniteBtn.classList.add('accent-red');
            playbackStatus.textContent = 'BROADCASTING';
            updateLog(`AMBIENT_SYNC: COMPLETE`);
        } catch (err) {
            updateLog(`ACCESS_DENIED: MIC_REQUIRED`);
        }
    }

    function terminateSignal() {
        if (localStream) localStream.getTracks().forEach(t => t.stop());
        ambientLoop.pause();
        isSignalActive = false;
        igniteBtn.textContent = '[ IGNITE_SIGNAL ]';
        igniteBtn.classList.remove('accent-red');
        playbackStatus.textContent = 'SILENT';
        updateLog(`SIGNAL_TERMINATED`);
    }

    // --- 3. UI HANDLERS ---
    zoneBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            zoneBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentZone = btn.dataset.zone;
            updateLog(`RE-ROUTING_TO_ZONE: ${currentZone.toUpperCase()}`);
        });
    });

    igniteBtn.addEventListener('click', () => {
        if (!isSignalActive) igniteSignal();
        else terminateSignal();
    });

    dialBtn.addEventListener('click', () => {
        const id = dialIdInput.value.trim();
        if (id) {
            updateLog(`ATTEMPTING_LINK: ${id}`);
            const conn = peer.connect(id);
            setupDataConnection(conn);
            if (localStream) peer.call(id, localStream);
        }
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const msg = chatInput.value.trim();
            if (msg) {
                Object.values(connections).forEach(c => c.open && c.send(msg));
                updateLog(`[YOU] ${msg}`);
                chatInput.value = '';
            }
        }
    });

    masterVol.addEventListener('input', (e) => {
        ambientLoop.volume = e.target.value / 100;
    });

    function updateLog(msg) {
        statusLog.textContent += `\n> ${msg}`;
        logWindow.scrollTop = logWindow.scrollHeight;
    }

    initPeer();
});
