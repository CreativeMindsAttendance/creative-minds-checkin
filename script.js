// Global variables for application state
let currentLang = localStorage.getItem("lang") || "ar"; // Current language, defaults to Arabic
let isDarkMode = localStorage.getItem("darkMode") === "true"; // Dark mode state, defaults to false

// Configuration for location services and allowed names:
// These constants are now accessed from the global `window` object,
// as they are declared in `config.js` and become globally available when `config.js` loads.
// DO NOT re-declare them here to avoid "already been declared" errors.

// Cached DOM elements for efficient access
const htmlElement = document.documentElement;
const bodyElement = document.body;
const langToggle = document.getElementById("lang-toggle");
// Ensure langOptions is safe even if langToggle is null initially
const langOptions = langToggle ? langToggle.querySelectorAll(".lang-option") : [];
const modeToggle = document.getElementById("mode-toggle");
const formTitle = document.getElementById("form-title");
const nameInput = document.getElementById("nameInput");
const submitBtn = document.getElementById("submitBtn");
const adhkarMessage = document.getElementById("adhkarMessage"); // DOM element for Adhkar box
const statusMessage = document.getElementById("statusMessage");
const locationText = document.getElementById("location-text");
const emailText = document.getElementById("email-text");
const websiteText = document.getElementById("website-text");


/**
 * Loads and applies the current language translations to the UI.
 * Updates HTML lang attribute and specific text directions.
 */
function loadLang() {
    console.log("loadLang() called. Current language:", currentLang); // Debug log
    // Ensure `translations` object is available from config.js (access via window)
    if (typeof window.translations === 'undefined') {
        console.error("Error: 'translations' object not found in window. Make sure config.js is loaded correctly and defines 'translations' globally.");
        // Attempt to load translations from an empty object to prevent further errors if not found
        const t = {};
        if (formTitle) formTitle.textContent = "Error: Translations not loaded.";
        return;
    }
    const t = window.translations[currentLang]; // Get translations for the current language

    // Update HTML lang attribute for accessibility and browser features
    htmlElement.lang = currentLang;

    // Update UI text content based on selected language
    // Note: The site title "Creative Minds" is intentionally NOT translated here,
    // as per user requirement, and remains English.
    if (formTitle) formTitle.textContent = t.title || ''; // Fallback to empty string
    if (nameInput) nameInput.placeholder = t.placeholder || '';
    if (submitBtn) submitBtn.textContent = t.submit || '';
    
    // Update footer text content
    if (locationText) locationText.textContent = t.location || '';
    if (emailText) emailText.textContent = t.email || '';
    if (websiteText) websiteText.textContent = t.website || '';

    // Apply specific text direction (RTL/LTR) to relevant input/message elements
    // This avoids flipping the entire page layout while still ensuring text reads correctly.
    if (nameInput) nameInput.style.direction = (currentLang === "ar" ? "rtl" : "ltr");
    if (statusMessage) statusMessage.style.direction = (currentLang === "ar" ? "rtl" : "ltr");
    if (adhkarMessage) adhkarMessage.style.direction = (currentLang === "ar" ? "rtl" : "ltr"); // Adhkar message box direction

    // Update the language switcher UI (active state and slider position)
    if (langToggle) { // Check if langToggle exists
        langToggle.dataset.activeLang = currentLang; // CSS uses this data attribute for slider positioning
        langOptions.forEach(option => {
            option.classList.toggle("active", option.dataset.lang === currentLang);
        });
    } else {
        console.warn("Warning: langToggle element not found in loadLang().");
    }

    hideMessage(); // Clear any previous status messages on language change
    displayRandomAdhkar(); // Display new adhkar on language change
}

/**
 * Applies or removes the dark mode class from the body and updates the toggle switch UI.
 * Saves the dark mode preference to localStorage.
 */
function applyDarkMode() {
    console.log("applyDarkMode() called. isDarkMode:", isDarkMode); // Debug log
    bodyElement.classList.toggle("dark-mode", isDarkMode); // Toggle dark-mode class on body
    if (modeToggle) { // Check if modeToggle exists
        modeToggle.classList.toggle("active", isDarkMode); // Update the visual state of the toggle switch
    } else {
        console.warn("Warning: modeToggle element not found in applyDarkMode().");
    }
    localStorage.setItem("darkMode", isDarkMode); // Save preference
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
    const dLat = (lat2 - lat1) * Math.PI / 180; // Delta Latitude in radians
    const dLon = (lon2 - lon1) * Math.PI / 180; // Delta Longitude in radians
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}

/**
 * Displays a status message to the user with a specified type and auto-hide duration.
 * @param {string} msg - The message to display.
 * @param {string} type - The type of message (e.g., "success", "error", "warning", "info").
 * @param {number} [duration=3000] - Duration in milliseconds before the message hides.
 */
