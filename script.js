console.log("Script loaded!");

// === المتغيرات العامة ===
let lang = localStorage.getItem("lang") || "ar";
let submittedToday = false;

// === إعدادات الموقع الجغرافي ===
const DEST_LAT = 16.889264;
const DEST_LON = 42.548691;
const allowedDistance = 0.2; // بالكيلومتر
const allowedOutsideNames = ["TEST1", "TEST2"];

// === تحميل اللغة من config.js ===
function loadLang() {
  const t = translations[lang];

  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.body.classList.toggle("rtl", lang === "ar");
  document.body.classList.toggle("ltr", lang === "en");

  // تحديث النصوص حسب اللغة
  document.getElementById("form-title").textContent = t.title;
  document.getElementById("nameInput").placeholder = t.placeholder;
  document.getElementById("submitBtn").textContent = t.submit;
  document.getElementById("location-text").textContent = t.location || "Jazan, Saudi Arabia";
  document.getElementById("email-text").textContent = t.email || "example@creativeminds.edu.sa";
  document.getElementById("website-text").textContent = t.website || "www.creativeminds.edu.sa";
}

// === الوضع الليلي ===
function toggleDarkMode() {
  const isDark = document.body.classList.toggle("dark-mode");
  document.getElementById("mode-toggle").classList.toggle("active", isDark);
  localStorage.setItem("darkMode", isDark);
}

// === حساب المسافة بين نقطتين ===
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// === عرض رسالة على الصفحة ===
function showMessage(msg, isError = false) {
  const el = document.getElementById("statusMessage");
  el.innerHTML = msg;
  el.style.color = isError ? "crimson" : "green";
  el.classList.add("show");
}

// === هل تم تسجيل الحضور مسبقًا اليوم؟ ===
function hasCheckedInToday() {
  const record = localStorage.getItem("attendanceRecord");
  if (!record) return false;

  const { name, date } = JSON.parse(record);
  const today = new Date().toISOString().split("T")[0];
  return date === today ? name : false;
}

// === حفظ الحضور في LocalStorage ===
function saveAttendance(name) {
  const today = new Date().toISOString().split("T")[0];
  localStorage.setItem(
    "attendanceRecord",
    JSON.stringify({ name, date: today })
  );
}

// === تنفيذ الحضور ===
function submitAttendance() {
  const name = document.getElementById("nameInput").value.trim();
  const t = translations[lang];
  const submitBtn = document.getElementById("submitBtn");

  if (!name) return showMessage(t.required, true);

  const existingName = hasCheckedInToday();
  if (existingName) {
    if (name !== existingName) {
      return showMessage(
        t.nameMismatch.replace("{name}", existingName),
        true
      );
    } else {
      return showMessage(
        t.already.replace("{name}", existingName),
        true
      );
    }
  }

  if (allowedOutsideNames.includes(name)) {
    saveAttendance(name);
    submitBtn.classList.remove("pulse");
    return showMessage(t.success);
  }

  showMessage(t.loading);

  if (!navigator.geolocation)
    return showMessage(t.geoError, true);

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const d = getDistanceFromLatLonInKm(
        pos.coords.latitude,
        pos.coords.longitude,
        DEST_LAT,
        DEST_LON
      );

      if (d <= allowedDistance) {
        saveAttendance(name);
        submitBtn.classList.remove("pulse");
        showMessage(t.success);
      } else {
        showMessage(t.outOfRange, true);
      }
    },
    () => showMessage(t.geoError, true),
    { timeout: 10000 }
  );
}

// === عند تحميل الصفحة ===
document.addEventListener("DOMContentLoaded", () => {
  const langToggle = document.getElementById("lang-toggle");
  const modeToggle = document.getElementById("mode-toggle");
  const submitBtn = document.getElementById("submitBtn");

  // تحميل الوضع الليلي من التخزين
  const isDark = localStorage.getItem("darkMode") === "true";
  if (isDark) {
    document.body.classList.add("dark-mode");
    document.getElementById("mode-toggle").classList.add("active");
  }

  loadLang();

  // تغيير اللغة
  langToggle.addEventListener("click", () => {
    lang = lang === "ar" ? "en" : "ar";
    localStorage.setItem("lang", lang);
    loadLang();
  });

  // تفعيل الوضع الليلي
  modeToggle.addEventListener("click", toggleDarkMode);

  // زر الحضور
  submitBtn.addEventListener("click", submitAttendance);
});
