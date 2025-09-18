// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDQuf7Pguje9A3XoIG1H_InDx4nLZWtuYg",
    authDomain: "mpmg-df88b.firebaseapp.com",
    projectId: "mpmg-df88b",
    storageBucket: "mpmg-df88b.appspot.com",
    messagingSenderId: "908511339384",
    appId: "1:908511339384:web:7ee14ab4addefd7d889e8d",
    measurementId: "G-KV57V7SEEJ"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Check authentication state
auth.onAuthStateChanged((user) => {
    if (!user) {
        // Not logged in, redirect to login page
        window.location.href = 'index.html';
    } else {
        // User is logged in, initialize the dashboard
        initDashboard();
    }
});

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    });
});

// Initialize the dashboard
function initDashboard() {
    // Set up navigation
    setupNavigation();
    
    // Load data for the dashboard
    loadDashboardData();
    
    // Load registrations
    loadRegistrations();
    
    // Load RSVPs
    loadRSVPs();
    
    // Load messages
    loadMessages();
    
    // Load donations
    loadDonations();
    
    // Load events
    loadEvents();
    
    // Set up event modal
    setupEventModal();
}

// Set up navigation between sections
function setupNavigation() {
    const navItems = document.querySelectorAll('.sidebar-nav li');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items
            navItems.forEach(navItem => navItem.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');
            
            // Hide all sections
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Show the selected section
            const sectionId = item.getAttribute('data-section') + '-section';
            document.getElementById(sectionId).classList.add('active');
            
            // Update the content title
            document.getElementById('content-title').textContent = item.querySelector('span').textContent;
        });
    });
}

// Load dashboard overview data
function loadDashboardData() {
    // Count registrations
    db.collection('registrations').get().then(snapshot => {
        document.getElementById('registrations-count').textContent = snapshot.size;
    });
    
    // Count RSVPs
    db.collection('rsvps').get().then(snapshot => {
        document.getElementById('rsvps-count').textContent = snapshot.size;
    });
    
    // Count messages
    db.collection('contactSubmissions').get().then(snapshot => {
        document.getElementById('messages-count').textContent = snapshot.size;
    });
    
    // Count and sum donations
    db.collection('donations').get().then(snapshot => {
        document.getElementById('donations-count').textContent = snapshot.size;
        
        let total = 0;
        let oneTimeTotal = 0;
        let monthlyTotal = 0;
        
        snapshot.forEach(doc => {
            const data = doc.data();
            total += data.amount;
            
            if (data.isRecurring) {
                monthlyTotal += data.amount;
            } else {
                oneTimeTotal += data.amount;
            }
        });
        
        document.getElementById('total-donations').textContent = 'R' + total.toFixed(2);
        document.getElementById('one-time-donations').textContent = 'R' + oneTimeTotal.toFixed(2);
        document.getElementById('monthly-donations').textContent = 'R' + monthlyTotal.toFixed(2);
    });
    
    // Load recent activity
    const activityList = document.getElementById('recent-activity');
    
    // Combine queries to get recent activity from multiple collections
    Promise.all([
        db.collection('registrations').orderBy('timestamp', 'desc').limit(3).get(),
        db.collection('rsvps').orderBy('timestamp', 'desc').limit(3).get(),
        db.collection('contactSubmissions').orderBy('timestamp', 'desc').limit(3).get(),
        db.collection('donations').orderBy('timestamp', 'desc').limit(3).get()
    ]).then(([registrations, rsvps, messages, donations]) => {
        activityList.innerHTML = '';
        
        // Process registrations
        registrations.forEach(doc => {
            const data = doc.data();
            const date = data.timestamp.toDate();
            
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="fas fa-user-plus"></i>
                </div>
                <div class="activity-details">
                    <h4>New registration: ${data.fullName}</h4>
                    <p>${formatDate(date)}</p>
                </div>
            `;
            
            activityList.appendChild(activityItem);
        });
        
        // Process RSVPs
        rsvps.forEach(doc => {
            const data = doc.data();
            const date = data.timestamp.toDate();
            
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="activity-details">
                    <h4>RSVP for ${data.eventTitle} by ${data.attendeeName}</h4>
                    <p>${formatDate(date)}</p>
                </div>
            `;
            
            activityList.appendChild(activityItem);
        });
        
        // Process messages
        messages.forEach(doc => {
            const data = doc.data();
            const date = data.timestamp.toDate();
            
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="fas fa-envelope"></i>
                </div>
                <div class="activity-details">
                    <h4>New message from ${data.name} about ${data.subject}</h4>
                    <p>${formatDate(date)}</p>
                </div>
            `;
            
            activityList.appendChild(activityItem);
        });
        
        // Process donations
        donations.forEach(doc => {
            const data = doc.data();
            const date = data.timestamp.toDate();
            
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="fas fa-donate"></i>
                </div>
                <div class="activity-details">
                    <h4>Donation of R${data.amount.toFixed(2)} by ${data.donorName}</h4>
                    <p>${formatDate(date)}</p>
                </div>
            `;
            
            activityList.appendChild(activityItem);
        });
    });
}

