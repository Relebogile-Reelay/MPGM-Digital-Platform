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


document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.querySelector('.btn-submit');
    const submitText = document.getElementById('submit-text');
    const submitIcon = document.getElementById('submit-icon');

    // Create the success message element once
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <p>Your message has been sent successfully! We'll get back to you soon.</p>
    `;
    // Ensure successMessage is appended only once
    if (!contactForm.querySelector('.success-message')) {
        contactForm.appendChild(successMessage);
    }
    // Initially hide the success message
    successMessage.style.display = 'none';

    // Form validation and Firebase submission
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Reset error messages
        document.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
            el.textContent = '';
        });

        // Validate form fields
        let isValid = true;

        // Name validation
        const nameInput = document.getElementById('name');
        if (!nameInput.value.trim()) {
            showError('name-error', 'Please enter your name');
            isValid = false;
        }

        // Email validation
        const emailInput = document.getElementById('email');
        if (!emailInput.value.trim()) {
            showError('email-error', 'Please enter your email');
            isValid = false;
        } else if (!isValidEmail(emailInput.value)) {
            showError('email-error', 'Please enter a valid email address');
            isValid = false;
        }

        // Phone validation (optional)
        const phoneInput = document.getElementById('phone');
        if (phoneInput.value.trim() && !isValidPhone(phoneInput.value)) {
            showError('phone-error', 'Please enter a valid phone number');
            isValid = false;
        }

        // Subject validation
        const subjectSelect = document.getElementById('subject');
        if (!subjectSelect.value) {
            showError('subject-error', 'Please select a subject');
            isValid = false;
        }

        // Message validation
        const messageTextarea = document.getElementById('message');
        if (!messageTextarea.value.trim()) {
            showError('message-error', 'Please enter your message');
            isValid = false;
        } else if (messageTextarea.value.trim().length < 10) {
            showError('message-error', 'Message should be at least 10 characters');
            isValid = false;
        }

        if (isValid) {
            // Prepare data for Firestore
            const formData = {
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                phone: phoneInput.value.trim(), // Will be empty string if not provided
                subject: subjectSelect.value,
                message: messageTextarea.value.trim(),
                timestamp: firebase.firestore.FieldValue.serverTimestamp() // Adds server-side timestamp
            };

            // Show sending state
            submitBtn.classList.add('sending');
            submitBtn.disabled = true;
            submitText.textContent = 'Sending...';
            submitIcon.className = 'fas fa-spinner fa-spin'; // Change icon to a spinner

            // Add data to Firestore
            db.collection("contactSubmissions").add(formData)
                .then((docRef) => {
                    console.log("Document written with ID: ", docRef.id);
                    submitBtn.classList.remove('sending');
                    submitBtn.disabled = false;
                    submitText.textContent = 'Send Message';
                    submitIcon.className = 'fas fa-paper-plane'; // Reset icon

                    // Show success message
                    successMessage.style.display = 'block';
                    contactForm.reset(); // Clear the form

                    // Hide success message after 5 seconds
                    setTimeout(() => {
                        successMessage.style.display = 'none';
                    }, 5000);
                })
                .catch((error) => {
                    console.error("Error adding document: ", error);
                    submitBtn.classList.remove('sending');
                    submitBtn.disabled = false;
                    submitText.textContent = 'Send Message';
                    submitIcon.className = 'fas fa-paper-plane'; // Reset icon

                    // Optionally, show a more user-friendly error message
                    alert("There was an error sending your message. Please try again later. Error: " + error.message);
                });
        }
    });

    // Helper functions
    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function isValidPhone(phone) {
        // Updated regex for more flexibility, still allows international formats
        const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,10}$/;
        return re.test(phone);
    }

    // Animate contact info cards
    const infoCards = document.querySelectorAll('.info-card');
    infoCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 * index);
    });

    // Animate form elements
    const formGroups = document.querySelectorAll('.contact-form .form-group');
    formGroups.forEach((group, index) => {
        group.style.opacity = '0';
        group.style.transform = 'translateY(20px)';
        group.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

        setTimeout(() => {
            group.style.opacity = '1';
            group.style.transform = 'translateY(0)';
        }, 200 * (index + infoCards.length));
    });
});