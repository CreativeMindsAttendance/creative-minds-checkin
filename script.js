console.log("Script loaded!");

// === المتغيرات العامة ===
// تحميل اللغة الافتراضية من localStorage أو تعيينها إلى 'ar'
let currentLang = localStorage.getItem("lang") || "ar";
// تحميل الوضع الليلي من localStorage أو تعيينه إلى false
let isDarkMode = localStorage.getItem("darkMode") === "true";

// === إعدادات الموقع الجغرافي ===
const DEST_LAT = 16.889264; // خط عرض المعهد
const DEST_LON = 42.548691; // خط طول المعهد
const ALLOWED_DISTANCE_KM = 0.2; // المسافة المسموحة بالكيلومتر (200 متر)
const ALLOWED_OUTSIDE_NAMES = ["TEST1", "TEST2"]; // الأسماء المسموح لها بالتسجيل من خارج النطاق

// === تحميل النصوص حسب اللغة من config.js ===
function loadTranslations() {
    const t = translations[currentLang];

    // تحديث اتجاه الصفحة (RTL/LTR) واللغة
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
    document.body.classList.toggle("ltr", currentLang === "en");
    document.body.classList.toggle("rtl", currentLang === "ar");

    // تحديث النصوص في الواجهة
    document.getElementById("site-title-creative").textContent = t.siteTitleCreative || "Creative";
    document.getElementById("site-title-minds").textContent = t.siteTitleMinds || "Minds";
    document.getElementById("form-title").textContent = t.title;
    document.getElementById("nameInput").placeholder = t.placeholder;
    document.getElementById("submitBtn").textContent = t.submit;
    // التأكد من وجود العناصر قبل تحديثها
    if (document.getElementById("location-text")) document.getElementById("location-text").textContent = t.location || "Jazan, Saudi Arabia";
    if (document.getElementById("email-text")) document.getElementById("email-text").textContent = t.email || "example@creativeminds.edu.sa";
    if (document.getElementById("website-text")) document.getElementById("website-text").textContent = t.website || "www.creativeminds.edu.sa";

    // تحديث حالة زر تبديل اللغة (السلايدر)
    const langToggle = document.getElementById("lang-toggle");
    const langEnOption = document.getElementById("lang-en-option");
    const langArOption = document.getElementById("lang-ar-option");

    langToggle.classList.toggle("rtl", currentLang === "ar");
    langEnOption.classList.toggle("active", currentLang === "en");
    langArOption.classList.toggle("active", currentLang === "ar");
}

// === تطبيق أو إزالة الوضع الليلي ===
function applyDarkMode() {
    document.body.classList.toggle("dark-mode", isDarkMode);
    document.getElementById("mode-toggle").classList.toggle("active", isDarkMode);
    localStorage.setItem("darkMode", isDarkMode);
}

// === حساب المسافة بين نقطتين (Haversine Formula) ===
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// === عرض رسالة على الصفحة ===
function showMessage(msg, type = "info", duration = 5000) { // type: success, error, info
    const el = document.getElementById("statusMessage");
    el.innerHTML = msg;
    el.className = ''; // Reset classes
    el.classList.add("show", type);

    // إخفاء الرسالة بعد مدة معينة
    setTimeout(() => {
        el.classList.remove("show");
    }, duration);
}

// === التحقق مما إذا كان المستخدم قد سجل حضوره اليوم ===
function hasCheckedInToday() {
    const record = localStorage.getItem("attendanceRecord");
    if (!record) return false;

    const { name, date } = JSON.parse(record);
    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    return date === today ? name : false;
}

// === حفظ الحضور في LocalStorage ===
function saveAttendance(name) {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(
        "attendanceRecord",
        JSON.stringify({ name: name.trim(), date: today })
    );
}

