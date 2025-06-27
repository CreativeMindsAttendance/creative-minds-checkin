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


    // Function to get a random Adhkar (ONLY in Arabic)
    const getRandomAdhkar = () => {
        const adhkarList = window.translations.ar.adhkar || []; // Always use Arabic Adhkar
        if (adhkarList.length > 0) {
            const randomIndex = Math.floor(Math.random() * adhkarList.length);
            return adhkarList[randomIndex];
        }
        return window.translations.ar.adhkarNotFound || "لا توجد أذكار متاحة.";
    };

    // Populate Adhkar on page load
    adhkarMessage.textContent = getRandomAdhkar();
    adhkarMessage.classList.add('show'); // Make sure it's visible initially


    // Function to update text content based on current language
    const updateContent = (lang) => {
        formTitle.textContent = window.translations[lang].formTitle;
        nameInput.placeholder = window.translations[lang].inputPlaceholder;
        submitBtn.textContent = window.translations[lang].submitButton;
        locationText.innerHTML = `📍 ${window.translations[lang].location}`;
        emailText.innerHTML = `📧 ${window.translations[lang].email}`;
        websiteText.innerHTML = `🌐 ${window.translations[lang].website}`;

        // Update active language option for visual slider
        langOptions.forEach(option => {
            if (option.dataset.lang === lang) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });

        // Set data-active-lang attribute, which CSS uses for slider position
        langToggle.dataset.activeLang = lang;
        
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
        // Set active class for correct icon position (this drives CSS transform)
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

        // Clear only status message, not adhkar message
        statusMessage.classList.remove('success', 'error', 'warning', 'info', 'show');
        statusMessage.textContent = ''; // Ensure it's clear

        if (!name) {
            statusMessage.textContent = window.translations[currentLang].emptyNameError;
            statusMessage.classList.add('warning', 'show');
            return;
        }

        // Check if already checked in today
        if (savedAttendance[todayDate]) {
            // Get the name from saved attendance
            const savedNameForToday = savedAttendance[todayDate].name;

            if (savedNameForToday.toLowerCase() === name.toLowerCase()) {
                // If names match (case-insensitive), it's a re-check-in by the same person
                // Only show the message, don't include the name if it's the exact user.
                // Or you can still show the name, based on preference.
                statusMessage.textContent = window.translations[currentLang].already.replace('{name}', savedNameForToday);
                statusMessage.classList.add('warning', 'show');
                return;
            } else {
                // Name mismatch
                let message = window.translations[currentLang].nameMismatch;
                // Check if the saved name is in ALLOWED_OUTSIDE_NAMES (our "TEST" names)
                if (window.ALLOWED_OUTSIDE_NAMES && window.ALLOWED_OUTSIDE_NAMES.includes(savedNameForToday.toUpperCase())) {
                    // If it's a "TEST" name, replace the placeholder with an empty string
                    message = message.replace('{name}', '');
                    // You might want a different message altogether if it's a test user
                    if (currentLang === 'ar') {
                         message = '❌ لقد تم تحضيرك مسبقًا اليوم.'; // More generic message for test users
                    } else {
                         message = '❌ You have already checked in today.';
                    }
                } else {
                    // For regular users, replace with the actual name
                    message = message.replace('{name}', savedNameForToday);
                }
                statusMessage.textContent = message;
                statusMessage.classList.add('error', 'show');
                return;
            }
        }


        statusMessage.textContent = window.translations[currentLang].loading;
        statusMessage.classList.add('info', 'show');
        submitBtn.disabled = true; // Disable button during check-in
        submitBtn.classList.add('loading');


        // Check if name is in ALLOWED_OUTSIDE_NAMES (for testing/special cases)
        // If the current entered name is an ALLOWED_OUTSIDE_NAME, bypass geolocation
        if (window.ALLOWED_OUTSIDE_NAMES && window.ALLOWED_OUTSIDE_NAMES.includes(name.toUpperCase())) {
            savedAttendance[todayDate] = { name: name, timestamp: new Date().toLocaleString() };
            localStorage.setItem('attendance', JSON.stringify(savedAttendance));
            statusMessage.textContent = window.translations[currentLang].success;
            statusMessage.classList.remove('info');
            statusMessage.classList.add('success', 'show');
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
