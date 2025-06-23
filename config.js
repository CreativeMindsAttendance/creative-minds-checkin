// Translations data for English and Arabic
const translations = {
    en: {
        // Site title "Creative Minds" is hardcoded in HTML/CSS to always be English.
        title: "Attendance Form",
        placeholder: "Enter your full name",
        submit: "Check In",
        generateTipButton: "✨ Daily Tip ✨", // New text for Gemini API button
        success: "✅ Your attendance has been recorded successfully!",
        already: "⚠️ You have already checked in today as ({name}).",
        nameMismatch: '❌ You have already checked in today as <span dir="ltr">({name})</span>. You cannot use a different name.',
        outOfRange: "❌ You are outside the institute range. You must be at the institute to check in.",
        geoError: "⚠️ Location not detected. Please ensure GPS is enabled and permissions are granted.",
        permissionDenied: "❌ Location access denied. Please allow location access to check in.",
        positionUnavailable: "❌ Location information is unavailable. Please try again.",
        timeout: "❌ Location request timed out. Please check your connection or try again.",
        required: "⚠️ Please enter your full name.",
        loading: "⏳ Checking your location...",
        generatingTip: "✨ Generating a tip for you...", // Loading message for Gemini API
        tipError: "❌ Could not generate tip. Please try again later.", // Error message for Gemini API
        location: "Jazan, Saudi Arabia",
        email: "example@creativeminds.edu.sa",
        website: "www.creativeminds.edu.sa"
    },
    ar: {
        // Site title "Creative Minds" is hardcoded in HTML/CSS to always be English.
        title: "نموذج تحضير",
        placeholder: "اكتب اسمك الثلاثي",
        submit: "تسجيل الحضور",
        generateTipButton: "✨ نصيحة اليوم ✨", // New text for Gemini API button
        success: "✅ تم تسجيل حضورك بنجاح!",
        already: "⚠️ لقد تم تحضيرك مسبقًا اليوم باسم ({name}).",
        nameMismatch: '❌ لقد تم تحضيرك مسبقًا اليوم باسم <span dir="ltr">({name})</span>، لا يمكنك اختيار اسم مختلف.',
        outOfRange: "❌ أنت خارج نطاق المعهد، يجب أن تكون في المعهد ليتم تسجيل حضورك.",
        geoError: "⚠️ لم نتمكن من تحديد موقعك، تأكد من تفعيل GPS ومنح الأذونات.",
        permissionDenied: "❌ تم رفض الوصول للموقع. يرجى السماح بالوصول للموقع لتسجيل الحضور.",
        positionUnavailable: "❌ معلومات الموقع غير متوفرة. يرجى المحاولة مرة أخرى.",
        timeout: "❌ انتهت مهلة طلب الموقع. يرجى التحقق من اتصالك أو المحاولة مرة أخرى.",
        required: "⚠️ الرجاء إدخال الاسم الثلاثي.",
        loading: "⏳ جاري التحقق من موقعك...",
        generatingTip: "✨ جاري توليد نصيحة لك...", // Loading message for Gemini API
        tipError: "❌ لم نتمكن من توليد النصيحة. يرجى المحاولة لاحقاً.", // Error message for Gemini API
        location: "جازان، المملكة العربية السعودية",
        email: "example@creativeminds.edu.sa",
        website: "www.creativeminds.edu.sa"
    }
};

// Location settings for geographical checks
const DEST_LAT = 16.889264;
const DEST_LON = 42.548691;
const ALLOWED_DISTANCE_KM = 0.2; // 200 meters
const ALLOWED_OUTSIDE_NAMES = ["TEST1", "TEST2"];
