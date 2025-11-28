function getGreeting() {
    const hour = new Date().getHours();
    let messageSet = [];

    if (hour >= 0 && hour < 6) {
        messageSet = [
            "It’s a quiet dawn. Your focus at this hour says a lot about you.",
            "While the world rests, you’re moving forward. Keep going.",
            "The calm of dawn is perfect for deep focus."
        ];
    } else if (hour >= 6 && hour < 12) {
        messageSet = [
            "Good morning. Let’s ease into the day with steady focus.",
            "Your first focus session can set the tone for the whole day.",
            "A fresh start. Let’s make today a little better than yesterday."
        ];
    } else if (hour >= 12 && hour < 18) {
        messageSet = [
            "Small moments of focus add up. You’re doing well.",
            "Let’s stay consistent. This hour matters.",
            "Progress comes from steady effort. Keep going."
        ];
    } else {
        messageSet = [
            "You’ve done well today. Let’s finish strong.",
            "A calm night is a great time for quiet focus.",
            "You’re doing great. Take it slow and keep your rhythm."
        ];
    }

    return messageSet[Math.floor(Math.random() * messageSet.length)];
}

const welcomeBox = document.getElementById("welcome-box");
const text = getGreeting();
let i = 0;

function typeWriter() {
    if (i < text.length) {
        welcomeBox.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, 20);
    } else {
        setTimeout(() => {
            welcomeBox.classList.add("done");
        }, 200);
    }
}

welcomeBox.textContent = "";
typeWriter();
