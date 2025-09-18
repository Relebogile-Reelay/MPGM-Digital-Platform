// Mobile Navigation Toggle
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');
const navLinkItems = document.querySelectorAll('.nav-link');

burger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    burger.classList.toggle('active');
});

navLinkItems.forEach(item => {
    item.addEventListener('click', () => {
        navLinks.classList.remove('active');
        burger.classList.remove('active');
    });
});

// Smooth Scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Sticky Header on Scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    header.classList.toggle('sticky', window.scrollY > 0);
});

// Percentage Animation
const percentageElements = document.querySelectorAll('.percentage');

const animatePercentages = () => {
    percentageElements.forEach(el => {
        const targetPercent = parseInt(el.getAttribute('data-percent'));
        let currentPercent = 0;
        
        const interval = setInterval(() => {
            if (currentPercent >= targetPercent) {
                clearInterval(interval);
                return;
            }
            
            currentPercent++;
            el.textContent = currentPercent + '%';
        }, 20);
    });
};

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeInUp');
            
            if (entry.target.classList.contains('fund-allocation')) {
                animatePercentages();
            }
            
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.event-card, .link-card, .allocation-card, .section-title').forEach(el => {
    observer.observe(el);
});

// Form Validation for Contact Page
if (document.querySelector('.contact-form')) {
    const contactForm = document.querySelector('.contact-form');
    
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = contactForm.querySelector('input[name="name"]');
        const email = contactForm.querySelector('input[name="email"]');
        const subject = contactForm.querySelector('input[name="subject"]');
        const message = contactForm.querySelector('textarea[name="message"]');
        let isValid = true;
        
        // Reset error states
        contactForm.querySelectorAll('.error').forEach(el => {
            el.textContent = '';
        });
        
        // Validate Name
        if (!name.value.trim()) {
            name.nextElementSibling.textContent = 'Name is required';
            isValid = false;
        }
        
        // Validate Email
        if (!email.value.trim()) {
            email.nextElementSibling.textContent = 'Email is required';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
            email.nextElementSibling.textContent = 'Please enter a valid email';
            isValid = false;
        }
        
        // Validate Subject
        if (!subject.value.trim()) {
            subject.nextElementSibling.textContent = 'Subject is required';
            isValid = false;
        }
        
        // Validate Message
        if (!message.value.trim()) {
            message.nextElementSibling.textContent = 'Message is required';
            isValid = false;
        }
        
        if (isValid) {
            // Simulate form submission
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            
            setTimeout(() => {
                contactForm.reset();
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
                
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'success-message';
                successMessage.textContent = 'Your message has been sent successfully!';
                contactForm.appendChild(successMessage);
                
                setTimeout(() => {
                    successMessage.remove();
                }, 5000);
            }, 1500);
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Any initialization code can go here
});