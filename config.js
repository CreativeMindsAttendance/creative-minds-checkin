// Translations data for English and Arabic
const translations = {
    en: {
        siteTitle: "Creative Minds",
        formTitle: "Attendance Form",
        inputPlaceholder: "Enter your full name",
        submitButton: "Check In",
        success: "✅ Your attendance has been recorded successfully!",
        already: "⚠️ You have already checked in today as {name}.", // No LTR span here, JS will handle
        nameMismatch: '❌ You have already checked in today as {name}. You cannot use a different name.', // No LTR span, JS will handle
        outOfRange: "❌ You are outside the institute range. You must be at the institute to check in.",
        geoError: "⚠️ Location not detected. Please ensure GPS is enabled and permissions are granted.",
        permissionDenied: "❌ Location access denied. Please allow location access to check in.",
        positionUnavailable: "❌ Location information is unavailable. Please try again.",
        timeout: "❌ Location request timed out. Please check your connection or try again.",
        emptyNameError: "⚠️ Please enter your full name.",
        adhkarLoading: "⏳ Checking your location...",
        adhkarError: "Could not load remembrance. Please try again later.",
        adhkarNotFound: "No remembrances available.",
        location: "Jazan, Saudi Arabia",
        email: "+966 56 226 4473",
        website: "creativeminds993",
        adhkar: [],
        guideButton: "Teacher Guide",
    },
    ar: {
        siteTitle: "Creative Minds",
        formTitle: "نموذج تحضير",
        inputPlaceholder: "اكتب اسمك الثلاثي",
        submitButton: "تسجيل الحضور",
        success: "✅ تم تسجيل حضورك بنجاح!",
        already: "⚠️ لقد تم تحضيرك مسبقًا اليوم باسم {name}.", // No LTR span, JS will handle
        nameMismatch: '❌ لقد تم تحضيرك مسبقًا اليوم باسم {name}، لا يمكنك اختيار اسم مختلف.', // No LTR span, JS will handle
        outOfRange: "❌ أنت خارج نطاق المعهد، يجب أن تكون في المعهد ليتم تسجيل حضورك.",
        geoError: "⚠️ لم نتمكن من تحديد موقعك، تأكد من تفعيل GPS ومنح الأذونات.",
        permissionDenied: "❌ تم رفض الوصول للموقع. يرجى السماح بالوصول للموقع لتسجيل الحضور.",
        positionUnavailable: "❌ معلومات الموقع غير متوفرة. يرجى المحاولة مرة أخرى.",
        timeout: "❌ انتهت مهلة طلب الموقع. يرجى التحقق من اتصالك أو المحاولة مرة أخرى.",
        emptyNameError: "⚠️ الرجاء إدخال الاسم الثلاثي.",
        adhkarLoading: "⏳ جاري التأكد من الموقع...",
        adhkarError: "لم نتمكن من تحميل الأذكار. يرجى المحاولة لاحقاً.",
        adhkarNotFound: "لا توجد أذكار متاحة.",
        location: "جازان، المملكة العربية السعودية",
        email: "+966 56 226 4473",
        website: "creativeminds993",
        guideButton: "دليل المعلم",
        adhkar: [
            "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ",
            "لا حَوْلَ وَلا قُوَّةَ إِلا بِاللَّهِ",
            "لا إِلَهَ إِلا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
            "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ",
            "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
            "اللهم إنك عفو تحب العفو فاعف عني",
            "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ",
            "أستغفر الله العظيم الذي لا إله إلا هو الحي القيوم وأتوب إليه"
        ]
    }
};

// Location settings for geographical checks
window.ALLOWED_DISTANCE_KM = 1.0; // 1000 meters
window.ALLOWED_OUTSIDE_NAMES = ["TEST1", "TEST2", "JOHN DOE"]; // Example test names


// config.js
const CONFIG = {
  SHEET_WEBHOOK: "https://script.google.com/macros/s/AKfycbxvRE1VR0hcx6z2OjIjlJ95W8Q0UuFmfk7mVmURl9d01wq0jH3R6-ECsIghHpuSaX2Z/exec"
};
