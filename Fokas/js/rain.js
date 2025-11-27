document.addEventListener("DOMContentLoaded", () => {

  const rainAudio = document.getElementById("rainAudio");
  const playBtn = document.getElementById("rainPlay");
  const pauseBtn = document.getElementById("rainPause");
  const volumeRange = document.getElementById("rainVolume");

  if (!rainAudio) {
    console.error("Rain audio not found");
    return;
  }

  // 기본 볼륨
  rainAudio.volume = volumeRange.value / 100;

  playBtn.addEventListener("click", () => {
    rainAudio.play().catch(err => console.error(err));
  });

  pauseBtn.addEventListener("click", () => {
    rainAudio.pause();
  });

  volumeRange.addEventListener("input", () => {
    rainAudio.volume = volumeRange.value / 100;
  });
});
