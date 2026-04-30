/**
 * 📡 BTEK.FM // PROJECT SPEAKEASY
 * FUNCTIONAL CORE V.01 // PIRATE EDITION
 */

document.addEventListener('DOMContentLoaded', () => {
    const igniteBtn = document.getElementById('ignite-signal');
    const playbackStatus = document.getElementById('playback-status');
    const peerDisplay = document.getElementById('peer-display');
    const unitList = document.getElementById('unit-list');
    const statusLog = document.getElementById('status-log');
    
    const masterVol = document.getElementById('master-vol');
    const zoneSelect = document.getElementById('zone-select');
    const ambientLoop = document.getElementById('ambient-loop');
    
    const dialIdInput = document.getElementById('dial-id');
    const dialBtn = document.getElementById('dial-btn');
    const chatInput = document.getElementById('chat-input');

    let localStream = null;
    let isSignalActive = false;
    let peer = null;
    let connections = {}; // Store active data connections

    // --- 1. INITIALIZE SOVEREIGN PEER ---
    function initPeer() {
        const uniqueId = `btek_unit_${Math.floor(Math.random() * 8888)}`;
        peer = new Peer(uniqueId, { debug: 2 });

        peer.on('open', (id) => {
            peerDisplay.textContent = id;
            updateLog(`[SYSTEM] UNIT_ID: ${id}\n> CONNECTION_ESTABLISHED`);
            addUnitToLobby(id, true);
        });

        // Handle Incoming Connections
        peer.on('connection', (conn) => {
            setupDataConnection(conn);
            updateLog(`[SYSTEM] DATA_LINK_SYNCED: ${conn.peer}`);
        });

        peer.on('call', (call) => {
            updateLog(`[SYSTEM] INCOMING_VOICE_DETECTED...`);
            call.answer(localStream);
            handleVoiceStream(call);
        });

        peer.on('error', (err) => {
            updateLog(`[SYSTEM] ERROR: ${err.type.toUpperCase()}`);
        });
    }

    function setupDataConnection(conn) {
        connections[conn.peer] = conn;
        conn.on('data', (data) => {
            updateLog(`[${conn.peer}] ${data}`);
        });
        addUnitToLobby(conn.peer);
    }

    // --- 2. AUDIO ENGINE ---
    async function igniteSignal() {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            updateLog(`[SYSTEM] MIC_CAPTURED // PIRATE_PROTOCOL_ACTIVE`);

            ambientLoop.volume = masterVol.value / 100;
            ambientLoop.play();
            
            isSignalActive = true;
            igniteBtn.textContent = 'TERMINATE_SIGNAL';
            igniteBtn.style.color = '#FF0000';
            playbackStatus.textContent = 'SIGNAL: BROADCASTING';
            updateLog(`[SYSTEM] AMBIENT_SYNC: COMPLETED`);
        } catch (err) {
            updateLog(`[SYSTEM] ACCESS_DENIED: MIC_REQUIRED_FOR_VOICE`);
        }
    }

    function terminateSignal() {
        if (localStream) localStream.getTracks().forEach(track => track.stop());
        ambientLoop.pause();
        isSignalActive = false;
        igniteBtn.textContent = 'IGNITE_SIGNAL';
        igniteBtn.style.color = '#FFD700';
        playbackStatus.textContent = 'SIGNAL: SILENT';
        updateLog(`[SYSTEM] SIGNAL_TERMINATED`);
    }

    // --- 3. COMMUNICATIONS ---
    function connectToUnit(targetId) {
        updateLog(`[SYSTEM] ATTEMPTING_LINK: ${targetId}`);
        
        // 1. Data Link (Chat)
        const conn = peer.connect(targetId);
        setupDataConnection(conn);

        // 2. Voice Link (If signal ignited)
        if (localStream) {
            const call = peer.call(targetId, localStream);
            handleVoiceStream(call);
        }
    }

    function handleVoiceStream(call) {
        call.on('stream', (remoteStream) => {
            const audio = document.createElement('audio');
            audio.srcObject = remoteStream;
            audio.play();
            updateLog(`[SYSTEM] VOICE_SYNCED: ${call.peer}`);
        });
    }

    function broadcastMessage(msg) {
        Object.values(connections).forEach(conn => {
            if (conn.open) conn.send(msg);
        });
        updateLog(`[YOU] ${msg}`);
    }

    // --- 4. UI HANDLERS ---
    igniteBtn.addEventListener('click', () => {
        if (!isSignalActive) igniteSignal();
        else terminateSignal();
    });

    dialBtn.addEventListener('click', () => {
        const id = dialIdInput.value.trim();
        if (id) connectToUnit(id);
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const msg = chatInput.value.trim();
            if (msg) {
                broadcastMessage(msg);
                chatInput.value = '';
            }
        }
    });

    masterVol.addEventListener('input', (e) => {
        ambientLoop.volume = e.target.value / 100;
    });

    zoneSelect.addEventListener('change', (e) => {
        updateLog(`[SYSTEM] RE-ROUTING TO ZONE: ${e.target.value.toUpperCase()}`);
    });

    function updateLog(msg) {
        statusLog.textContent += `\n> ${msg}`;
        const container = document.getElementById('status-log-container');
        container.scrollTop = container.scrollHeight;
    }

    function addUnitToLobby(id, isSelf = false) {
        const li = document.createElement('li');
        li.textContent = ` ${id}${isSelf ? ' (HOST)' : ''}`;
        unitList.appendChild(li);
    }

    initPeer();
});
