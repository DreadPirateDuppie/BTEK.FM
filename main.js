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
    const voiceVol = document.getElementById('voice-vol');
    const zoneSelect = document.getElementById('zone-select');
    const ambientLoop = document.getElementById('ambient-loop');
    
    const dialIdInput = document.getElementById('dial-id');
    const dialBtn = document.getElementById('dial-btn');

    let localStream = null;
    let isSignalActive = false;
    let peer = null;

    // --- 1. INITIALIZE SOVEREIGN PEER ---
    function initPeer() {
        const uniqueId = `btek_unit_${Math.floor(Math.random() * 8888)}`;
        peer = new Peer(uniqueId, { debug: 2 });

        peer.on('open', (id) => {
            peerDisplay.textContent = id;
            updateLog(`[SYSTEM] UNIT_ID: ${id}\n> CONNECTION_ESTABLISHED`);
            addUnitToLobby(id, true);
        });

        peer.on('call', (call) => {
            updateLog(`[SYSTEM] INCOMING_SIGNAL_DETECTED...`);
            call.answer(localStream); // Answer with our mic stream
            handleCall(call);
        });

        peer.on('error', (err) => {
            updateLog(`[SYSTEM] ERROR: ${err.type.toUpperCase()}`);
        });
    }

    // --- 2. AUDIO ENGINE & MIXING ---
    async function igniteSignal() {
        try {
            // Request Microphone
            localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            updateLog(`[SYSTEM] MIC_CAPTURED // PIRATE_PROTOCOL_ACTIVE`);

            // Start Ambient Loop
            ambientLoop.volume = masterVol.value / 100;
            ambientLoop.play();
            
            isSignalActive = true;
            igniteBtn.textContent = 'TERMINATE_SIGNAL';
            igniteBtn.style.color = '#FF0000';
            playbackStatus.textContent = 'SIGNAL: BROADCASTING';
            
            updateLog(`[SYSTEM] AMBIENT_SYNC: COMPLETED`);

        } catch (err) {
            updateLog(`[SYSTEM] ACCESS_DENIED: MIC_REQUIRED_FOR_SIGNAL`);
            console.error(err);
        }
    }

    function terminateSignal() {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        ambientLoop.pause();
        isSignalActive = false;
        igniteBtn.textContent = 'IGNITE_SIGNAL';
        igniteBtn.style.color = '#FFD700';
        playbackStatus.textContent = 'SIGNAL: SILENT';
        updateLog(`[SYSTEM] SIGNAL_TERMINATED // NODE_OFFLINE`);
    }

    // --- 3. COMMUNICATIONS (DIALING) ---
    function dialUnit(targetId) {
        if (!localStream) {
            updateLog(`[SYSTEM] ERROR: MUST_IGNITE_SIGNAL_BEFORE_DIAL`);
            return;
        }
        updateLog(`[SYSTEM] ATTEMPTING_CONNECTION: ${targetId}`);
        const call = peer.call(targetId, localStream);
        handleCall(call);
    }

    function handleCall(call) {
        call.on('stream', (remoteStream) => {
            const audio = document.createElement('audio');
            audio.srcObject = remoteStream;
            audio.volume = voiceVol.value / 100;
            audio.play();
            updateLog(`[SYSTEM] AUDIO_LINK_SYNCED: ${call.peer}`);
            addUnitToLobby(call.peer);
        });
    }

    // --- 4. UI HANDLERS ---
    igniteBtn.addEventListener('click', () => {
        if (!isSignalActive) igniteSignal();
        else terminateSignal();
    });

    dialBtn.addEventListener('click', () => {
        const id = dialIdInput.value.trim();
        if (id) dialUnit(id);
    });

    masterVol.addEventListener('input', (e) => {
        ambientLoop.volume = e.target.value / 100;
    });

    zoneSelect.addEventListener('change', (e) => {
        updateLog(`[SYSTEM] RE-ROUTING TO ZONE: ${e.target.value.toUpperCase()}`);
    });

    function updateLog(msg) {
        statusLog.textContent += `\n> ${msg}`;
    }

    function addUnitToLobby(id, isSelf = false) {
        const li = document.createElement('li');
        li.textContent = ` ${id}${isSelf ? ' (HOST)' : ''}`;
        unitList.appendChild(li);
    }

    // Start Peer on load
    initPeer();
});