function showMessage(msg, type = "info", duration = 3000) {
    console.log("showMessage() called. Message:", msg, "Type:", type); // Debug log
    if (!statusMessage) { // Check if statusMessage exists before trying to use it
        console.error("Error: Status message element (statusMessage) not found!");
        return;
    }
    statusMessage.innerHTML = msg; // Set message text
    statusMessage.className = `status-message show ${type}`; // Apply classes for styling and visibility
    clearTimeout(statusMessage.hideTimeout); // Clear any previous auto-hide timeout

    // Adjust duration for error messages to give user more time to read
    if (type === "error") {
        duration = 5000;
    }

    // Set a new auto-hide timeout
    statusMessage.hideTimeout = setTimeout(() => {
        statusMessage.classList.remove("show");
    }, duration);
}

/**
 * Immediately hides the status message.
 */
function hideMessage() {
    console.log("hideMessage() called."); // Debug log
    if (!statusMessage) return; // Check if statusMessage exists
    statusMessage.classList.remove("show"); // Remove 'show' class to hide
    clearTimeout(statusMessage.hideTimeout); // Clear any pending auto-hide timeout
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
        const today = new Date().toISOString().split("T")[0]; // Get current date in "YYYY-MM-DD" format
        return date === today ? name : false; // Return name if date matches, else false
    } catch (e) {
        console.error("Error parsing attendance record from localStorage:", e);
        localStorage.removeItem("attendanceRecord"); // Clear corrupted record to prevent future issues
        return false;
    }
}

/**
 * Saves the attendance record to localStorage for the current day.
 * @param {string} name - The name of the person checking in.
 */
function saveAttendance(name) {
    const today = new Date().toISOString().split("T")[0]; // Get current date
    const record = {
        name: name.trim(), // Store trimmed name
        date: today,
        timestamp: new Date().toISOString() // Store full timestamp for more detail
    };
    localStorage.setItem("attendanceRecord", JSON.stringify(record)); // Save as JSON string
}

/**
 * Main function to handle attendance submission.
 * Validates input, checks for previous check-ins, verifies location, and saves data.
 */
function submitAttendance() {
    console.log("submitAttendance() called."); // Debug log
    const name = nameInput.value.trim();
    // Access translations via window object
    const t = window.translations[currentLang]; // Get current language translations

    // Disable inputs and buttons during processing to prevent multiple submissions
    if (nameInput) nameInput.disabled = true;
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add("loading"); // Show loading spinner on submit button
    }


    // Validate if name input is empty
    if (!name) {
        showMessage(t.required || "Please enter your full name.", "error"); // Fallback message
        // Re-enable elements if validation fails
        if (nameInput) nameInput.disabled = false;
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove("loading");
        }
        if (nameInput) nameInput.focus(); // Focus back on input for user to correct
        return;
    }

    // Check if the user has already checked in today
    const existingName = hasCheckedInToday();
    if (existingName) {
        // If a different name is used by someone who already checked in
        if (name.toLowerCase() !== existingName.toLowerCase()) {
            showMessage((t.nameMismatch || 'You have already checked in today as ({name}).').replace("{name}", existingName), "error");
        } else {
            // Same name, already checked in
            showMessage((t.already || 'You have already checked in today as ({name}).').replace("{name}", existingName), "warning");
        }
        // Re-enable elements
        if (nameInput) nameInput.disabled = false;
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove("loading");
        }
        return;
    }

    // Access location constants from the global scope (defined in config.js)
    // Using `window` explicitly ensures they are accessed from the global scope
    // where `config.js` has defined them.
    const DEST_LAT_GLOBAL = window.DEST_LAT;
    const DEST_LON_GLOBAL = window.DEST_LON;
    const ALLOWED_DISTANCE_KM_GLOBAL = window.ALLOWED_DISTANCE_KM;
    const ALLOWED_OUTSIDE_NAMES_GLOBAL = window.ALLOWED_OUTSIDE_NAMES;


    // Check if the user's name is in the allowed list for outside check-ins
    if (ALLOWED_OUTSIDE_NAMES_GLOBAL && ALLOWED_OUTSIDE_NAMES_GLOBAL.map(n => n.toLowerCase()).includes(name.toLowerCase())) {
        saveAttendance(name); // Save attendance without GPS check
        showMessage(t.success || "Your attendance has been recorded successfully!", "success"); // Fallback message
        if (nameInput) nameInput.value = ""; // Clear input
        // Re-enable elements
        if (nameInput) nameInput.disabled = false;
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove("loading");
        }
        return;
    }

    // If Geolocation API is not available in the browser
    if (!navigator.geolocation) {
        showMessage(t.geoError || "Location not detected. Please ensure GPS is enabled and permissions are granted.", "error");
        // Re-enable elements
        if (nameInput) nameInput.disabled = false;
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove("loading");
        }
        return;
    }

    showMessage(t.loading || "Checking your location...", "info"); // Show loading message while checking location

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;
            // Use the global constants for distance calculation
            const distance = getDistanceFromLatLonInKm(userLat, userLon, DEST_LAT_GLOBAL, DEST_LON_GLOBAL);

            if (distance <= ALLOWED_DISTANCE_KM_GLOBAL) {
                saveAttendance(name); // Save attendance if within allowed distance
                showMessage(t.success || "Your attendance has been recorded successfully!", "success");
                if (nameInput) nameInput.value = ""; // Clear input
            } else {
                showMessage(t.outOfRange || "You are outside the institute range. You must be at the institute to check in.", "error"); // User is too far from the institute
            }
            // Always re-enable elements after a successful or failed location check
            if (nameInput) nameInput.disabled = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove("loading");
            }
        },
        (error) => {
            console.error("Geolocation error:", error); // Log detailed error to console
            let errorMessage = t.geoError || "Location not detected. Please ensure GPS is enabled and permissions are granted."; // Default error message
            // Provide more specific error messages based on Geolocation API error codes
            if (error.code === error.PERMISSION_DENIED) {
                errorMessage = t.permissionDenied || "Location access denied. Please allow location access to check in.";
            } else if (error.code === error.POSITION_UNAVAILABLE) {
                errorMessage = t.positionUnavailable || "Location information is unavailable. Please try again.";
            } else if (error.code === error.TIMEOUT) {
                errorMessage = t.timeout || "Location request timed out. Please check your connection or try again.";
            }
            showMessage(errorMessage, "error"); // Display specific error message
            // Always re-enable elements after an error
            if (nameInput) nameInput.disabled = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove("loading");
            }
        },
        {
            enableHighAccuracy: true, // Request the most accurate position
            timeout: 10000, // Maximum time (10 seconds) to wait for a position
            maximumAge: 0 // Do not use a cached position; request a fresh one
        }
    );
}

