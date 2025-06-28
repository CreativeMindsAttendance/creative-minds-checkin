// Cached DOM elements
const html = document.documentElement;
const body = document.body;
const langToggle = document.getElementById("lang-toggle");
const langOptions = langToggle.querySelectorAll(".lang-option");
const modeToggle = document.getElementById("mode-toggle");
const nameInput = document.getElementById("nameInput");
const submitBtn = document.getElementById("submitBtn");
const statusMessage = document.getElementById("statusMessage");
const dailyDhikr = document.getElementById("dailyDhikr");
const locationText = document.getElementById("location-text");
const emailText = document.getElementById("email-text");
const websiteText = document.getElementById("website-text");
const formTitle = document.getElementById("form-title");

let currentLang = localStorage.getItem("lang") || "ar";
let isDarkMode = localStorage.getItem("darkMode") === "true";
let dhikrInterval;

function loadLang() {
  const t = translations[currentLang];
  html.lang = currentLang;
  nameInput.placeholder = t.placeholder;
  submitBtn.textContent = t.submit;
  formTitle.textContent = t.title;
  locationText.textContent = t.location;
  emailText.textContent = t.email;
  websiteText.textContent = t.website;
  nameInput.style.direction = statusMessage.style.direction = currentLang === "ar" ? "rtl" : "ltr";
  langToggle.dataset.activeLang = currentLang;
  langOptions.forEach(opt => opt.classList.toggle("active", opt.dataset.lang === currentLang));
  hideMessage();
}

function applyDarkMode() {
  body.classList.toggle("dark-mode", isDarkMode);
  modeToggle.classList.toggle("active", isDarkMode);
  localStorage.setItem("darkMode", isDarkMode);
}

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function showMessage(msg, type = "info", duration = 3000) {
  statusMessage.innerHTML = msg;
  statusMessage.className = `status-message show ${type}`;
  clearTimeout(statusMessage.hideTimeout);
  if (type === "error") duration = 5000;
  statusMessage.hideTimeout = setTimeout(hideMessage, duration);
}

function hideMessage() {
  statusMessage.classList.remove("show");
  clearTimeout(statusMessage.hideTimeout);
}

function hasCheckedInToday() {
  try {
    const record = JSON.parse(localStorage.getItem("attendanceRecord"));
    const today = new Date().toISOString().split("T")[0];
    return record?.date === today ? record.name : false;
  } catch {
    localStorage.removeItem("attendanceRecord");
    return false;
  }
}

function saveAttendance(name) {
  const today = new Date().toISOString().split("T")[0];
  localStorage.setItem("attendanceRecord", JSON.stringify({ name, date: today, timestamp: new Date().toISOString() }));
}

function resetFormState() {
  nameInput.disabled = false;
  submitBtn.disabled = false;
  submitBtn.classList.remove("loading");
}

function submitAttendance() {
  const name = nameInput.value.trim();
  const t = translations[currentLang];

  nameInput.disabled = true;
  submitBtn.disabled = true;
  submitBtn.classList.add("loading");

  if (!name) return showError(t.required);

  const checkedName = hasCheckedInToday();
  if (checkedName) {
    if (name.toLowerCase() !== checkedName.toLowerCase()) {
      return showError(t.nameMismatch.replace("{name}", checkedName));
    }
    return showMessage(t.already.replace("{name}", checkedName), "warning");
  }

  const allowedNames = window.ALLOWED_OUTSIDE_NAMES.map(n => n.toLowerCase());
  if (allowedNames.includes(name.toLowerCase())) {
    saveAttendance(name);
    return showSuccess(t.success);
  }

  if (!navigator.geolocation) return showError(t.geoError);

  showMessage(t.loading, "info");

  navigator.geolocation.getCurrentPosition(pos => {
    const dist = getDistanceKm(pos.coords.latitude, pos.coords.longitude, window.DEST_LAT, window.DEST_LON);
    if (dist <= window.ALLOWED_DISTANCE_KM) {
      saveAttendance(name);
      showSuccess(t.success);
    } else {
      showError(t.outOfRange);
    }
  }, err => {
    const code = err.code;
    const msg = t[{
      1: "permissionDenied",
      2: "positionUnavailable",
      3: "timeout"
    }[code]] || t.geoError;
    showError(msg);
  }, {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  });
}

function showSuccess(msg) {
  showMessage(msg, "success");
  nameInput.value = "";
  resetFormState();
}

function showError(msg) {
  showMessage(msg, "error");
  resetFormState();
  nameInput.focus();
}

function displayRandomDhikr() {
  if (!Array.isArray(adhkar) || adhkar.length === 0) {
    dailyDhikr.textContent = translations[currentLang].adhkarError;
    return;
  }
  dailyDhikr.textContent = adhkar[Math.floor(Math.random() * adhkar.length)];
  dailyDhikr.style.direction = currentLang === "ar" ? "rtl" : "ltr";
}

function init() {
  applyDarkMode();
  loadLang();
  displayRandomDhikr();
  dhikrInterval = setInterval(displayRandomDhikr, 10000);

  langToggle.addEventListener("click", () => {
    currentLang = currentLang === "ar" ? "en" : "ar";
    localStorage.setItem("lang", currentLang);
    loadLang();
    displayRandomDhikr();
  });

  modeToggle.addEventListener("click", () => {
    isDarkMode = !isDarkMode;
    applyDarkMode();
  });

  submitBtn.addEventListener("click", submitAttendance);

  nameInput.addEventListener("keypress", e => {
    if (e.key === "Enter") submitAttendance();
  });

  nameInput.addEventListener("input", hideMessage);
  nameInput.focus();
}

document.addEventListener("DOMContentLoaded", init);
