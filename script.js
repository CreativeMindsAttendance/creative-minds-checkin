let lang = localStorage.getItem("lang") || 'ar';
let translations = {};
let submittedToday = false;
let storedName = '';
const allowedDistance = 0.2; // بالكيلومتر

// إحداثيات المعهد
const DEST_LAT = 16.889264;
const DEST_LON = 42.548691;

// تحميل اللغة حسب الملف
async function loadLang(file) {
  const res = await fetch(file);
  translations = await res.json();
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
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

// حساب المسافة
function distance(lat1, lon1, lat2, lon2) {
  const toRad = deg => deg * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// عرض الرسائل
function showMessage(msg, isError = false) {
  const el = document.getElementById('statusMessage');
  el.textContent = msg;
  el.style.color = isError ? 'crimson' : 'green';
}

// التحقق وتسجيل الحضور
async function checkIn(name, lat, lon) {
  if (!name) return showMessage(translations.required, true);
  if (submittedToday) return showMessage(translations.already.replace('{name}', storedName), true);

  const override = name.trim() === "سليمان أحمد النجدي";
  const dist = distance(lat, lon, DEST_LAT, DEST_LON);

  if (dist > allowedDistance && !override) {
    return showMessage(translations.outOfRange, true);
  }

  submittedToday = true;
  storedName = name.trim();
  showMessage(translations.success);
}

// معرفة الموقع
function detectLocation(name) {
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      checkIn(name, latitude, longitude);
    },
    () => showMessage(translations.geoError, true)
  );
}

// تحميل عند بداية الصفحة
document.addEventListener('DOMContentLoaded', () => {
  const langToggle = document.getElementById('lang-toggle');
  const modeToggle = document.getElementById('mode-toggle');
  const submitBtn = document.getElementById('submitBtn');

  // تفعيل الوضع الليلي من التخزين
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
    modeToggle.classList.add("active");
  }

  // تفعيل اللغة المحفوظة من قبل
  let currentLang = localStorage.getItem("lang") || "ar";
  if (currentLang === "en") {
    lang = "en";
    langToggle.classList.add("active");
  }

  // تحميل ملف اللغة
  loadLang(`lang-${lang}.json`);

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
  submitBtn.addEventListener("click", () => {
    const name = document.getElementById('nameInput').value.trim();
    showMessage(translations.loading);
    detectLocation(name);
  });
});
