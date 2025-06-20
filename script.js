console.log("Script loaded!");

// === المتغيرات ===
let lang = localStorage.getItem("lang") || "ar";  // تم نقل currentLang هنا
let submittedToday = false;
let storedName = "";

// === إعدادات الموقع الجغرافي ===
const DEST_LAT = 16.889264;
const DEST_LON = 42.548691;
const allowedDistance = 0.2;
const allowedOutsideNames = ["TEST1", "TEST2"];

// === تحميل اللغة ===
function loadLang() {
  document.documentElement.lang = lang;
  document.body.classList.toggle("rtl", lang === "ar");
  document.body.classList.toggle("ltr", lang === "en");

  const t = translations[lang];
  document.getElementById("title").textContent = t.title || "Attendance";
  document.getElementById("nameInput").placeholder = t.placeholder || "Enter your name";
  document.getElementById("submitBtn").textContent = t.submit || "Submit";
  document.getElementById("lang-toggle").setAttribute("data-label", lang === "ar" ? "AR" : "EN");
}

// === الوضع الليلي ===
function toggleDarkMode() {
  const isDark = document.body.classList.toggle("dark");
  document.getElementById("mode-toggle").classList.toggle("active", isDark);
  localStorage.setItem("darkMode", isDark);
}

// === المسافة بين نقطتين ===
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// === رسائل المستخدم ===
function showMessage(msg, isError = false) {
  const el = document.getElementById("statusMessage");
  el.textContent = msg;
  el.style.color = isError ? "crimson" : "green";
}

// === تخزين الحضور في localStorage ===
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

// === تسجيل الحضور ===
async function submitAttendance() {
  const name = document.getElementById("nameInput").value.trim();
  const statusMessage = document.getElementById("statusMessage");
  const t = translations[lang];

  if (!name) return showMessage(t.required, true);

  const existingName = hasCheckedInToday();
if (existingName) {
  if (name !== existingName) {
    return showMessage(`لقد تم تحضيرك سابقًا باسم ${existingName}، لا يمكنك استخدام اسم مختلف.`, true);
  }
  return showMessage(t.already.replace("{name}", existingName), true);
}

  if (allowedOutsideNames.includes(name)) {
    saveAttendance(name);
    return showMessage(t.success);
  }

  showMessage(t.loading);

  if (!navigator.geolocation) return showMessage(t.geoError, true);

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const d = getDistanceFromLatLonInKm(pos.coords.latitude, pos.coords.longitude, DEST_LAT, DEST_LON);
      if (d <= allowedDistance) {
        saveAttendance(name);
        showMessage(t.success);
      } else {
        showMessage(t.outOfRange, true);
      }
    },
    () => showMessage(t.geoError, true)
  );
}

// === عند تحميل الصفحة ===
document.addEventListener("DOMContentLoaded", () => {
  const langToggle = document.getElementById("lang-toggle");
  const modeToggle = document.getElementById("mode-toggle");
  const submitBtn = document.getElementById("submitBtn");

  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
  }

  loadLang();

  langToggle.addEventListener("click", () => {
    lang = lang === "ar" ? "en" : "ar";
    localStorage.setItem("lang", lang);
    langToggle.classList.toggle("active");
    loadLang();
  });

  modeToggle.addEventListener("click", toggleDarkMode);
  submitBtn.addEventListener("click", submitAttendance);
});