// Load registrations data
function loadRegistrations() {
    const registrationsTable = document.querySelector('#registrations-table tbody');
    
    db.collection('registrations').orderBy('timestamp', 'desc').get().then(snapshot => {
        registrationsTable.innerHTML = '';
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const date = data.timestamp.toDate();
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.fullName}</td>
                <td>${data.email}</td>
                <td>${data.phoneNumber || 'N/A'}</td>
                <td>${data.interests || 'N/A'}</td>
                <td>${formatDate(date)}</td>
            `;
            
            registrationsTable.appendChild(row);
        });
    });
}

// Load RSVPs data
function loadRSVPs() {
    const rsvpsTable = document.querySelector('#rsvps-table tbody');
    
    db.collection('rsvps').orderBy('timestamp', 'desc').get().then(snapshot => {
        rsvpsTable.innerHTML = '';
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const date = data.timestamp.toDate();
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.eventTitle}</td>
                <td>${data.attendeeName}</td>
                <td>${data.attendeeEmail}</td>
                <td>${data.numberOfGuests}</td>
                <td>${formatDate(date)}</td>
            `;
            
            rsvpsTable.appendChild(row);
        });
    });
}

// Load messages data
function loadMessages() {
    const messagesTable = document.querySelector('#messages-table tbody');
    
    db.collection('contactSubmissions').orderBy('timestamp', 'desc').get().then(snapshot => {
        messagesTable.innerHTML = '';
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const date = data.timestamp.toDate();
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.name}</td>
                <td>${data.email}</td>
                <td>${data.subject}</td>
                <td>${truncateText(data.message, 50)}</td>
                <td>${formatDate(date)}</td>
                <td>
                    <button class="btn-view-message" data-id="${doc.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            `;
            
            messagesTable.appendChild(row);
        });
        
        // Set up message view buttons
        document.querySelectorAll('.btn-view-message').forEach(button => {
            button.addEventListener('click', () => {
                const messageId = button.getAttribute('data-id');
                viewMessage(messageId);
            });
        });
    });
}

// View full message
function viewMessage(messageId) {
    db.collection('contactSubmissions').doc(messageId).get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            const date = data.timestamp.toDate();
            
            alert(`Message from ${data.name} (${data.email})\n\nSubject: ${data.subject}\n\nMessage: ${data.message}\n\nReceived: ${formatDate(date)}`);
        }
    });
}

// Load donations data
function loadDonations() {
    const donationsTable = document.querySelector('#donations-table tbody');
    
    db.collection('donations').orderBy('timestamp', 'desc').get().then(snapshot => {
        donationsTable.innerHTML = '';
        
        let total = 0;
        let oneTimeTotal = 0;
        let monthlyTotal = 0;
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const date = data.timestamp.toDate();
            
            total += data.amount;
            
            if (data.isRecurring) {
                monthlyTotal += data.amount;
            } else {
                oneTimeTotal += data.amount;
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.donorName}</td>
                <td>R${data.amount.toFixed(2)}</td>
                <td>${data.isRecurring ? 'Monthly' : 'One-Time'}</td>
                <td>${data.paymentMethod}</td>
                <td>${formatDate(date)}</td>
                <td>${data.visibility === 'public' ? 'Public' : 'Anonymous'}</td>
            `;
            
            donationsTable.appendChild(row);
        });
        
        // Update summary
        document.getElementById('total-donations').textContent = 'R' + total.toFixed(2);
        document.getElementById('one-time-donations').textContent = 'R' + oneTimeTotal.toFixed(2);
        document.getElementById('monthly-donations').textContent = 'R' + monthlyTotal.toFixed(2);
    });
}

// Load events data
function loadEvents() {
    const eventsList = document.getElementById('events-list');
    
    db.collection('events').orderBy('date').get().then(snapshot => {
        eventsList.innerHTML = '';
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const eventDate = data.date.toDate();
            const eventTime = data.time || '00:00';
            
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            eventCard.innerHTML = `
                <div class="event-header">
                    <div class="event-date">
                        <span class="day">${eventDate.getDate()}</span>
                        <span class="month">${eventDate.toLocaleString('default', { month: 'short' })}</span>
                    </div>
                    <div class="event-badge">${capitalizeFirstLetter(data.category)}</div>
                </div>
                <h3 class="event-title">${data.title}</h3>
                <div class="event-meta">
                    <span><i class="far fa-clock"></i> ${formatTime(eventTime)}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${data.location}</span>
                </div>
                <p class="event-description">${data.description}</p>
                <div class="event-actions">
                    <button class="btn-secondary btn-edit-event" data-id="${doc.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-danger btn-delete-event" data-id="${doc.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            
            eventsList.appendChild(eventCard);
        });
        
        // Set up edit buttons
        document.querySelectorAll('.btn-edit-event').forEach(button => {
            button.addEventListener('click', () => {
                const eventId = button.getAttribute('data-id');
                editEvent(eventId);
            });
        });
        
        // Set up delete buttons
        document.querySelectorAll('.btn-delete-event').forEach(button => {
            button.addEventListener('click', () => {
                const eventId = button.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this event?')) {
                    deleteEvent(eventId);
                }
            });
        });
    });
}

