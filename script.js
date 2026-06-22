const loginForm = document.querySelector("#loginForm");
const registerForm = document.querySelector("#registerForm");
const welcomeCard = document.querySelector("#welcomeCard");
const welcomeMessage = document.querySelector("#welcomeMessage");
const logoutButton = document.querySelector("#logoutButton");
const statusMessage = document.querySelector("#statusMessage");
const programCards = document.querySelectorAll(".program-card");

let hasProgramAccess = false;
let currentUser = null;

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

function showWelcomeState(displayName) {
  loginForm.style.display = 'none';
  registerForm.style.display = 'none';
  welcomeCard.style.display = 'block';
  welcomeMessage.textContent = `Welcome, ${displayName}!`;
  currentUser = displayName;
}

function showLoginState() {
  loginForm.style.display = 'block';
  registerForm.style.display = 'block';
  welcomeCard.style.display = 'none';
  currentUser = null;
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

async function handleLogin(email, password) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      showWelcomeState(data.user.displayName || data.user.email);
      unlockPrograms();
      return true;
    } else {
      showMessage(data.error || 'Login failed');
      return false;
    }
  } catch (error) {
    showMessage('Login failed. Please try again.');
    return false;
  }
}

async function handleRegister(email, password, confirmPassword) {
  if (password !== confirmPassword) {
    showMessage('Passwords do not match');
    return false;
  }

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      showWelcomeState(data.user.displayName || data.user.email);
      unlockPrograms();
      return true;
    } else {
      showMessage(data.error || 'Registration failed');
      return false;
    }
  } catch (error) {
    showMessage('Registration failed. Please try again.');
    return false;
  }
}

async function handleLogout() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Logout error:', error);
  }

  hasProgramAccess = false;
  showLoginState();

  programCards.forEach((card) => {
    card.classList.remove("unlocked");
    card.classList.add("locked");
    card.querySelector(".lock-icon").textContent = "Locked";
  });

  showMessage("You have been logged out.");
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  await handleLogin(email, password);
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  await handleRegister(email, password, confirmPassword);
});

logoutButton.addEventListener("click", handleLogout);

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

// Check if user is already logged in on page load
(async function checkAuth() {
  try {
    const response = await fetch('/api/auth/me');
    const data = await response.json();

    if (response.ok) {
      showWelcomeState(data.user.displayName || data.user.email);
      unlockPrograms();
    }
  } catch (error) {
    // Not logged in, show login forms
    showLoginState();
  }
})();
