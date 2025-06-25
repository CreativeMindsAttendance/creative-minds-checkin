// إعدادات الموقع الجغرافي للمعهد
const DEST_LAT = 16.889;
const DEST_LON = 42.551;
const ALLOWED_DISTANCE_KM = 0.15;

// أسماء مسموح لها بالتسجيل من أي مكان
const ALLOWED_OUTSIDE_NAMES = ["TEST1", "TEST2"];

// الأدعية أو الأذكار المعروضة
const adhkar = [
  "اللهم أعني على ذكرك وشكرك وحسن عبادتك 🤍",
  "أستغفر الله العظيم وأتوب إليه 🌿",
  "اللهم إنك عفو كريم تحب العفو فاعفُ عني ✨",
  "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير 🕊️",
  "سبحان الله وبحمده، سبحان الله العظيم 💎"
];

// الترجمات
const translations = {
  ar: {
    title: "نموذج تحضير",
    placeholder: "اكتب اسمك الثلاثي",
    submit: "تسجيل الحضور",
    success: "تم تسجيل حضورك بنجاح ✅",
    already: "لقد تم تسجيل حضورك مسبقًا اليوم باسم: {name} ⏱️",
    nameMismatch: "تم تسجيل حضور مسبق اليوم باسم مختلف: {name} ⚠️",
    required: "الرجاء إدخال الاسم الثلاثي ✍️",
    outOfRange: "يجب أن تكون قريبًا من مقر المعهد لتسجيل الحضور 📍",
    geoError: "لم نتمكن من الحصول على موقعك ❌",
    permissionDenied: "تم رفض إذن الوصول للموقع 🛑",
    positionUnavailable: "تعذّر تحديد الموقع الحالي 🛰️",
    timeout: "انتهى وقت محاولة تحديد الموقع ⏳",
    loading: "جارٍ تحديد موقعك... 📡",
    adhkarError: "لم يتم العثور على أذكار للعرض 💬",
    location: "جازان، السعودية",
    email: "example@creativeminds.edu.sa",
    website: "www.creativeminds.edu.sa"
  },
  en: {
    title: "Attendance Form",
    placeholder: "Enter your full name",
    submit: "Submit",
    success: "Your attendance has been recorded ✅",
    already: "You've already checked in today as: {name} ⏱️",
    nameMismatch: "Attendance already recorded today under a different name: {name} ⚠️",
    required: "Please enter your full name ✍️",
    outOfRange: "You must be near the institute to check in 📍",
    geoError: "Could not access your location ❌",
    permissionDenied: "Location access denied 🛑",
    positionUnavailable: "Unable to determine your location 🛰️",
    timeout: "Location request timed out ⏳",
    loading: "Fetching your location... 📡",
    adhkarError: "No adhkar found to display 💬",
    location: "Jazan, Saudi Arabia",
    email: "example@creativeminds.edu.sa",
    website: "www.creativeminds.edu.sa"
  }
};