// Set up event modal
function setupEventModal() {
    const modal = document.getElementById('event-modal');
    const addEventBtn = document.getElementById('add-event-btn');
    const cancelEventBtn = document.getElementById('cancel-event');
    const eventForm = document.getElementById('event-form');
    
    // Open modal for adding new event
    addEventBtn.addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Add New Event';
        document.getElementById('event-id').value = '';
        eventForm.reset();
        modal.classList.add('active');
    });
    
    // Close modal
    cancelEventBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    document.querySelector('.close-modal').addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    // Handle form submission
    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const eventId = document.getElementById('event-id').value;
        const title = document.getElementById('event-title').value;
        const date = document.getElementById('event-date').value;
        const time = document.getElementById('event-time').value;
        const location = document.getElementById('event-location').value;
        const category = document.getElementById('event-category').value;
        const description = document.getElementById('event-description').value;
        
        const eventData = {
            title,
            date: firebase.firestore.Timestamp.fromDate(new Date(date)),
            time,
            location,
            category,
            description,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (eventId) {
            // Update existing event
            db.collection('events').doc(eventId).update(eventData)
                .then(() => {
                    alert('Event updated successfully!');
                    modal.classList.remove('active');
                    loadEvents();
                })
                .catch(error => {
                    alert('Error updating event: ' + error.message);
                });
        } else {
            // Add new event
            db.collection('events').add(eventData)
                .then(() => {
                    alert('Event added successfully!');
                    modal.classList.remove('active');
                    loadEvents();
                })
                .catch(error => {
                    alert('Error adding event: ' + error.message);
                });
        }
    });
}

// Edit event
function editEvent(eventId) {
    db.collection('events').doc(eventId).get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            const eventDate = data.date.toDate();
            
            // Format date as YYYY-MM-DD
            const formattedDate = eventDate.toISOString().split('T')[0];
            
            document.getElementById('modal-title').textContent = 'Edit Event';
            document.getElementById('event-id').value = doc.id;
            document.getElementById('event-title').value = data.title;
            document.getElementById('event-date').value = formattedDate;
            document.getElementById('event-time').value = data.time || '';
            document.getElementById('event-location').value = data.location;
            document.getElementById('event-category').value = data.category;
            document.getElementById('event-description').value = data.description;
            
            document.getElementById('event-modal').classList.add('active');
        }
    });
}

// Delete event
function deleteEvent(eventId) {
    db.collection('events').doc(eventId).delete()
        .then(() => {
            alert('Event deleted successfully!');
            loadEvents();
        })
        .catch(error => {
            alert('Error deleting event: ' + error.message);
        });
}

// Helper function to format date
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Helper function to format time
function formatTime(timeString) {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes} ${ampm}`;
}

// Helper function to truncate text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Set up export buttons
document.getElementById('export-registrations').addEventListener('click', () => {
    exportToCSV('registrations', 'MPGM_Registrations.csv');
});

document.getElementById('export-rsvps').addEventListener('click', () => {
    exportToCSV('rsvps', 'MPGM_RSVPs.csv');
});

document.getElementById('export-messages').addEventListener('click', () => {
    exportToCSV('contactSubmissions', 'MPGM_Messages.csv');
});

document.getElementById('export-donations').addEventListener('click', () => {
    exportToCSV('donations', 'MPGM_Donations.csv');
});

// Export data to CSV
function exportToCSV(collectionName, fileName) {
    db.collection(collectionName).get().then(snapshot => {
        if (snapshot.empty) {
            alert('No data to export');
            return;
        }
        
        let csv = '';
        const headers = [];
        const rows = [];
        
        // Process each document
        snapshot.forEach(doc => {
            const data = doc.data();
            const row = [];
            
            // Add all fields to CSV
            for (const [key, value] of Object.entries(data)) {
                // Skip Firestore-specific fields
                if (key === 'timestamp' || key === 'createdAt') continue;
                
                // Add header if not already added
                if (headers.indexOf(key) === -1) {
                    headers.push(key);
                }
                
                // Format the value
                let formattedValue = value;
                
                if (value instanceof firebase.firestore.Timestamp) {
                    formattedValue = formatDate(value.toDate());
                } else if (typeof value === 'object') {
                    formattedValue = JSON.stringify(value);
                } else if (typeof value === 'boolean') {
                    formattedValue = value ? 'Yes' : 'No';
                }
                
                row[headers.indexOf(key)] = `"${formattedValue}"`;
            }
            
            rows.push(row.join(','));
        });
        
        // Create CSV content
        csv = headers.join(',') + '\n' + rows.join('\n');
        
        // Create download link
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}