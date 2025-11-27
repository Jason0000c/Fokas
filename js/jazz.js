document.addEventListener("DOMContentLoaded", () => {
  
  const audio = document.getElementById("jazzAudio");
  const playBtn = document.getElementById("playBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const volumeRange = document.getElementById("volumeRange");

  if (!audio) return;

  playBtn.addEventListener("click", () => {
    audio.play().catch(e => console.log(e));
  });

  pauseBtn.addEventListener("click", () => {
    audio.pause();
  });

  volumeRange.addEventListener("input", () => {
    audio.volume = volumeRange.value / 100;
  });

  audio.volume = 0.7;
});
