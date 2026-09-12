// soundtrack.js - Reproductor flotante Chill Techno para Masajistas Privé
(function() {
    // Contenedor flotante en la esquina inferior izquierda
    const playerContainer = document.createElement('div');
    playerContainer.style.cssText = "position: fixed; bottom: 20px; left: 20px; z-index: 9999; background: rgba(18, 18, 18, 0.85); backdrop-filter: blur(5px); border: 1px solid #dfbc63; border-radius: 30px; padding: 6px 14px; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.6); font-family: sans-serif;";
    
    playerContainer.innerHTML = `
        <span style="color: #dfbc63; font-size: 0.8em; font-weight: 600; letter-spacing: 0.5px;">🎧 Soundtrack Chill</span>
        <audio id="priveAudio" loop preload="none">
            <source src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf756.mp3?filename=deep-ambient-chill-11082.mp3" type="audio/mpeg">
        </audio>
        <button id="privePlayBtn" onclick="window.togglePriveMusic()" style="background: #dfbc63; color: #121212; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center; font-size: 0.85em;">▶</button>
    `;
    
    document.body.appendChild(playerContainer);

    window.togglePriveMusic = function() {
        const audio = document.getElementById('priveAudio');
        const btn = document.getElementById('privePlayBtn');

        if (audio.paused) {
            audio.play().then(() => {
                btn.textContent = "⏸";
            }).catch(e => {
                console.log("Error al reproducir audio:", e);
            });
        } else {
            audio.pause();
            btn.textContent = "▶";
        }
    };
})();

