// Global variables for application state
let currentLang = localStorage.getItem("lang") || "ar"; // Current language, defaults to Arabic
let isDarkMode = localStorage.getItem("darkMode") === "true"; // Dark mode state, defaults to false

// Cached DOM elements for efficient access
const htmlElement = document.documentElement;
const bodyElement = document.body;
// Using nullish coalescing operator for safer DOM element caching
const langToggle = document.getElementById("lang-toggle");
const langOptions = langToggle?.querySelectorAll(".lang-option") || []; // Safe access
const modeToggle = document.getElementById("mode-toggle");
const formTitle = document.getElementById("form-title");
const nameInput = document.getElementById("nameInput");
const submitBtn = document.getElementById("submitBtn");
const adhkarMessage = document.getElementById("adhkarMessage"); // DOM element for Adhkar box
const statusMessage = document.getElementById("statusMessage");
const locationText = document.getElementById("location-text");
const emailText = document.getElementById("email-text");
const websiteText = document.getElementById("website-text");

// Initial console logs to check element existence on script load
console.log("--- SCRIPT.JS LOADED ---");
console.log("DOM Elements Check (initial load):");
console.log("langToggle:", langToggle);
console.log("modeToggle:", modeToggle);
console.log("adhkarMessage:", adhkarMessage);
console.log("submitBtn:", submitBtn);
console.log("nameInput:", nameInput);
console.log("statusMessage:", statusMessage);


/**
 * Loads and applies the current language translations to the UI.
 * Updates HTML lang attribute and specific text directions.
 */
function loadLang() {
    console.log("loadLang() called. Current language:", currentLang);
    // Ensure `translations` object is available from config.js (access via window)
    if (typeof window.translations === 'undefined' || !window.translations[currentLang]) {
        console.error("Error: 'translations' object or current language translations not found in window. Make sure config.js is loaded correctly and defines 'translations' globally.");
        // Set fallback text for critical elements if translations are missing
        if (formTitle) formTitle.textContent = "Attendance Form";
        if (nameInput) nameInput.placeholder = "Enter your full name";
        if (submitBtn) submitBtn.textContent = "Check In";
        if (locationText) locationText.textContent = "Location Error";
        if (emailText) emailText.textContent = "Email Error";
        if (websiteText) websiteText.textContent = "Website Error";
        if (adhkarMessage) adhkarMessage.textContent = "Translations or Adhkar data not available.";
        return;
    }

    const t = window.translations[currentLang]; // Get translations for the current language

    // Update HTML lang attribute for accessibility and browser features
    htmlElement.lang = currentLang;

    // Update UI text content based on selected language
    if (formTitle) formTitle.textContent = t.title || '';
    if (nameInput) nameInput.placeholder = t.placeholder || '';
    if (submitBtn) submitBtn.textContent = t.submit || '';
    
    // Update footer text content
    if (locationText) locationText.textContent = t.location || '';
    if (emailText) emailText.textContent = t.email || '';
    if (websiteText) websiteText.textContent = t.website || '';

    // Apply specific text direction (RTL/LTR) to relevant input/message elements
    if (nameInput) nameInput.style.direction = (currentLang === "ar" ? "rtl" : "ltr");
    if (statusMessage) statusMessage.style.direction = (currentLang === "ar" ? "rtl" : "ltr");
    if (adhkarMessage) adhkarMessage.style.direction = (currentLang === "ar" ? "rtl" : "ltr");

    // Update the language switcher UI (active state and slider position)
    if (langToggle) {
        langToggle.dataset.activeLang = currentLang;
        langOptions.forEach(option => {
            option.classList.toggle("active", option.dataset.lang === currentLang);
        });
    }

    hideMessage(); // Clear any previous status messages on language change
    displayRandomAdhkar(); // Display new adhkar on language change
}

/**
 * Applies or removes the dark mode class from the body and updates the toggle switch UI.
 * Saves the dark mode preference to localStorage.
 */
function applyDarkMode() {
    console.log("applyDarkMode() called. isDarkMode:", isDarkMode);
    bodyElement.classList.toggle("dark-mode", isDarkMode);
    if (modeToggle) {
        modeToggle.classList.toggle("active", isDarkMode);
    }
    localStorage.setItem("darkMode", isDarkMode);
}

/**
 * Calculates the distance between two geographical points using the Haversine formula.
 * @param {number} lat1 - Latitude of the first point.
 * @param {number} lon1 - Longitude of the first point.
 * @param {number} lat2 - Latitude of the second point.
 * @param {number} lon2 - Longitude of the second point.
 * @returns {number} Distance in kilometers.
 */
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Displays a status message to the user with a specified type and auto-hide duration.
 * @param {string} msg - The message to display.
 * @param {string} type - The type of message (e.g., "success", "error", "warning", "info").
 * @param {number} [duration=3000] - Duration in milliseconds before the message hides.
 */
