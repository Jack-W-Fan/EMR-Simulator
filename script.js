const loginForm = document.querySelector("#loginForm");
const registerForm = document.querySelector("#registerForm");
const statusMessage = document.querySelector("#statusMessage");
const programCards = document.querySelectorAll(".program-card");

let hasProgramAccess = false;

function showMessage(message) {
  statusMessage.textContent = message;
}

function playLockedBeep() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;

  if (!AudioContext) {
    return;
  }

  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = 520;
  gain.gain.value = 0.08;

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.14);
}

function unlockPrograms() {
  hasProgramAccess = true;
  showMessage("Welcome to CNU Tech. Program access is now available.");

  programCards.forEach((card) => {
    card.classList.remove("locked");
    card.classList.add("unlocked");
    card.querySelector(".lock-icon").textContent = "Open";
  });
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  unlockPrograms();
});

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  unlockPrograms();
});

programCards.forEach((card) => {
  card.addEventListener("click", (event) => {
    if (!hasProgramAccess) {
      event.preventDefault();
      playLockedBeep();
      showMessage("Please sign in first.");
      return;
    }

    // Allow navigation for unlocked cards (anchor tags)
    if (card.tagName === "A" && card.classList.contains("unlocked")) {
      return; // Let the default link behavior happen
    }

    const programName = card.querySelector("h3").textContent;
    showMessage(`${programName} is available. Add the program page link when it is ready.`);
  });
});
