// Helper function to calculate distance (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
}

// Function to get today's date in YYYY-MM-DD format for storage
function getTodayDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months start at 0!
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}


document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('nameInput');
    const submitBtn = document.getElementById('submitBtn');
    const adhkarMessage = document.getElementById('adhkarMessage');
    const statusMessage = document.getElementById('statusMessage');
    const langToggle = document.getElementById('lang-toggle');
    const langOptions = langToggle.querySelectorAll('.lang-option');
    const modeToggle = document.getElementById('mode-toggle');
    const siteTitle = document.getElementById('site-title');
    const formTitle = document.getElementById('form-title');
    const locationText = document.getElementById('location-text');
    const emailText = document.getElementById('email-text');
    const websiteText = document.getElementById('website-text');


    // Function to get a random Adhkar (now ONLY in Arabic as requested)
    const getRandomAdhkar = () => {
        // Always use Arabic Adhkar regardless of current language
        const adhkarList = window.translations.ar.adhkar || [];
        if (adhkarList.length > 0) {
            const randomIndex = Math.floor(Math.random() * adhkarList.length);
            return adhkarList[randomIndex];
        }
        // Fallback if no Adhkar available (still in Arabic)
        return window.translations.ar.adhkarNotFound || "لا توجد أذكار متاحة.";
    };

    // Function to update text content based on current language
    const updateContent = (lang) => {
        // Site title "Creative Minds" is intentionally hardcoded in HTML/CSS to always be English,
        // so we don't translate it here.
        formTitle.textContent = window.translations[lang].formTitle;
        nameInput.placeholder = window.translations[lang].inputPlaceholder;
        submitBtn.textContent = window.translations[lang].submitButton;
        locationText.innerHTML = `📍 ${window.translations[lang].location}`;
        emailText.innerHTML = `📧 ${window.translations[lang].email}`;
        websiteText.innerHTML = `🌐 ${window.translations[lang].website}`;

        statusMessage.textContent = ''; // Clear any previous status message
        statusMessage.classList.remove('success', 'error', 'warning', 'info', 'show');
        adhkarMessage.textContent = ''; // Clear adhkar message on language change
        adhkarMessage.classList.remove('success', 'error', 'info', 'show');

        // Update active language option
        langOptions.forEach(option => {
            if (option.dataset.lang === lang) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });

        // Update slider position for language toggle
        langToggle.dataset.activeLang = lang; // This drives the CSS for slider position
        
        // Set body direction and HTML lang attribute based on language
        document.body.dir = (lang === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.lang = lang; // Set lang attribute on <html> tag
    };

    // Load saved language or default to English
    const savedLang = localStorage.getItem('language') || 'en';
    updateContent(savedLang);

    // Language Toggle Event Listener
    langToggle.addEventListener('click', () => {
        const currentLang = langToggle.dataset.activeLang;
        const newLang = currentLang === 'en' ? 'ar' : 'en';
        localStorage.setItem('language', newLang);
        updateContent(newLang);
    });

    // Dark Mode Toggle
    const toggleDarkMode = () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        // Set active class for correct icon position
        modeToggle.classList.toggle('active', isDarkMode);
    };

    // Load saved dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        modeToggle.classList.add('active'); // Set active class for correct icon position
    }

    modeToggle.addEventListener('click', toggleDarkMode);


    // Geolocation and Attendance Logic
    const handleAttendance = () => {
        const name = nameInput.value.trim();
        const currentLang = localStorage.getItem('language') || 'en';
        const todayDate = getTodayDate();
        const savedAttendance = JSON.parse(localStorage.getItem('attendance')) || {};

        statusMessage.classList.remove('success', 'error', 'warning', 'info', 'show');
        adhkarMessage.classList.remove('success', 'error', 'info', 'show');

        if (!name) {
            statusMessage.textContent = window.translations[currentLang].emptyNameError;
            statusMessage.classList.add('warning', 'show');
            return;
        }

        // Check if already checked in today
        if (savedAttendance[todayDate]) {
            if (savedAttendance[todayDate].name.toLowerCase() === name.toLowerCase()) {
                statusMessage.textContent = window.translations[currentLang].already.replace('{name}', savedAttendance[todayDate].name);
                statusMessage.classList.add('warning', 'show');
                return;
            } else {
                statusMessage.textContent = window.translations[currentLang].nameMismatch.replace('{name}', savedAttendance[todayDate].name);
                statusMessage.classList.add('error', 'show');
                return;
            }
        }

        statusMessage.textContent = window.translations[currentLang].loading;
        statusMessage.classList.add('info', 'show');
        submitBtn.disabled = true; // Disable button during check-in
        submitBtn.classList.add('loading');


        // Check if name is in ALLOWED_OUTSIDE_NAMES (for testing/special cases)
        if (window.ALLOWED_OUTSIDE_NAMES && window.ALLOWED_OUTSIDE_NAMES.includes(name.toUpperCase())) {
            savedAttendance[todayDate] = { name: name, timestamp: new Date().toLocaleString() };
            localStorage.setItem('attendance', JSON.stringify(savedAttendance));
            statusMessage.textContent = window.translations[currentLang].success;
            statusMessage.classList.remove('info');
            statusMessage.classList.add('success', 'show');
            adhkarMessage.textContent = getRandomAdhkar();
            adhkarMessage.classList.add('success', 'show');
            nameInput.value = ''; // Clear input
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            return; // Exit as attendance is recorded
        }


        // Geolocation Logic
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLat = position.coords.latitude;
                    const userLon = position.coords.longitude;
                    const distance = calculateDistance(window.DEST_LAT, window.DEST_LON, userLat, userLon);

                    if (distance <= window.ALLOWED_DISTANCE_KM) {
                        // User is within range, record attendance
                        savedAttendance[todayDate] = { name: name, timestamp: new Date().toLocaleString(), lat: userLat, lon: userLon };
                        localStorage.setItem('attendance', JSON.stringify(savedAttendance));
                        statusMessage.textContent = window.translations[currentLang].success;
                        statusMessage.classList.remove('info');
                        statusMessage.classList.add('success', 'show');
                        adhkarMessage.textContent = getRandomAdhkar();
                        adhkarMessage.classList.add('success', 'show');
                        nameInput.value = ''; // Clear input
                    } else {
                        // User is outside range
                        statusMessage.textContent = window.translations[currentLang].outOfRange;
                        statusMessage.classList.remove('info');
                        statusMessage.classList.add('error', 'show');
                    }
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('loading');
                },
                (error) => {
                    let errorMessage = window.translations[currentLang].geoError;
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = window.translations[currentLang].permissionDenied;
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = window.translations[currentLang].positionUnavailable;
                            break;
                        case error.TIMEOUT:
                            errorMessage = window.translations[currentLang].timeout;
                            break;
                    }
                    statusMessage.textContent = errorMessage;
                    statusMessage.classList.remove('info');
                    statusMessage.classList.add('error', 'show');
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('loading');
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            // Geolocation not supported by browser
            statusMessage.textContent = window.translations[currentLang].geoError;
            statusMessage.classList.remove('info');
            statusMessage.classList.add('error', 'show');
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    };

    // Submit Button Event Listener
    submitBtn.addEventListener('click', handleAttendance);
});
