// Focus Morphing Sentence (Word-by-word morphing)

(function () {
  const elts = {
    text1: document.getElementById("focus-morph-text1"),
    text2: document.getElementById("focus-morph-text2"),
  };

  // Run only on home page (safety)
  if (!elts.text1 || !elts.text2) return;

  // Word sequence that forms a full sentence
  const texts = [
    "Focus",
    "on",
    "what",
    "truly",
    "matters",
    "and",
    "keep",
    "moving",
    "forward",
    "today"
  ];

  const morphTime = 1.0;      // transition speed
  const cooldownTime = 0.4;   // pause between transitions

  let textIndex = texts.length - 1;
  let time = new Date();
  let morph = 0;
  let cooldown = cooldownTime;

  // Initial text
  elts.text1.textContent = texts[textIndex % texts.length];
  elts.text2.textContent = texts[(textIndex + 1) % texts.length];

  function doMorph() {
    morph -= cooldown;
    cooldown = 0;

    let fraction = morph / morphTime;
    if (fraction > 1) {
      cooldown = cooldownTime;
      fraction = 1;
    }

    setMorph(fraction);
  }

  function safeBlur(fraction) {
    // Avoid division errors & keep blur smooth
    if (fraction <= 0) return 50;
    return Math.min(8 / fraction - 8, 50);
  }

  function setMorph(fraction) {
    // text2 (appearing)
    elts.text2.style.filter = `blur(${safeBlur(fraction)}px)`;
    elts.text2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

    // text1 (disappearing)
    const backFraction = 1 - fraction;
    elts.text1.style.filter = `blur(${safeBlur(backFraction)}px)`;
    elts.text1.style.opacity = `${Math.pow(backFraction, 0.4) * 100}%`;

    // Update text
    elts.text1.textContent = texts[textIndex % texts.length];
    elts.text2.textContent = texts[(textIndex + 1) % texts.length];
  }

  function doCooldown() {
    morph = 0;
    elts.text2.style.filter = "";
    elts.text2.style.opacity = "100%";

    elts.text1.style.filter = "";
    elts.text1.style.opacity = "0%";
  }

  function animate() {
    requestAnimationFrame(animate);

    const newTime = new Date();
    const shouldIncrementIndex = cooldown > 0;
    const dt = (newTime - time) / 1000;
    time = newTime;

    cooldown -= dt;

    if (cooldown <= 0) {
      if (shouldIncrementIndex) {
        textIndex++;
      }
      doMorph();
    } else {
      doCooldown();
    }
  }

  animate();
})();
