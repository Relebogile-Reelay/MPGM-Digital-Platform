document.addEventListener('DOMContentLoaded', function() {
    // Leadership card animations
    const leaderCards = document.querySelectorAll('.leader-card');
    
    leaderCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 * index);
    });

    // Belief cards animation
    const beliefCards = document.querySelectorAll('.belief-card');
    
    const beliefObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 150 * index);
            }
        });
    }, { threshold: 0.1 });
    
    beliefCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        beliefObserver.observe(card);
    });

    // Financial chart animation
    document.addEventListener('DOMContentLoaded', function() {
    // Animate chart bars when scrolled to
    const chartBars = document.querySelectorAll('.chart-bar');
    
    const animateBars = () => {
        chartBars.forEach(bar => {
            const barPosition = bar.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (barPosition < screenPosition) {
                bar.style.opacity = '1';
                // The animation is handled by CSS transition on the ::after pseudo-element
            }
        });
    };
    
    // Initialize bars as transparent
    chartBars.forEach(bar => {
        bar.style.opacity = '0';
    });
    
    // Check on load and scroll
    animateBars();
    window.addEventListener('scroll', animateBars);
});
});

