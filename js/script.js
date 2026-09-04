document.addEventListener("DOMContentLoaded", function () {
    
    // ==================================================
    // 1. COUNTDOWN TIMER
    // ==================================================
    const targetDate = new Date("2026-08-14T23:59:59").getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;

        const daysEl = document.getElementById("days");
        const hoursEl = document.getElementById("hours");
        const minutesEl = document.getElementById("minutes");
        const secondsEl = document.getElementById("seconds");

        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            if (daysEl) daysEl.innerText = days < 10 ? '0' + days : days;
            if (hoursEl) hoursEl.innerText = hours < 10 ? '0' + hours : hours;
            if (minutesEl) minutesEl.innerText = minutes < 10 ? '0' + minutes : minutes;
            if (secondsEl) secondsEl.innerText = seconds < 10 ? '0' + seconds : seconds;
        } else {
            if (daysEl) daysEl.innerText = '00';
            if (hoursEl) hoursEl.innerText = '00';
            if (minutesEl) minutesEl.innerText = '00';
            if (secondsEl) secondsEl.innerText = '00';
        }
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();

    // ==================================================
    // 2. FORM SUBMISSION TO GOOGLE SHEET
    // ==================================================
    const form = document.getElementById("registrationForm") || document.getElementById("enrollmentForm");

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.innerText : "Confirm & Pay";

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = "Saving Data...";
            }

            // ইনপুট ফিল্ড থেকে তথ্য সংগ্রহ
            const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
            
            const formData = {
                name: document.getElementById("userName") ? document.getElementById("userName").value : "",
                phone: document.getElementById("userPhone") ? document.getElementById("userPhone").value : "",
                email: document.getElementById("userEmail") ? document.getElementById("userEmail").value || "N/A" : "N/A",
                address: document.getElementById("userAddress") ? document.getElementById("userAddress").value : "",
                paymentMethod: selectedPayment ? selectedPayment.value : "bKash"
            };

            // ⚠️ [আপনার Google Apps Script থেকে প্রাপ্ত URL টি নিচে বসান]
            const googleScriptURL = 'https://script.google.com/macros/s/AKfycbzqJrpALnXw6vHidWNFcZc1bfF-5I5oJa26LIpkJ83OWMWc-MsrVM1_m4eRPpPDfNdHaA/exec';

            fetch(googleScriptURL, {
                method: "POST",
                mode: "no-cors", // CORS এরর এড়াতে
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            })
            .then(() => {
                alert("আপনার তথ্য সফলভাবে সংরক্ষিত হয়েছে!");

                // মডাল হাইড করা
                const modalElement = document.getElementById('checkoutModal');
                if (modalElement && typeof bootstrap !== 'undefined') {
                    const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
                    if (modal) modal.hide();
                }

                form.reset();
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalBtnText;
                }
            })
            .catch(error => {
                console.error("Error!", error.message);
                alert("কোনো একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।");
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalBtnText;
                }
            });
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    
    // =========================================================
    // 📍 1. এখানে আপনার Google Apps Script থেকে পাওয়া Web App URL বসান
    
    // =========================================================
    const googleSheetScriptURL = "https://script.google.com/macros/s/AKfycbyRy0U4CF6fhFT8UTzNKKemIIjU0643yhyy-nRdG_2t7t8Z-WaFVTdptaxoDUmTmEV8cg/exec";

    const verifyBtn = document.getElementById("verifyBtn");
    const certInput = document.getElementById("certInput");
    const certResult = document.getElementById("certResult");

    function checkCertificateFromSheet(certID) {
        if (!certID) {
            alert("Please enter a Certificate ID!");
            return;
        }

        certID = certID.trim().toUpperCase();
        certResult.classList.remove("d-none");
        certResult.innerHTML = `<div class="text-info fw-bold text-center py-2">🔍 Checking database, please wait...</div>`;

        fetch(`${googleSheetScriptURL}?cert_id=${encodeURIComponent(certID)}`)
            .then(response => response.json())
            .then(data => {
                if (data.found) {
                    certResult.innerHTML = `
                        <div class="alert alert-success border-0 bg-success-subtle text-success-emphasis p-3 rounded-3 mb-0">
                            <h6 class="fw-bold mb-2">Valid Certificate ✅</h6>
                            <p class="mb-1"><strong>Student Name:</strong> ${data.name}</p>
                            <p class="mb-1"><strong>Course:</strong> ${data.course}</p>
                            <small><strong>Issue Date:</strong> ${data.issueDate}</small>
                        </div>
                    `;
                } else {
                    certResult.innerHTML = `
                        <div class="alert alert-danger border-0 bg-danger-subtle text-danger-emphasis p-3 rounded-3 mb-0">
                            ❌ Invalid Certificate ID. Please check and try again.
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error("Error:", error);
                certResult.innerHTML = `<div class="text-danger fw-bold text-center">Something went wrong. Please check your connection.</div>`;
            });
    }

    // বাটনে ক্লিক করলে সার্চ হবে
    if (verifyBtn) {
        verifyBtn.addEventListener("click", function () {
            checkCertificateFromSheet(certInput.value);
        });
    }

    // Enter বাটন প্রেস করলেও সার্চ কাজ করবে
    if (certInput) {
        certInput.addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
                checkCertificateFromSheet(certInput.value);
            }
        });
    }

    // 📱 QR Code অটো-ভেরিফাই রিড করা (URL Parameters)
    const urlParams = new URLSearchParams(window.location.search);
    const certFromURL = urlParams.get('cert_id');
    if (certFromURL) {
        certInput.value = certFromURL;
        checkCertificateFromSheet(certFromURL);
    }
});