/**
 * Displays a random Adhkar (invocation) from the list in config.js.
 */
function displayRandomAdhkar() {
    console.log("displayRandomAdhkar() called."); // Debug log
    if (!adhkarMessage) { // Check if adhkarMessage element exists
        console.error("Error: Adhkar message element (adhkarMessage) not found!");
        return;
    }

    // Ensure `adhkar` array is available from config.js (using window.adhkar as it's global)
    if (typeof window.adhkar === 'undefined' || window.adhkar.length === 0) {
        // Use the new error translation from translations object, checking for its existence
        const t = window.translations[currentLang]; // Access via window
        adhkarMessage.textContent = (t && t.adhkarError) ? t.adhkarError : "Adhkar not available."; // Fallback message
        console.error("Error: 'adhkar' array is undefined or empty in window.adhkar!"); // Debug log
        return;
    }
    const randomIndex = Math.floor(Math.random() * window.adhkar.length);
    adhkarMessage.textContent = window.adhkar[randomIndex];
    console.log("Adhkar displayed:", window.adhkar[randomIndex]); // Debug log
}


/**
 * Initializes the application: loads preferences, sets up event listeners.
 */
function init() {
    console.log("init() called. Performing DOM element checks and setting up listeners."); // Debug log

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
            console.error(`CRITICAL ERROR: DOM element '${key}' not found.`);
            // If a critical element is missing, we might stop initialization or disable features
            // For now, we'll continue but log the error prominently.
        }
    }


    // Load and apply dark mode preference from localStorage
    isDarkMode = localStorage.getItem("darkMode") === "true";
    applyDarkMode();

    // Load and apply language preferences from localStorage
    loadLang(); // This will also call displayRandomAdhkar()

    // Event listener for language toggle button
    if (langToggle) { // Add a check to ensure element exists
        langToggle.addEventListener("click", () => {
            console.log("Language toggle clicked!"); // Debug log
            // Toggle language between Arabic and English
            currentLang = (currentLang === "ar" ? "en" : "ar");
            localStorage.setItem("lang", currentLang); // Save new language preference
            loadLang(); // Reload UI with new language
        });
    } else {
        console.error("Error: #lang-toggle element not found during init. Cannot attach event listener.");
    }

    // Event listener for dark mode toggle button
    if (modeToggle) { // Add a check to ensure element exists
        modeToggle.addEventListener("click", () => {
            console.log("Dark mode toggle clicked!"); // Debug log
            isDarkMode = !isDarkMode; // Toggle the boolean state (true/false)
            applyDarkMode(); // Apply new dark mode state
        });
    } else {
        console.error("Error: #mode-toggle element not found during init. Cannot attach event listener.");
    }

    // Event listener for the "Submit Attendance" button
    if (submitBtn) {
        submitBtn.addEventListener("click", submitAttendance);
    } else {
        console.error("Error: #submitBtn element not found during init. Cannot attach event listener.");
    }

    // Allow "Enter" key press in the name input field to submit attendance
    if (nameInput) {
        nameInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                submitAttendance();
            }
        });

        // Clear status message when user starts typing in the name input
        nameInput.addEventListener("input", hideMessage);

        // Set initial focus on the name input field for better user experience
        nameInput.focus();
    } else {
        console.error("Error: #nameInput element not found during init.");
    }
}

// Start the application once the DOM (Document Object Model) is fully loaded
document.addEventListener("DOMContentLoaded", init);
