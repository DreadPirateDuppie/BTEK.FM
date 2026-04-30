/**
 * 📡 BTEK.FM // PROJECT SPEAKEASY
 * CORE LOGIC V.01
 */

document.addEventListener('DOMContentLoaded', () => {
    const igniteBtn = document.getElementById('ignite-signal');
    const playbackStatus = document.getElementById('playback-status');
    const masterVol = document.getElementById('master-vol');
    const voiceVol = document.getElementById('voice-vol');
    const zoneSelect = document.getElementById('zone-select');

    // 1. Placeholder for PeerJS Voice Comms
    const peer = new Peer(`unit_${Math.floor(Math.random() * 10000)}`, {
        debug: 2
    });

    peer.on('open', (id) => {
        console.log(`[SYSTEM] UNIT_ID: ${id}`);
        updateStatus(`[SYSTEM] UNIT_ID: ${id}\n[SYSTEM] CONNECTION_STABLE`);
    });

    // 2. Audio Signal State
    let isSignalActive = false;

    igniteBtn.addEventListener('click', () => {
        isSignalActive = !isSignalActive;
        
        if (isSignalActive) {
            igniteBtn.textContent = 'TERMINATE_SIGNAL';
            igniteBtn.style.backgroundColor = '#FF0000'; // RED ALARM
            playbackStatus.textContent = 'SIGNAL: BROADCASTING';
            updateStatus('[SYSTEM] SIGNAL_IGNITED // AMBIENT_MODE: ON');
        } else {
            igniteBtn.textContent = 'IGNITE_SIGNAL';
            igniteBtn.style.backgroundColor = 'var(--accent-color)';
            playbackStatus.textContent = 'SIGNAL: SILENT';
            updateStatus('[SYSTEM] SIGNAL_TERMINATED');
        }
    });

    // 3. Slider Logic
    masterVol.addEventListener('input', (e) => {
        console.log(`Master Volume: ${e.target.value}%`);
        // Logic to adjust global audio destination gain
    });

    voiceVol.addEventListener('input', (e) => {
        console.log(`Voice Mix: ${e.target.value}%`);
        // Logic to adjust PeerJS stream gain
    });

    // 4. Zone Switching
    zoneSelect.addEventListener('change', (e) => {
        updateStatus(`[SYSTEM] RE-ROUTING TO ZONE: ${e.target.value.toUpperCase()}`);
        // Logic to switch audio sources/filters based on zone
    });

    function updateStatus(msg) {
        const log = document.getElementById('status-log');
        log.textContent += `\n${msg}`;
    }
});
