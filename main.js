/**
 * 📡 BTEK.FM // PROJECT SPEAKEASY
 * FUNCTIONAL CORE V.03 // SOVEREIGN STREAM EDITION
 */

document.addEventListener('DOMContentLoaded', () => {
    const igniteBtn = document.getElementById('ignite-signal');
    const playbackStatus = document.getElementById('playback-status');
    const peerDisplay = document.getElementById('peer-id');
    const logWindow = document.getElementById('log-window');
    const unitCount = document.getElementById('unit-count');
    
    const ambientLoop = document.getElementById('ambient-loop');
    const masterVol = document.getElementById('master-vol');
    
    const dialIdInput = document.getElementById('dial-id');
    const dialBtn = document.getElementById('dial-btn');
    const chatInput = document.getElementById('chat-input');
    const zoneBtns = document.querySelectorAll('.zone-btn');

    let localStream = null;
    let isSignalActive = false;
    let peer = null;
    let connections = {};
    let currentZone = 'main';
    let connectedPeers = new Set();

    // --- 1. PEERJS INIT ---
    function initPeer() {
        const uniqueId = `btek_unit_${Math.floor(Math.random() * 8888)}`;
        peer = new Peer(uniqueId, { debug: 2 });

        peer.on('open', (id) => {
            peerDisplay.textContent = id;
            peerDisplay.classList.remove('dim');
            peerDisplay.classList.add('gold');
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
        connectedPeers.add(conn.peer);
        updateUnitCount();
        
        conn.on('data', (data) => {
            updateLog(`[${conn.peer}] ${data}`);
        });
        
        conn.on('close', () => {
            connectedPeers.delete(conn.peer);
            delete connections[conn.peer];
            updateUnitCount();
            updateLog(`DATA_LINK_LOST: ${conn.peer}`);
        });
    }

    // --- 2. AUDIO LOGIC (SOVEREIGN STREAM) ---
    async function igniteSignal() {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            updateLog(`MIC_CAPTURED // PIRATE_PROTOCOL: ON`);

            // LINK TO SOVEREIGN OWNCAST SIGNAL
            // Replace with your actual tunnel URL when live (e.g., https://live.pushinn.app/hls/stream.m3u8)
            const streamUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; 
            
            ambientLoop.src = streamUrl;
            ambientLoop.volume = masterVol.value / 100;
            ambientLoop.play();
            
            isSignalActive = true;
            igniteBtn.textContent = '[ TERMINATE_SIGNAL ]';
            igniteBtn.classList.add('red');
            playbackStatus.textContent = 'ACTIVE';
            playbackStatus.classList.remove('red');
            playbackStatus.classList.add('gold');
            updateLog(`SOVEREIGN_SIGNAL_SYNCED: SUCCESS`);
            
            if(!peer) initPeer();
        } catch (err) {
            updateLog(`ACCESS_DENIED: MIC_REQUIRED`);
        }
    }

    function terminateSignal() {
        if (localStream) localStream.getTracks().forEach(t => t.stop());
        ambientLoop.pause();
        isSignalActive = false;
        igniteBtn.textContent = '[ INITIALIZE_SIGNAL ]';
        igniteBtn.classList.remove('red');
        playbackStatus.textContent = 'OFFLINE';
        playbackStatus.classList.remove('gold');
        playbackStatus.classList.add('red');
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
        if (id && peer) {
            updateLog(`ATTEMPTING_LINK: ${id}`);
            const conn = peer.connect(id);
            setupDataConnection(conn);
            if (localStream) {
                const call = peer.call(id, localStream);
                handleVoiceStream(call);
            }
            dialIdInput.value = '';
        }
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const msg = chatInput.value.trim();
            if (msg && Object.keys(connections).length > 0) {
                Object.values(connections).forEach(c => c.open && c.send(msg));
                updateLog(`[YOU] ${msg}`);
                chatInput.value = '';
            } else if (msg) {
                updateLog(`[SYSTEM] NO_ACTIVE_LINKS_TO_BROADCAST`);
                chatInput.value = '';
            }
        }
    });

    function updateLog(msg) {
        const entry = document.createElement('div');
        entry.textContent = `> ${msg}`;
        logWindow.appendChild(entry);
        logWindow.scrollTop = logWindow.scrollHeight;
    }
    
    function updateUnitCount() {
        unitCount.textContent = connectedPeers.size;
    }

    function handleVoiceStream(call) {
        call.on('stream', (remoteStream) => {
            const audio = document.createElement('audio');
            audio.srcObject = remoteStream;
            audio.play();
            updateLog(`VOICE_SYNCED: ${call.peer}`);
            connectedPeers.add(call.peer);
            updateUnitCount();
        });
    }
});