function showMessage(msg, type = "info", duration = 3000) {
    console.log("showMessage() called. Message:", msg, "Type:", type);
    if (!statusMessage) {
        console.error("Error: Status message element (statusMessage) not found! Cannot display message.");
        return;
    }
    statusMessage.innerHTML = msg;
    statusMessage.className = `status-message show ${type}`;
    clearTimeout(statusMessage.hideTimeout);

    if (type === "error") {
        duration = 5000;
    }

    statusMessage.hideTimeout = setTimeout(() => {
        statusMessage.classList.remove("show");
    }, duration);
}

/**
 * Immediately hides the status message.
 */
function hideMessage() {
    console.log("hideMessage() called.");
    if (!statusMessage) return;
    statusMessage.classList.remove("show");
    clearTimeout(statusMessage.hideTimeout);
}

/**
 * Checks if a user has already checked in today based on localStorage record.
 * @returns {string|boolean} The name of the user if checked in today, otherwise false.
 */
function hasCheckedInToday() {
    const record = localStorage.getItem("attendanceRecord");
    if (!record) return false;

    try {
        const { name, date } = JSON.parse(record);
        const today = new Date().toISOString().split("T")[0];
        return date === today ? name : false;
    } catch (e) {
        console.error("Error parsing attendance record from localStorage:", e);
        localStorage.removeItem("attendanceRecord");
        return false;
    }
}

/**
 * Saves the attendance record to localStorage for the current day.
 * @param {string} name - The name of the person checking in.
 */
function saveAttendance(name) {
    const today = new Date().toISOString().split("T")[0];
    const record = {
        name: name.trim(),
        date: today,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem("attendanceRecord", JSON.stringify(record));
}

/**
 * Main function to handle attendance submission.
 * Validates input, checks for previous check-ins, verifies location, and saves data.
 */
function submitAttendance() {
    console.log("submitAttendance() called.");
    const name = nameInput.value.trim();
    // Access translations via window object
    const t = window.translations?.[currentLang]; // Safe access to translations

    // Disable inputs and buttons during processing to prevent multiple submissions
    if (nameInput) nameInput.disabled = true;
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add("loading");
    }

    // Validate if name input is empty
    if (!name) {
        showMessage(t?.required || "Please enter your full name.", "error");
        if (nameInput) nameInput.disabled = false;
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove("loading");
        }
        if (nameInput) nameInput.focus();
        return;
    }

    // Check if the user has already checked in today
    const existingName = hasCheckedInToday();
    if (existingName) {
        if (name.toLowerCase() !== existingName.toLowerCase()) {
            showMessage((t?.nameMismatch || 'You have already checked in today as ({name}).').replace("{name}", existingName), "error");
        } else {
            showMessage((t?.already || 'You have already checked in today as ({name}).').replace("{name}", existingName), "warning");
        }
        if (nameInput) nameInput.disabled = false;
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove("loading");
        }
        return;
    }

    // Access location constants from the global scope (defined in config.js)
    const DEST_LAT_GLOBAL = window.DEST_LAT;
    const DEST_LON_GLOBAL = window.DEST_LON;
    const ALLOWED_DISTANCE_KM_GLOBAL = window.ALLOWED_DISTANCE_KM;
    const ALLOWED_OUTSIDE_NAMES_GLOBAL = window.ALLOWED_OUTSIDE_NAMES;


    // Check if the user's name is in the allowed list for outside check-ins
    if (ALLOWED_OUTSIDE_NAMES_GLOBAL && ALLOWED_OUTSIDE_NAMES_GLOBAL.map(n => n.toLowerCase()).includes(name.toLowerCase())) {
        saveAttendance(name);
        showMessage(t?.success || "Your attendance has been recorded successfully!", "success");
        if (nameInput) nameInput.value = "";
        if (nameInput) nameInput.disabled = false;
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove("loading");
        }
        return;
    }

    // If Geolocation API is not available in the browser
    if (!navigator.geolocation) {
        showMessage(t?.geoError || "Location not detected. Please ensure GPS is enabled and permissions are granted.", "error");
        if (nameInput) nameInput.disabled = false;
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove("loading");
        }
        return;
    }

    showMessage(t?.loading || "Checking your location...", "info");

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;
            const distance = getDistanceFromLatLonInKm(userLat, userLon, DEST_LAT_GLOBAL, DEST_LON_GLOBAL);

            if (distance <= ALLOWED_DISTANCE_KM_GLOBAL) {
                saveAttendance(name);
                showMessage(t?.success || "Your attendance has been recorded successfully!", "success");
                if (nameInput) nameInput.value = "";
            } else {
                showMessage(t?.outOfRange || "You are outside the institute range. You must be at the institute to check in.", "error");
            }
            if (nameInput) nameInput.disabled = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove("loading");
            }
        },
        (error) => {
            console.error("Geolocation error:", error);
            let errorMessage = t?.geoError || "Location not detected. Please ensure GPS is enabled and permissions are granted.";
            if (error.code === error.PERMISSION_DENIED) {
                errorMessage = t?.permissionDenied || "Location access denied. Please allow location access to check in.";
            } else if (error.code === error.POSITION_UNAVAILABLE) {
                errorMessage = t?.positionUnavailable || "Location information is unavailable. Please try again.";
            } else if (error.code === error.TIMEOUT) {
                errorMessage = t?.timeout || "Location request timed out. Please check your connection or try again.";
            }
            showMessage(errorMessage, "error");
            if (nameInput) nameInput.disabled = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove("loading");
            }
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

