console.log("Script loaded!");

let lang = localStorage.getItem("lang") || 'ar';
let translations = {};

// تحميل اللغة
async function loadLang(file) {
  const res = await fetch(file);
  translations = await res.json();
  document.documentElement.lang = lang;
  document.body.classList.toggle("rtl", lang === 'ar');
  document.body.classList.toggle("ltr", lang === 'en');
  document.getElementById('title').textContent = translations.title;
  document.getElementById('nameInput').placeholder = translations.placeholder;
  document.getElementById('submitBtn').textContent = translations.submit;
  document.getElementById('lang-toggle-label').textContent = lang === 'ar' ? 'AR' : 'EN';
}

// الوضع الليلي
function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark');
  document.getElementById("mode-toggle").classList.toggle("active", isDark);
  localStorage.setItem("darkMode", isDark);
}

// المسافة
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// عرض الرسالة
function showMessage(msg, isError = false) {
  const el = document.getElementById('statusMessage');
  el.textContent = msg;
  el.style.color = isError ? 'crimson' : 'green';
}

// إعدادات الموقع
const DEST_LAT = 16.889264;
const DEST_LON = 42.548691;
const allowedDistance = 0.2;
const allowedOutsideNames = ["TEST1", "TEST2"];

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

// التحقق والتسجيل
async function submitAttendance() {
  const name = document.getElementById("nameInput").value.trim();
  const statusMessage = document.getElementById("statusMessage");

  if (!name) {
    statusMessage.textContent = translations.required;
    return;
  }

  const existingName = hasCheckedInToday();
  if (existingName) {
    statusMessage.textContent = translations.already.replace("{name}", existingName);
    return;
  }

  if (allowedOutsideNames.includes(name)) {
    saveAttendance(name);
    statusMessage.textContent = translations.success;
    return;
  }

  statusMessage.textContent = translations.loading;

  if (!navigator.geolocation) {
    statusMessage.textContent = translations.geoError;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLat = position.coords.latitude;
      const userLon = position.coords.longitude;

      const distance = getDistanceFromLatLonInKm(userLat, userLon, DEST_LAT, DEST_LON);
      if (distance <= allowedDistance) {
        saveAttendance(name);
        statusMessage.textContent = translations.success;
      } else {
        statusMessage.textContent = translations.outOfRange;
      }
    },
    () => {
      statusMessage.textContent = translations.geoError;
    }
  );
}

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  const langToggle = document.getElementById('lang-toggle');
  const modeToggle = document.getElementById('mode-toggle');
  const submitBtn = document.getElementById('submitBtn');

  // تفعيل الوضع الليلي
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
    document.getElementById("mode-toggle").classList.add("active");
  }

  // تفعيل اللغة
  loadLang(`lang-${lang}.json`);
  if (lang === "en") langToggle.classList.add("active");

  // تبديل اللغة
  langToggle.addEventListener('click', () => {
    lang = lang === "ar" ? "en" : "ar";
    localStorage.setItem("lang", lang);
    langToggle.classList.toggle("active");
    loadLang(`lang-${lang}.json`);
  });

  // تبديل الوضع الليلي
  modeToggle.addEventListener("click", toggleDarkMode);

  // زر التسجيل
  submitBtn.addEventListener("click", submitAttendance);
});