// === منطق تسجيل الحضور الرئيسي ===
function submitAttendance() {
    const nameInput = document.getElementById("nameInput");
    const name = nameInput.value.trim();
    const t = translations[currentLang];
    const submitBtn = document.getElementById("submitBtn");

    // إزالة تأثير النبض وتغيير حالة الزر في البداية
    submitBtn.classList.remove("button-pulse");
    submitBtn.disabled = true; // تعطيل الزر لمنع الضغط المتعدد
    nameInput.disabled = true; // تعطيل حقل الاسم

    if (!name) {
        showMessage(t.required, "error");
        submitBtn.disabled = false;
        nameInput.disabled = false;
        return;
    }

    const existingName = hasCheckedInToday();
    if (existingName) {
        if (name.toLowerCase() !== existingName.toLowerCase()) { // مقارنة غير حساسة لحالة الأحرف
            showMessage(t.nameMismatch.replace("{name}", existingName), "error");
        } else {
            showMessage(t.already.replace("{name}", existingName), "error");
        }
        submitBtn.disabled = false;
        nameInput.disabled = false;
        return;
    }

    // السماح للأسماء المحددة بالتسجيل حتى لو كانوا خارج النطاق
    if (ALLOWED_OUTSIDE_NAMES.map(n => n.toLowerCase()).includes(name.toLowerCase())) {
        saveAttendance(name);
        showMessage(t.success, "success");
        nameInput.value = ""; // مسح حقل الاسم بعد التسجيل
        submitBtn.disabled = false;
        nameInput.disabled = false;
        return;
    }

    showMessage(t.loading, "info");

    if (!navigator.geolocation) {
        showMessage(t.geoError, "error");
        submitBtn.disabled = false;
        nameInput.disabled = false;
        return;
    }

    // طلب الموقع الجغرافي
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;
            const distance = getDistanceFromLatLonInKm(userLat, userLon, DEST_LAT, DEST_LON);

            if (distance <= ALLOWED_DISTANCE_KM) {
                saveAttendance(name);
                showMessage(t.success, "success");
                nameInput.value = ""; // مسح حقل الاسم بعد التسجيل
            } else {
                showMessage(t.outOfRange, "error");
            }
            submitBtn.disabled = false;
            nameInput.disabled = false;
        },
        (error) => {
            console.error("Geolocation error:", error);
            let errorMessage = t.geoError;
            if (error.code === error.PERMISSION_DENIED) {
                errorMessage = t.permissionDenied; // رسالة محددة لرفض الإذن
            } else if (error.code === error.POSITION_UNAVAILABLE) {
                errorMessage = t.positionUnavailable; // رسالة لعدم توفر الموقع
            } else if (error.code === error.TIMEOUT) {
                errorMessage = t.timeout; // رسالة لانتهاء المهلة
            }
            showMessage(errorMessage, "error");
            submitBtn.disabled = false;
            nameInput.disabled = false;
        },
        {
            enableHighAccuracy: true, // محاولة الحصول على أدق موقع ممكن
            timeout: 10000, // مهلة 10 ثوانٍ
            maximumAge: 0 // عدم استخدام المواقع المخزنة مؤقتًا
        }
    );
}

// === عند تحميل الصفحة (DOM Ready) ===
document.addEventListener("DOMContentLoaded", () => {
    const langToggle = document.getElementById("lang-toggle");
    const modeToggle = document.getElementById("mode-toggle");
    const submitBtn = document.getElementById("submitBtn");

    // تطبيق الوضع الليلي عند التحميل
    applyDarkMode();
    // تحميل الترجمات عند التحميل
    loadTranslations();

    // مستمع لحدث النقر لزر تبديل اللغة
    langToggle.addEventListener("click", () => {
        currentLang = currentLang === "ar" ? "en" : "ar";
        localStorage.setItem("lang", currentLang);
        loadTranslations();
    });

    // مستمع لحدث النقر لزر تبديل الوضع الليلي
    modeToggle.addEventListener("click", () => {
        isDarkMode = !isDarkMode; // عكس الحالة
        applyDarkMode();
    });

    // مستمع لحدث النقر لزر تسجيل الحضور
    submitBtn.addEventListener("click", submitAttendance);

    // إضافة تأثير النبض للزر عند تحميل الصفحة لأول مرة
    submitBtn.classList.add("button-pulse");
});
