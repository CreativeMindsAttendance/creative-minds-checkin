// إحداثيات معهد Creative Minds
const DEST_LAT = 16.889264;
const DEST_LON = 42.548691;

// المسافة المسموحة بالكيلومتر
const allowedDistance = 0.2;

// الترجمة
const translations = {
  en: {
    required: "Please enter your full name.",
    success: "Your attendance has been recorded ✅",
    already: "You have already checked in today as {name}.",
    location_error: "Location access is required to submit attendance.",
    too_far: "You are too far from Creative Minds to check in.",
  },
  ar: {
    required: "يرجى إدخال الاسم الثلاثي.",
    success: "تم تسجيل حضورك بنجاح ✅",
    already: "تم تسجيل حضورك مسبقًا باسم {name}.",
    location_error: "مطلوب السماح بالموقع لتسجيل الحضور.",
    too_far: "أنت بعيد جدًا عن معهد Creative Minds.",
  },
};

let currentLang = "en"; // يتم تغييره عند الضغط على زر اللغة

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // نصف قطر الأرض بالكيلومتر
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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

async function submitAttendance() {
  const name = document.getElementById("nameInput").value.trim();
  const statusMessage = document.getElementById("statusMessage");

  if (!name) {
    statusMessage.textContent = translations[currentLang].required;
    return;
  }

  const existingName = hasCheckedInToday();
  if (existingName) {
    const message = translations[currentLang].already.replace("{name}", existingName);
    statusMessage.textContent = message;
    return;
  }

  if (!navigator.geolocation) {
    statusMessage.textContent = translations[currentLang].location_error;
    return;
  }

  statusMessage.textContent = "⏳ Checking location...";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const distance = getDistance(latitude, longitude, DEST_LAT, DEST_LON);

      if (distance > allowedDistance) {
        statusMessage.textContent = translations[currentLang].too_far;
        return;
      }

      saveAttendance(name);
      statusMessage.textContent = translations[currentLang].success;

      // قفل الاسم والزر بعد التسجيل
      document.getElementById("submitBtn").disabled = true;
      document.getElementById("submitBtn").style.opacity = 0.5;
      document.getElementById("nameInput").value = name;
      document.getElementById("nameInput").disabled = true;
    },
    () => {
      statusMessage.textContent = translations[currentLang].location_error;
    }
  );
}

// منع التكرار حتى بعد التحديث
window.addEventListener("DOMContentLoaded", () => {
  const existingName = hasCheckedInToday();
  if (existingName) {
    const statusMessage = document.getElementById("statusMessage");
    const message = translations[currentLang].already.replace("{name}", existingName);
    statusMessage.textContent = message;

    document.getElementById("submitBtn").disabled = true;
    document.getElementById("submitBtn").style.opacity = 0.5;

    document.getElementById("nameInput").value = existingName;
    document.getElementById("nameInput").disabled = true;
  }

  document.getElementById("submitBtn").addEventListener("click", submitAttendance);
});
