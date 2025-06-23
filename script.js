console.log("Script loaded!");

// === المتغيرات ===
let lang = localStorage.getItem("lang") || "ar";
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

  const titleEl = document.querySelector(".philosopher-text");
  if (titleEl) titleEl.textContent = t.title || "Attendance";

  const inputEl = document.getElementById("nameInput");
  if (inputEl) inputEl.placeholder = t.placeholder || "Enter your name";

  const btnEl = document.getElementById("submitBtn");
  if (btnEl) btnEl.textContent = t.submit || "Submit";

  const langToggle = document.getElementById("lang-toggle");
  if (langToggle) {
    langToggle.setAttribute("data-label", lang === "ar" ? "AR" : "EN");
  }
}

  const t = translations[lang];
  document.querySelector(".philosopher-text").textContent = t.title || "Attendance";
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

// === حساب المسافة بين نقطتين باستخدام Haversine Formula ===
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

// === إظهار رسالة حالة للمستخدم ===
function showMessage(msg, isError = false) {
  const el = document.getElementById("statusMessage");
  el.innerHTML = msg;
  el.style.color = isError ? "crimson" : "green";
  el.classList.add("show");
}

// === التحقق من التسجيل المسبق اليوم ===
function hasCheckedInToday() {
  const record = localStorage.getItem("attendanceRecord");
  if (!record) return false;
  const { name, date } = JSON.parse(record);
  const today = new Date().toISOString().split("T")[0];
  return date === today ? name : false;
}

// === حفظ الحضور في localStorage ===
function saveAttendance(name) {
  const today = new Date().toISOString().split("T")[0];
  localStorage.setItem("attendanceRecord", JSON.stringify({ name, date: today }));
}

// === تنفيذ التسجيل الفعلي ===
async function submitAttendance() {
  const name = document.getElementById("nameInput").value.trim();
  const statusMessage = document.getElementById("statusMessage");
  const t = translations[lang];
  const submitBtn = document.getElementById("submitBtn");

  if (!name) return showMessage(t.required, true);

  const existingName = hasCheckedInToday();
  if (existingName) {
    if (name !== existingName) {
      return showMessage(t.nameMismatch.replace("{name}", existingName), true);
    } else {
      return showMessage(t.already.replace("{name}", existingName), true);
    }
  }

  if (allowedOutsideNames.includes(name)) {
    saveAttendance(name);
    submitBtn.classList.remove("pulse"); // وقف النبض بعد التسجيل
    return showMessage(t.success);
  }

  showMessage(t.loading);

  if (!navigator.geolocation) return showMessage(t.geoError, true);

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
        submitBtn.classList.remove("pulse"); // وقف النبض بعد التسجيل
        showMessage(t.success);
      } else {
        showMessage(t.outOfRange, true);
      }
    },
    () => showMessage(t.geoError, true),
    { timeout: 10000 } // ⏰ Timeout لحماية من الانتظار الطويل
  );
}

// === التهيئة عند تحميل الصفحة ===
document.addEventListener("DOMContentLoaded", () => {
  const langToggle = document.getElementById("lang-toggle");
  const modeToggle = document.getElementById("mode-toggle");
  const body = document.body;
  const nameInput = document.getElementById("nameInput");
  const submitBtn = document.getElementById("submitBtn");
  const statusMessage = document.getElementById("statusMessage");
  const formTitle = document.getElementById("form-title");
  const siteTitle = document.getElementById("site-title");
  const locationText = document.getElementById("location-text");
  const emailText = document.getElementById("email-text");
  const websiteText = document.getElementById("website-text");

  let currentLang = localStorage.getItem("lang") || "ar";
  let isDarkMode = localStorage.getItem("darkMode") === "true";

  const translations = {
    ar: {
      siteTitle: "Creative Minds",
      formTitle: "نموذج تحضير",
      placeholder: "اكتب اسمك الثلاثي",
      submit: "تسجيل الحضور",
      location: "Jazan, Saudi Arabia",
      email: "example@creativeminds.edu.sa",
      website: "www.creativeminds.edu.sa"
    },
    en: {
      siteTitle: "Creative Minds",
      formTitle: "Attendance Form",
      placeholder: "Enter your full name",
      submit: "Check In",
      location: "Jazan, Saudi Arabia",
      email: "example@creativeminds.edu.sa",
      website: "www.creativeminds.edu.sa"
    }
  };

  function applyLanguage(lang) {
    if (!translations[lang]) return;

    siteTitle.textContent = translations[lang].siteTitle;
    formTitle.textContent = translations[lang].formTitle;
    nameInput.placeholder = translations[lang].placeholder;
    submitBtn.textContent = translations[lang].submit;
    locationText.textContent = translations[lang].location;
    emailText.textContent = translations[lang].email;
    websiteText.textContent = translations[lang].website;

    document.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("lang", lang);
  }

  if (langToggle) {
    langToggle.addEventListener("click", () => {
      currentLang = currentLang === "ar" ? "en" : "ar";
      applyLanguage(currentLang);
    });
  }

  if (modeToggle) {
    modeToggle.addEventListener("click", () => {
      isDarkMode = !isDarkMode;
      body.classList.toggle("dark-mode", isDarkMode);
      localStorage.setItem("darkMode", isDarkMode);
    });
  }

  applyLanguage(currentLang);
  body.classList.toggle("dark-mode", isDarkMode);
});
