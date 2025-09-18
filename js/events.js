// events.js - Updated RSVP functionality with styling and Firebase compatibility SDK integration

// IMPORTANT: Ensure firebase-app-compat.js and firebase-firestore-compat.js
// are loaded in your HTML *before* this script.
// 'firebase' and 'db' are expected to be globally available.

// Basic check to ensure Firebase is loaded before attempting to use it
if (typeof firebase === 'undefined' || typeof db === 'undefined') {
    console.error("Firebase SDK or Firestore DB 'db' not initialized. Please ensure Firebase compat scripts are loaded and configured in your HTML before events.js.");
    // Optionally, you might want to display a user-friendly error message or disable RSVP functionality
    // if Firebase fails to load. For this example, we'll just log an error.
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Events page loaded'); // Debugging

    // Filter Events (keeping your existing functionality)
    const filterBtns = document.querySelectorAll('.filter-btn');
    const timelineEvents = document.querySelectorAll('.timeline-event');

    if (filterBtns.length && timelineEvents.length) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');

                timelineEvents.forEach(event => {
                    if (filter === 'all' || event.classList.contains(filter)) {
                        event.style.display = 'flex';
                    } else {
                        event.style.display = 'none';
                    }
                });
            });
        });
    }

    // Updated RSVP Functionality with Styling and Firebase
    function setupRSVPButtons() {
        const rsvpBtns = document.querySelectorAll('.btn-rsvp');

        rsvpBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('RSVP button clicked'); // Debugging

                const eventCard = this.closest('.timeline-event');
                if (!eventCard) {
                    console.error('Event card not found');
                    return;
                }

                // Extract event details for display in the modal and storage
                const eventId = eventCard.id || 'unknown_event'; // Get event ID for Firebase
                const eventTitle = eventCard.querySelector('h3')?.textContent || 'Event';
                const eventDateNum = eventCard.querySelector('.event-date span')?.textContent || '';
                const eventMonth = eventCard.querySelector('.event-date small')?.textContent || '';
                const eventYear = new Date().getFullYear(); // Use current year for simplicity based on prompt's date
                const eventFullDate = `${eventDateNum} ${eventMonth} ${eventYear}`; // Combine for display/storage

                const eventTime = eventCard.querySelector('.event-meta span:first-child')?.textContent.replace(/<i class="far fa-clock"><\/i>/, '').trim() || '';
                const eventLocation = eventCard.querySelector('.event-meta span:last-child')?.textContent.replace(/<i class="fas fa-map-marker-alt"><\/i>/, '').trim() || '';
                const eventDescription = eventCard.querySelector('p')?.textContent.trim() || '';
                const eventType = eventCard.querySelector('.event-badge')?.textContent.trim() || 'General';

                // Create modal with inline styles matching your requirements
                const modalHTML = `
                <div class="rsvp-modal" style="position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,0.7);display:flex;justify-content:center;align-items:center;z-index:2000;opacity:0;visibility:hidden;transition:all 0.3s ease;">
                    <div class="modal-content" style="background-color:#fff;border-radius:10px;width:90%;max-width:600px;padding:2.5rem;position:relative;box-shadow:0 5px 15px rgba(0,0,0,0.1);transform:translateY(-30px);transition:all 0.3s ease;">
                        <button class="close-modal" style="position:absolute;top:15px;right:15px;font-size:1.8rem;background:none;border:none;cursor:pointer;color:#777;transition:all 0.3s ease;">&times;</button>

                        <div class="modal-header" style="text-align:center;margin-bottom:2rem;">
                            <h2 style="color:#4a6fdc;font-family:Georgia,serif;font-size:1.8rem;font-weight:700;margin-bottom:0.8rem;text-transform:uppercase;letter-spacing:1px;">RSVP for ${eventTitle}</h2>
                            <p style="color:#777;font-size:1.1rem;margin:0;line-height:1.6;">We're excited you're joining us! Please fill out the form below.</p>
                            <p style="font-size:0.9rem; color:#555; margin-top:10px;"><strong>Date:</strong> ${eventFullDate} | <strong>Time:</strong> ${eventTime} | <strong>Location:</strong> ${eventLocation}</p>
                        </div>

                        <form class="rsvp-form">
                            <div class="form-group" style="margin-bottom:1.8rem;position:relative;">
                                <label for="rsvp-name" style="display:block;margin-bottom:0.6rem;font-weight:600;color:#2c3e50;font-family:Georgia,serif;font-size:1rem;text-transform:uppercase;letter-spacing:0.5px;">Full Name*</label>
                                <input type="text" id="rsvp-name" required style="width:100%;padding:0.9rem 1.2rem;border:1px solid #e0e0e0;border-radius:6px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:1rem;transition:all 0.3s ease;background-color:rgba(255,255,255,0.9);">
                            </div>

                            <div class="form-group" style="margin-bottom:1.8rem;position:relative;">
                                <label for="rsvp-email" style="display:block;margin-bottom:0.6rem;font-weight:600;color:#2c3e50;font-family:Georgia,serif;font-size:1rem;text-transform:uppercase;letter-spacing:0.5px;">Email Address*</label>
                                <input type="email" id="rsvp-email" required style="width:100%;padding:0.9rem 1.2rem;border:1px solid #e0e0e0;border-radius:6px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:1rem;transition:all 0.3s ease;background-color:rgba(255,255,255,0.9);">
                            </div>

                            <div class="form-group" style="margin-bottom:1.8rem;position:relative;">
                                <label for="rsvp-phone" style="display:block;margin-bottom:0.6rem;font-weight:600;color:#2c3e50;font-family:Georgia,serif;font-size:1rem;text-transform:uppercase;letter-spacing:0.5px;">Phone Number</label>
                                <input type="tel" id="rsvp-phone" style="width:100%;padding:0.9rem 1.2rem;border:1px solid #e0e0e0;border-radius:6px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:1rem;transition:all 0.3s ease;background-color:rgba(255,255,255,0.9);">
                            </div>

                            <div class="form-group" style="margin-bottom:1.8rem;position:relative;">
                                <label for="rsvp-guests" style="display:block;margin-bottom:0.6rem;font-weight:600;color:#2c3e50;font-family:Georgia,serif;font-size:1rem;text-transform:uppercase;letter-spacing:0.5px;">Number of Guests</label>
                                <input type="number" id="rsvp-guests" min="0" value="0" style="width:100%;padding:0.9rem 1.2rem;border:1px solid #e0e0e0;border-radius:6px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:1rem;transition:all 0.3s ease;background-color:rgba(255,255,255,0.9);">
                            </div>

                            <div class="form-group" style="margin-bottom:1.8rem;position:relative;">
                                <label for="rsvp-notes" style="display:block;margin-bottom:0.6rem;font-weight:600;color:#2c3e50;font-family:Georgia,serif;font-size:1rem;text-transform:uppercase;letter-spacing:0.5px;">Special Requirements</label>
                                <textarea id="rsvp-notes" rows="3" placeholder="Dietary needs, accessibility requirements, etc." style="width:100%;padding:0.9rem 1.2rem;border:1px solid #e0e0e0;border-radius:6px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:1rem;transition:all 0.3s ease;background-color:rgba(255,255,255,0.9);min-height:120px;resize:vertical;"></textarea>
                            </div>

                            <button type="submit" class="btn-submit" style="background-color:#4a6fdc;color:white;border:none;padding:1rem 2rem;border-radius:50px;font-weight:600;font-size:1rem;cursor:pointer;transition:all 0.3s ease;width:100%;margin-top:1rem;text-transform:uppercase;letter-spacing:0.5px;">Submit RSVP</button>
                        </form>
                    </div>
                </div>`;

                // Add modal to page
                document.body.insertAdjacentHTML('beforeend', modalHTML);
                const modal = document.querySelector('.rsvp-modal:last-child');

                // Show modal with animation
                setTimeout(() => {
                    modal.style.opacity = '1';
                    modal.style.visibility = 'visible';
                    modal.querySelector('.modal-content').style.transform = 'translateY(0)';
                }, 10);

                // Close modal
                modal.querySelector('.close-modal').addEventListener('click', function() {
                    this.style.color = '#333';
                    this.style.transform = 'rotate(90deg)';
                    modal.style.opacity = '0';
                    modal.style.visibility = 'hidden';
                    setTimeout(() => {
                        modal.remove();
                    }, 300);
                });

                // Form submission with Firebase
                modal.querySelector('.rsvp-form').addEventListener('submit', async function(e) {
                    e.preventDefault();

                    // Check if db is accessible (should be from the global scope after initialization)
                    if (typeof db === 'undefined' || db === null) {
                        showNotification('error', 'Database not connected. Please ensure Firebase is initialized correctly in your HTML.');
                        const submitBtn = this.querySelector('button[type="submit"]');
                        submitBtn.disabled = false; // Re-enable button
                        submitBtn.style.backgroundColor = '#4a6fdc';
                        submitBtn.textContent = 'Submit RSVP';
                        return;
                    }

                    const submitBtn = this.querySelector('button[type="submit"]');
                    submitBtn.disabled = true;
                    submitBtn.style.backgroundColor = '#3a5bc7';
                    submitBtn.textContent = 'Submitting...';

                    const name = this.querySelector('#rsvp-name').value.trim();
                    const email = this.querySelector('#rsvp-email').value.trim();
                    const phone = this.querySelector('#rsvp-phone').value.trim();
                    const guests = parseInt(this.querySelector('#rsvp-guests').value, 10);
                    const notes = this.querySelector('#rsvp-notes').value.trim();

                    // Data to be stored in Firestore
                    const rsvpData = {
                        eventId: eventId,
                        eventTitle: eventTitle,
                        eventFullDate: eventFullDate,
                        eventTime: eventTime,
                        eventLocation: eventLocation,
                        eventType: eventType,
                        attendeeName: name,
                        attendeeEmail: email,
                        attendeePhone: phone,
                        numberOfGuests: guests,
                        specialNotes: notes,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp() // Using compat way
                    };

                    try {
                        // Add a new document with a generated ID to the 'rsvps' collection
                        const docRef = await db.collection('rsvps').add(rsvpData);
                        console.log("Document written with ID: ", docRef.id);

                        // Close modal
                        modal.style.opacity = '0';
                        modal.style.visibility = 'hidden';
                        setTimeout(() => {
                            modal.remove();
                        }, 300);

                        // Show success message
                        showNotification('success', `Thank you, ${name}! Your RSVP for "${eventTitle}" was received.`);

                    } catch (error) {
                        console.error("Error adding document: ", error);
                        submitBtn.disabled = false;
                        submitBtn.style.backgroundColor = '#4a6fdc';
                        submitBtn.textContent = 'Submit RSVP';
                        showNotification('error', `Error submitting RSVP: ${error.message}. Please try again.`);
                    }
                });
            });
        });
    }

    // Helper function to show notifications (reusable for success/error)
    function showNotification(type, message) {
        const existingNotification = document.querySelector('.app-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.classList.add('app-notification');
        notification.style.position = 'fixed';
        notification.style.bottom = '30px';
        notification.style.right = '30px';
        notification.style.color = 'white';
        notification.style.padding = '1rem 1.5rem';
        notification.style.borderRadius = '5px';
        notification.style.display = 'flex';
        notification.style.alignItems = 'center';
        notification.style.gap = '0.8rem';
        notification.style.zIndex = '2100';
        notification.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
        notification.style.animation = 'slideInUp 0.4s ease'; // Assuming 'slideInUp' CSS animation exists
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        notification.style.transition = 'all 0.4s ease-out';

        if (type === 'success') {
            notification.style.backgroundColor = '#28a745'; // Green for success
            notification.innerHTML = `<i class="fas fa-check-circle" style="font-size:1.5rem;"></i><span>${message}</span>`;
        } else if (type === 'error') {
            notification.style.backgroundColor = '#dc3545'; // Red for error
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


    // Initialize RSVP buttons
    setupRSVPButtons();

    // Animation for timeline events using Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fadeInUp'); // Assuming 'animate-fadeInUp' CSS class exists
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, { threshold: 0.1 }); // Trigger when 10% of the element is visible

    document.querySelectorAll('.timeline-event').forEach(event => {
        observer.observe(event);
    });
});