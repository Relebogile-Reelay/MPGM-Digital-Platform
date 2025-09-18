// ====================================================================
// START Firebase Configuration and Initialization
// Using your provided Firebase configuration
// ====================================================================
const firebaseConfig = {
    apiKey: "AIzaSyDQuf7Pguje9A3XoIG1H_InDx4nLZWtuYg",
    authDomain: "mpmg-df88b.firebaseapp.com",
    projectId: "mpmg-df88b",
    storageBucket: "mpmg-df88b.firebasestorage.app",
    messagingSenderId: "908511339384",
    appId: "1:908511339384:web:7ee14ab4addefd7d889e8d",
    measurementId: "G-KV57V7SEEJ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the Firestore database
const db = firebase.firestore();
// ====================================================================
// END Firebase Configuration and Initialization
// ====================================================================


// Donation Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    // UI Elements
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const paymentOptions = document.querySelectorAll('.payment-option');
    const paymentForms = {
        'card': document.getElementById('card-form'),
        'bank': document.getElementById('bank-form')
    };
    const donationButtons = document.querySelectorAll('.btn-donate:not(#btn-custom-donate):not(#btn-custom-monthly)');
    const customAmountInput = document.getElementById('custom-amount');
    const customMonthlyInput = document.getElementById('custom-monthly-amount');
    const customDonateBtn = document.getElementById('btn-custom-donate');
    const customMonthlyBtn = document.getElementById('btn-custom-monthly');
    const amountDisplay = document.getElementById('donation-amount-display');
    const finalAmountDisplay = document.getElementById('donation-amount-final');
    const donationForm = document.getElementById('donation-form');
    const submitBtn = donationForm.querySelector('.btn-submit-donation');
    const submitText = document.getElementById('submit-text');

    // Current Donation State
    let currentAmount = 0;
    let isRecurring = false;
    let selectedPaymentMethod = 'card'; // Default to card

    // Create success message element once
    const successMessageOverlay = document.createElement('div');
    successMessageOverlay.className = 'donation-success-overlay';
    successMessageOverlay.style.display = 'none'; // Hidden by default
    successMessageOverlay.innerHTML = `
        <div class="donation-success-popup">
            <i class="fas fa-check-circle"></i>
            <h3>Thank You for Your Donation!</h3>
            <p id="thank-you-message"></p>
            <p class="receipt-note"></p>
            <button class="btn-primary" id="close-success">Done</button>
        </div>
    `;
    document.body.appendChild(successMessageOverlay);

    // --- UI Logic ---

    // Tab Switching (One-Time / Monthly)
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            isRecurring = (tabId === 'monthly');
            updateAmountDisplay(); // Update type display when tab changes
        });
    });
    
    // Payment Method Switching (Credit/Debit Card / Bank Transfer)
    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            paymentOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            selectedPaymentMethod = option.getAttribute('data-method');
            Object.values(paymentForms).forEach(form => form.style.display = 'none');
            paymentForms[selectedPaymentMethod].style.display = 'block';
        });
    });
    
    // Donation Amount Selection (Preset buttons)
    donationButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            document.querySelectorAll('.donation-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            this.closest('.donation-card').classList.add('selected');
            
            currentAmount = parseFloat(this.getAttribute('data-amount'));
            isRecurring = this.getAttribute('data-recurring') === 'true'; // Ensure isRecurring is set correctly
            
            updateAmountDisplay();
            scrollToDonationForm();
        });
    });
    
    // Custom Amount Handling
    function handleCustomAmount(input, btn, isMonthly) {
        const parentCard = input.closest('.donation-card');

        input.addEventListener('input', function() {
            document.querySelectorAll('.donation-card').forEach(card => {
                card.classList.remove('selected');
            });
            parentCard.classList.add('selected');
            
            const value = parseFloat(this.value);
            if (!isNaN(value) && value > 0) {
                currentAmount = value;
                isRecurring = isMonthly;
                updateAmountDisplay();
            } else {
                currentAmount = 0; // Reset if input is invalid
                updateAmountDisplay();
            }
        });
        
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const value = parseFloat(input.value);
            
            if (isNaN(value) || value <= 0) {
                showError('custom-amount-error' + (isMonthly ? '-monthly' : ''), 'Please enter a valid amount greater than 0'); // Need specific error IDs for custom inputs
                return;
            }
            
            currentAmount = value;
            isRecurring = isMonthly;
            updateAmountDisplay();
            
            scrollToDonationForm();
        });
    }
    
    handleCustomAmount(customAmountInput, customDonateBtn, false);
    handleCustomAmount(customMonthlyInput, customMonthlyBtn, true);
    
    function updateAmountDisplay() {
        const formattedAmount = 'R' + currentAmount.toFixed(2);
        amountDisplay.textContent = formattedAmount;
        finalAmountDisplay.textContent = formattedAmount;
        
        const typeDisplay = document.getElementById('donation-type-display');
        typeDisplay.textContent = isRecurring ? 'Monthly' : 'One-Time';
    }

    // --- Form Validation & Submission ---

    donationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Reset error messages
        document.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
            el.textContent = '';
        });

        let isValid = true;

        if (currentAmount <= 0) {
            alert('Please select or enter a donation amount first.');
            isValid = false;
            scrollToDonationForm(); // Scroll to top of donation form
            return; // Exit early if no amount is selected
        }

        // Validate basic donor info
        const donorName = document.getElementById('donor-name');
        if (!donorName.value.trim()) {
            showError('donor-name-error', 'Please enter your full name.');
            isValid = false;
        }

        const donorEmail = document.getElementById('donor-email');
        if (!donorEmail.value.trim()) {
            showError('donor-email-error', 'Please enter your email address.');
            isValid = false;
        } else if (!isValidEmail(donorEmail.value)) {
            showError('donor-email-error', 'Please enter a valid email address.');
            isValid = false;
        }

        const donorPhone = document.getElementById('donor-phone');
        if (donorPhone.value.trim() && !isValidPhone(donorPhone.value)) {
            showError('donor-phone-error', 'Please enter a valid phone number.');
            isValid = false;
        }
        
        // Validate payment method fields if 'card' is selected
        if (selectedPaymentMethod === 'card') {
            const cardNumber = document.getElementById('card-number');
            const cardExpiry = document.getElementById('card-expiry');
            const cardCVC = document.getElementById('card-cvc');
            const cardName = document.getElementById('card-name');

            if (!cardNumber.value.trim() || !isValidCardNumber(cardNumber.value)) {
                showError('card-number-error', 'Please enter a valid 16-digit card number.');
                isValid = false;
            }
            if (!cardExpiry.value.trim() || !isValidExpiryDate(cardExpiry.value)) {
                showError('card-expiry-error', 'Please enter a valid MM/YY expiry date.');
                isValid = false;
            }
            if (!cardCVC.value.trim() || !isValidCVC(cardCVC.value)) {
                showError('card-cvc-error', 'Please enter a valid 3 or 4 digit CVC.');
                isValid = false;
            }
            if (!cardName.value.trim()) {
                showError('card-name-error', 'Please enter the name on the card.');
                isValid = false;
            }
        }

        // Validate agreement checkbox
        const agreementCheckbox = document.getElementById('donation-agreement');
        if (!agreementCheckbox.checked) {
            showError('agreement-error', 'You must agree to the Terms & Conditions.');
            isValid = false;
        }

        if (!isValid) {
            // Scroll to the first error if validation fails
            const firstError = document.querySelector('.error-message[style*="block"]');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return; // Stop submission if validation fails
        }

        // If validation passes, proceed with Firestore submission
        submitBtn.disabled = true;
        submitText.textContent = 'Processing...';

        const donationData = {
            amount: currentAmount,
            isRecurring: isRecurring,
            donorName: donorName.value.trim(),
            donorEmail: donorEmail.value.trim(),
            donorPhone: donorPhone.value.trim(),
            visibility: document.querySelector('input[name="visibility"]:checked').value,
            message: document.getElementById('donation-message').value.trim(),
            paymentMethod: selectedPaymentMethod,
            // For card payments, DO NOT SAVE SENSITIVE CARD INFO TO FIRESTORE DIRECTLY IN CLIENT-SIDE
            // This is just placeholder data. Real payment integration uses a secure tokenization service.
            // For now, we'll just note that 'card' was chosen.
            // cardDetails: selectedPaymentMethod === 'card' ? {
            //     last4: cardNumber.value.trim().slice(-4),
            //     expiry: cardExpiry.value.trim()
            // } : {},
            timestamp: firebase.firestore.FieldValue.serverTimestamp() // Server timestamp for accuracy
        };

        db.collection("donations").add(donationData)
            .then((docRef) => {
                console.log("Donation document written with ID: ", docRef.id);
                submitBtn.disabled = false;
                submitText.textContent = 'Complete Donation';
                
                // Update success message content based on donation type and payment method
                const thankYouMessageElement = successMessageOverlay.querySelector('#thank-you-message');
                const receiptNoteElement = successMessageOverlay.querySelector('.receipt-note');
                
                thankYouMessageElement.textContent = `Your ${isRecurring ? 'monthly' : 'one-time'} donation of R${currentAmount.toFixed(2)} has been recorded.`;
                
                if (selectedPaymentMethod === 'card') {
                    receiptNoteElement.textContent = `A payment confirmation and receipt have been sent to ${donorEmail.value}.`;
                } else { // bank transfer
                    receiptNoteElement.textContent = `For bank transfers, please proceed with the payment using the bank details provided on the form. Your donation will be fully recorded upon confirmation of funds. A receipt will be sent to ${donorEmail.value} once processed.`;
                }

                successMessageOverlay.style.display = 'flex'; // Show the success overlay
                donationForm.reset(); // Clear the form
                currentAmount = 0; // Reset current amount
                updateAmountDisplay(); // Update display to R0.00
                document.querySelectorAll('.donation-card').forEach(card => card.classList.remove('selected')); // Remove highlight
                document.getElementById('one-time').classList.add('active'); // Reset to one-time tab
                document.getElementById('monthly').classList.remove('active');
                isRecurring = false;
            })
            .catch((error) => {
                console.error("Error adding donation document: ", error);
                submitBtn.disabled = false;
                submitText.textContent = 'Complete Donation';
                alert("There was an error processing your donation. Please try again. Error: " + error.message);
            });
    });

    // Close success message
    successMessageOverlay.querySelector('#close-success').addEventListener('click', () => {
        successMessageOverlay.style.display = 'none';
    });

    // --- Helper Functions for Validation and UI ---

    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function isValidPhone(phone) {
        const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,10}$/;
        return re.test(phone);
    }

    function isValidCardNumber(cardNumber) {
        const re = /^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/; // Basic 16-digit format with spaces/hyphens
        return re.test(cardNumber.replace(/\s/g, '')); // Remove spaces for strict check
    }

    function isValidExpiryDate(expiry) {
        const re = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
        if (!re.test(expiry)) return false;
        
        const parts = expiry.split('/');
        const month = parseInt(parts[0], 10);
        const year = parseInt('20' + parts[1], 10); // Assume 21st century

        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1; // getMonth() is 0-indexed

        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            return false; // Card has expired
        }
        return true;
    }

    function isValidCVC(cvc) {
        const re = /^\d{3,4}$/; // 3 or 4 digits
        return re.test(cvc);
    }

    function scrollToDonationForm() {
        document.querySelector('.donation-form-section').scrollIntoView({
            behavior: 'smooth'
        });
    }

    // --- Input Formatting (for credit card fields) ---
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function() {
            let value = this.value.replace(/\s+/g, ''); // Remove existing spaces
            value = value.replace(/(\d{4})/g, '$1 ').trim(); // Add space after every 4 digits
            this.value = value.substring(0, 19); // Max length for 16 digits + 3 spaces
        });
    }
    
    const expiryInput = document.getElementById('card-expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, ''); // Remove non-digits
            if (value.length > 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            this.value = value.substring(0, 5); // Max length MM/YY is 5 chars
        });
    }

    // Initial display update
    updateAmountDisplay(); // Ensures R0.00 is displayed on load

    // Animate impact cards
    const impactCards = document.querySelectorAll('.impact-card');
    impactCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 150 * index);
    });
});