// ==UserScript==
// @name         DVSA Test Booking Monitor
// @version      2025-06-20
// @description  Alerts when new driving test slots become available
// @match        https://driverpracticaltest.dvsa.gov.uk/manage*
// ==/UserScript==

(function () {
    'use strict';

    const ALERT_SOUND_URL = "https://www.dropbox.com/scl/fi/3r3mn7hjqr1fdy1rl3obz/eas-alarm-phone-alarm-262882.mp3?rlkey=i13caflmbk6ap5ttlyyvgscvz&st=2m7esq4j&dl=1";
    const alertSound = new Audio(ALERT_SOUND_URL);

    const MIN_TIME = 40000;
    const MAX_TIME = 120000;
    const QUICK_MIN_TIME = 1000;
    const QUICK_MAX_TIME = 2000;

    const CENTRES = [
        { id: 'centre-name-6305', name: 'Avonmouth' },
        { id: 'centre-name-1357', name: 'Kingswood' }
    ];

    const TARGET_START_DATE = new Date("2025-08-21");
    const TARGET_END_DATE = new Date("2025-10-31");
    const DEFAULT_POSTCODE = "BS8";

    let slotFoundGlobal = false;

    function extractDate(text) {
        const match = text.match(/(\d{2}\/\d{2}\/\d{4})/);
        if (!match) return null;
        const [day, month, year] = match[1].split("/");
        const date = new Date("${year}-${month}-${day}");
        return isNaN(date) ? null : date;
    }

    function goBackHome() {
        location.href = "https://driverpracticaltest.dvsa.gov.uk/manage";
    }

    function playAlert() {
        alertSound.play().catch(() => {});
    }

    function randomIntBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function handleInterstitial() {
        if (document.getElementById('interstitial-inprogress')) {
            setTimeout(goBackHome, randomIntBetween(MIN_TIME, MAX_TIME));
        } else {
            playAlert();
        }
    }

    function handleBookingDetailsPage() {
        const changeButton = document.getElementById("test-centre-change");
        if (changeButton) {
            setTimeout(() => changeButton.click(), randomIntBetween(2000, 4000));
        }
    }

    function handleTestCentrePage() {
        for (const centre of CENTRES) {
            const element = document.getElementById(centre.id);
            if (!element) continue;
            const availableDate = extractDate(element.textContent);
            if (
                availableDate &&
                availableDate >= TARGET_START_DATE &&
                availableDate <= TARGET_END_DATE
            ) {
                setTimeout(() => {
                    element.click();
                }, randomIntBetween(QUICK_MIN_TIME, QUICK_MAX_TIME));
                slotFoundGlobal = true;
                if (slotFoundGlobal) {
                    playAlert();
                }
            }
        }

        if (!slotFoundGlobal) {
            setTimeout(goBackHome, randomIntBetween(MIN_TIME, MAX_TIME));
        }

        // If none of the centres are present, search by postcode
        if (!CENTRES.some(c => document.getElementById(c.id))) {
            const input = document.getElementById("test-centres-input");
            const submit = document.getElementById("test-centres-submit");
            if (input && submit) {
                input.value = DEFAULT_POSTCODE;
                setTimeout(() => submit.click(), randomIntBetween(2000, 4000));
            }
        }
    }

    // Main logic
    function checkTitleAndHandle() {
        if (!slotFoundGlobal) {
            const title = document.title;
            if (title.includes("Test centre - Change booking")) {
                handleTestCentrePage();
            } else if (title.includes("Booking details - Change booking")) {
                handleBookingDetailsPage();
            } else {
                handleInterstitial();
            }
        } else {
            return;
        }
    }

    // Initial run
    checkTitleAndHandle();

})();