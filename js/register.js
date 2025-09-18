// js/register.js - Handles registration form submission to Firebase Firestore

// IMPORTANT: Ensure firebase-app-compat.js and firebase-firestore-compat.js
// are loaded in your HTML *before* this script.
// 'firebase' and 'db' are expected to be globally available from the HTML script.

document.addEventListener('DOMContentLoaded', function() {
    // Check if Firebase SDK and Firestore DB are initialized
    if (typeof firebase === 'undefined' || typeof db === 'undefined') {
        console.error("Firebase SDK or Firestore DB 'db' not initialized. Please ensure Firebase compat scripts are loaded and configured in your HTML before register.js.");
        // You might want to disable the registration form or show a warning here.
        const registerButton = document.querySelector('#registrationForm .btn-submit');
        if (registerButton) {
            registerButton.disabled = true;
            registerButton.textContent = 'Registration Unavailable';
        }
        return; // Exit if Firebase isn't ready
    }

    const registrationForm = document.getElementById('registrationForm');

    if (registrationForm) {
        registrationForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Prevent default form submission

            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.disabled = true; // Disable button to prevent multiple submissions
            submitBtn.style.backgroundColor = '#3a5bc7'; // Change color to indicate processing
            submitBtn.textContent = 'Registering...';

            // Get form data
            const name = this.querySelector('#reg-name').value.trim();
            const email = this.querySelector('#reg-email').value.trim();
            const phone = this.querySelector('#reg-phone').value.trim();
            const address = this.querySelector('#reg-address').value.trim();
            const interests = this.querySelector('#reg-interests').value.trim();

            // Data to be stored in Firestore
            const registrationData = {
                fullName: name,
                email: email,
                phoneNumber: phone,
                physicalAddress: address,
                interests: interests,
                registrationDate: firebase.firestore.FieldValue.serverTimestamp() // Timestamp of registration
            };

            try {
                // Add a new document with a generated ID to the 'registrations' collection
                const docRef = await db.collection('registrations').add(registrationData);
                console.log("Registration document written with ID: ", docRef.id);

                // Show success message
                showNotification('success', `Welcome, ${name}! Your registration was successful.`);

                // Clear the form after successful submission
                registrationForm.reset();

            } catch (error) {
                console.error("Error adding registration document: ", error);
                showNotification('error', `Error during registration: ${error.message}. Please try again.`);
            } finally {
                // Re-enable and reset button regardless of success or error
                submitBtn.disabled = false;
                submitBtn.style.backgroundColor = '#4a6fdc';
                submitBtn.textContent = 'Register Now';
            }
        });
    }

    // Helper function to show notifications (can be shared or duplicated if needed)
    function showNotification(type, message) {
        const existingNotification = document.querySelector('.app-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.classList.add('app-notification');
        
        if (type === 'success') {
            notification.style.backgroundColor = '#28a745'; // Green
            notification.innerHTML = `<i class="fas fa-check-circle" style="font-size:1.5rem;"></i><span>${message}</span>`;
        } else if (type === 'error') {
            notification.style.backgroundColor = '#dc3545'; // Red
            notification.innerHTML = `<i class="fas fa-times-circle" style="font-size:1.5rem;"></i><span>${message}</span>`;
        }

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);

        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';
            setTimeout(() => {
                notification.remove();
            }, 400); // Wait for fade-out animation
        }, 5000);
    }
});