/**
 * Displays a random Adhkar (invocation) from the list in config.js.
 */
function displayRandomAdhkar() {
    console.log("displayRandomAdhkar() called.");
    if (!adhkarMessage) {
        console.error("Error: Adhkar message element (adhkarMessage) not found! Cannot display adhkar.");
        return;
    }

    // Ensure `adhkar` array is available from config.js (using window.adhkar as it's global)
    if (typeof window.adhkar === 'undefined' || window.adhkar.length === 0) {
        const t = window.translations?.[currentLang];
        adhkarMessage.textContent = (t && t.adhkarError) ? t.adhkarError : "Adhkar data not available.";
        console.error("Error: 'adhkar' array is undefined or empty in window.adhkar!");
        return;
    }
    const randomIndex = Math.floor(Math.random() * window.adhkar.length);
    adhkarMessage.textContent = window.adhkar[randomIndex];
    console.log("Adhkar displayed:", window.adhkar[randomIndex]);
}


/**
 * Initializes the application: loads preferences, sets up event listeners.
 */
function init() {
    console.log("init() called. Performing DOM element checks and setting up listeners.");

    // Check if critical DOM elements are present right at the start of init
    const requiredElements = {
        langToggle: langToggle,
        modeToggle: modeToggle,
        formTitle: formTitle,
        nameInput: nameInput,
        submitBtn: submitBtn,
        adhkarMessage: adhkarMessage,
        statusMessage: statusMessage,
        locationText: locationText,
        emailText: emailText,
        websiteText: websiteText
    };

    for (const [key, value] of Object.entries(requiredElements)) {
        if (!value) {
            console.error(`CRITICAL ERROR: DOM element '${key}' not found. Check HTML IDs.`);
            // If a critical element is missing, further operations relying on it will fail.
            // Consider disabling features or showing a prominent error to the user.
        }
    }

    // Load and apply dark mode preference from localStorage
    isDarkMode = localStorage.getItem("darkMode") === "true";
    applyDarkMode();

    // Load and apply language preferences from localStorage
    // This will also trigger displayRandomAdhkar()
    loadLang(); 

    // Event listener for language toggle button
    if (langToggle) {
        langToggle.addEventListener("click", () => {
            console.log("Language toggle click listener fired!");
            currentLang = (currentLang === "ar" ? "en" : "ar");
            localStorage.setItem("lang", currentLang);
            loadLang();
        });
    } else {
        console.error("Language toggle element not found. Event listener not attached.");
    }

    // Event listener for dark mode toggle button
    if (modeToggle) {
        modeToggle.addEventListener("click", () => {
            console.log("Dark mode toggle click listener fired!");
            isDarkMode = !isDarkMode;
            applyDarkMode();
        });
    } else {
        console.error("Dark mode toggle element not found. Event listener not attached.");
    }

    // Event listener for the "Submit Attendance" button
    if (submitBtn) {
        submitBtn.addEventListener("click", submitAttendance);
    } else {
        console.error("Submit button element not found. Event listener not attached.");
    }

    // Allow "Enter" key press in the name input field to submit attendance
    if (nameInput) {
        nameInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                submitAttendance();
            }
        });
        nameInput.addEventListener("input", hideMessage);
        nameInput.focus();
    } else {
        console.error("Name input element not found.");
    }
    
    console.log("init() completed.");
}

// Start the application once the DOM (Document Object Model) is fully loaded
document.addEventListener("DOMContentLoaded", init);
