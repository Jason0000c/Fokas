// js/lofi.js

document.addEventListener("DOMContentLoaded", () => {

  console.log("Lo-fi JS Loaded");

  const audio = document.getElementById("lofiAudio");
  const playBtn = document.getElementById("playBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const volumeRange = document.getElementById("volumeRange");

  if (audio && playBtn && pauseBtn && volumeRange) {

    // PLAY
    playBtn.addEventListener("click", () => {
      audio.play().catch(e => console.log(e));
    });

    // PAUSE
    pauseBtn.addEventListener("click", () => {
      audio.pause();
    });

    // VOLUME
    volumeRange.addEventListener("input", () => {
      audio.volume = volumeRange.value / 100;
    });

    audio.volume = 0.7;

  } else {
    console.log("❌ ERROR: One or more audio controls are missing!");
  }

});
