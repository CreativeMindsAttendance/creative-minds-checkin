console.log("Script loaded!");
let lang = localStorage.getItem("lang") || 'ar';
let translations = {};

// إحداثيات المعهد
const DEST_LAT = 16.889264;
const DEST_LON = 42.548691;
const allowedDistance = 0.2;
const allowedOutsideNames = ["TEST1", "TEST2"];

function loadLang(file) {
  fetch(file)
    .then(res => res.json())
    .then(data => {
      translations = data;
      document.documentElement.lang = lang;
      document.body.classList.toggle("rtl", lang === 'ar');
      document.body.classList.toggle("ltr", lang === 'en');
      document.getElementById('title').textContent = translations.title;
      document.getElementById('nameInput').placeholder = translations.placeholder;
      document.getElementById('submitBtn').textContent = translations.submit;
      document.getElementById('lang-toggle').setAttribute('data-label', lang === 'ar' ? 'AR' : 'EN');
    });
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", isDark);
  document.getElementById("mode-toggle").classList.toggle("active", isDark);
}

function showMessage(msg, isError = false) {
  const el = document.getElementById('statusMessage');
  el.textContent = msg;
  el.style.color = isError ? 'crimson' : 'green';
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
    Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function hasCheckedInToday() {
  const record = localStorage.getItem("attendanceRecord");
  if (!record) return false;
  const { name, date } = JSON.parse(record);
  const today = new Date().toISOString().split("T")[0];
  return date === today ? name : false;
}

function saveAttendance(name) {
  const today = new Date().toISOString().split("T")[0];
  localStorage.setItem("attendanceRecord", JSON.stringify({ name, date: today }));
}

function submitAttendance() {
  const name = document.getElementById("nameInput").value.trim();
  const statusMessage = document.getElementById("statusMessage");

  if (!name) {
    showMessage(translations[currentLang].required, true);
    return;
  }

  const existingName = hasCheckedInToday();
  if (existingName) {
    showMessage(translations[currentLang].already.replace("{name}", existingName), true);
    return;
  }

  if (allowedOutsideNames.includes(name)) {
    saveAttendance(name);
    showMessage(translations[currentLang].success);
    return;
  }

  showMessage(translations[currentLang].loading);

  if (!navigator.geolocation) {
    showMessage(translations[currentLang].geoError, true);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLat = position.coords.latitude;
      const userLon = position.coords.longitude;

      const distance = getDistanceFromLatLonInKm(userLat, userLon, DEST_LAT, DEST_LON);

      if (distance <= allowedDistance) {
        saveAttendance(name);
        showMessage(translations[currentLang].success);
      } else {
        showMessage(translations[currentLang].outOfRange, true);
      }
    },
    () => {
      showMessage(translations[currentLang].geoError, true);
    }
  );
}

document.addEventListener("DOMContentLoaded", () => {
  const langToggle = document.getElementById("lang-toggle");
  const modeToggle = document.getElementById("mode-toggle");

  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
    modeToggle.classList.add("active");
  }

  if (lang === "en") {
    langToggle.classList.add("active");
  }

  loadLang(`lang-${lang}.json`);

  langToggle.addEventListener("click", () => {
    lang = lang === "ar" ? "en" : "ar";
    localStorage.setItem("lang", lang);
    langToggle.classList.toggle("active");
    loadLang(`lang-${lang}.json`);
  });

  modeToggle.addEventListener("click", toggleDarkMode);
  document.getElementById("submitBtn").addEventListener("click", submitAttendance);
});
