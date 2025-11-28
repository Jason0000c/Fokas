// js/roomControls.js

document.addEventListener("DOMContentLoaded", () => {
    initRoomControls();
});

/**
 * Automatically initializes audio player controls for the current room.
 * Detects which elements exist and binds behavior.
 */
function initRoomControls() {

    // Try to find audio element
    const audio = document.querySelector("audio");
    if (!audio) return;

    // Try to detect play / pause / volume elements
    const playBtn = document.querySelector("[id$='Play'], #playBtn");
    const pauseBtn = document.querySelector("[id$='Pause'], #pauseBtn");
    const volumeRange = document.querySelector("input[type='range']");

    // Play
    if (playBtn) {
        playBtn.addEventListener("click", () => {
            audio.play().catch(err => console.error(err));
        });
    }

    // Pause
    if (pauseBtn) {
        pauseBtn.addEventListener("click", () => {
            audio.pause();
        });
    }

    // Volume
    if (volumeRange) {
        audio.volume = volumeRange.value / 100;

        volumeRange.addEventListener("input", () => {
            audio.volume = volumeRange.value / 100;
        });
    }
}
