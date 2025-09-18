document.addEventListener('DOMContentLoaded', function() {
    // Gallery filtering functionality
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            
            // Filter items
            galleryItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                    // Add animation for appearing items
                    item.style.animation = 'fadeIn 0.5s ease forwards';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Image modal functionality
    const modal = document.querySelector('.gallery-modal');
    const modalImg = document.getElementById('modal-image');
    const modalCaption = document.getElementById('modal-caption');
    const closeModal = document.querySelector('.close-modal');
    
    function openModal(src, caption) {
        modal.style.display = 'flex';
        modalImg.src = src;
        modalCaption.textContent = caption;
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }
    
    // Close modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    // Close when clicking outside image
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'flex') {
            if (e.key === 'Escape') {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
            
            if (e.key === 'ArrowRight') {
                navigateGallery(1);
            }
            
            if (e.key === 'ArrowLeft') {
                navigateGallery(-1);
            }
        }
    });
    
    // Gallery navigation
    let currentImageIndex = 0;
    const allImages = Array.from(document.querySelectorAll('.gallery-item img'));
    
    function navigateGallery(direction) {
        currentImageIndex += direction;
        
        // Wrap around
        if (currentImageIndex >= allImages.length) {
            currentImageIndex = 0;
        } else if (currentImageIndex < 0) {
            currentImageIndex = allImages.length - 1;
        }
        
        const imgSrc = allImages[currentImageIndex].src;
        const imgAlt = allImages[currentImageIndex].alt;
        modalImg.src = imgSrc;
        modalCaption.textContent = imgAlt;
    }
    
    // Set up click handlers for all gallery items
    galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        const btn = item.querySelector('.btn-view');
        
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentImageIndex = index;
            openModal(img.src, img.alt);
        });
        
        // Also allow clicking anywhere on the item
        item.addEventListener('click', () => {
            currentImageIndex = index;
            openModal(img.src, img.alt);
        });
    });
    
    // Lazy loading for images
    const lazyLoadObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                lazyLoadObserver.unobserve(img);
            }
        });
    }, { rootMargin: '200px' });
    
    // Observe all gallery images for lazy loading
    document.querySelectorAll('.gallery-item img[data-src]').forEach(img => {
        lazyLoadObserver.observe(img);
    });
});


//images category
// Organize images into different galleries/categories
const galleries = {
    food_parcels: [
        {
            src: 'images/food_parcels.jpg',
            caption: 'Food Distribution'
        },
        {
            src: 'images/parcels.jpg',
            caption: 'Volunteers Packing Meals'
        }
    ],
    youth_colorRun: [
        {
            src: 'images/youth.jpg',
            caption: 'color run'
        },
        {
            src: 'images/youth_color_run.jpg',
            caption: 'Community Event'
        }
        ,
        {
            src: 'images/youth_color_run_1.jpg',
            caption: 'Community Event'
        }
    ],
    // Add more galleries as needed
    vintage: [

         {
            src: 'images/IMG_1565.JPG',
            caption: 'vintage'
        },
        {
            src: 'images/church.jpg',
            caption: 'vintage'
        },

        {
            src: 'images/vintage1.jpg',
            caption: 'vintage'
        }
        

       
    ]
,
     Lofdal: [
        {
            src: 'images/prayer.jpg',
            caption: 'vintage'
        },

        {
            src: 'images/lofdal.jpg',
            caption: 'vintage'
        }
    ]


    ,
     sunday_service: [
        {
            src: 'images/sunday service.jpg',
            caption: 'sunday service'
        },

        {
            src: 'images/sunday service_1.jpg',
            caption: 'sunday service'
        }
    ]

     ,
     baptism: [
        {
            src: 'images/sunday service.jpg',
            caption: 'vintage'
        },

        {
            src: 'images/sunday service_1.jpg',
            caption: 'vintage'
        }
    ]

      ,
     seminar: [
        
        {
            src: 'images/seminar.jpg',
            caption: 'seminar'
        },

        {
            src: 'images/seminar_2.jpg',
            caption: 'seminar'
        },

        {
            src: 'images/seminar_1.jpg',
            caption: 'seminar'
        }
        

    ],

     Birthday: [
        
        {
            src: 'images/birthday.jpg',
            caption: 'Birthday'
        },
        
        {
            src: 'images/birthday_1.jpg',
            caption: 'birthday'
        },

        {
            src: 'images/birthday_2.jpg',
            caption: 'Birthday'
        }
        

    ]
};


let currentIndex = 0;
let currentGallery = null;

function openModal(startSrc, startCaption, galleryName) {
    // Set the current gallery
    currentGallery = galleries[galleryName] || galleries[Object.keys(galleries)[0]];
    
    // Find the starting index
    currentIndex = currentGallery.findIndex(img => img.src === startSrc);
    if (currentIndex === -1) currentIndex = 0; // fallback to first image

    document.getElementById('imageModal').style.display = 'block';
    showImage(currentIndex);
}

function closeModal() {
    document.getElementById('imageModal').style.display = 'none';
    currentGallery = null;
}

function showImage(index) {
    if (!currentGallery) return;
    
    const modalImg = document.getElementById('modalImg');
    const captionText = document.getElementById('modalCaption');

    modalImg.src = currentGallery[index].src;
    captionText.textContent = currentGallery[index].caption;
}

function prevImage() {
    if (!currentGallery) return;
    currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
    showImage(currentIndex);
}

function nextImage() {
    if (!currentGallery) return;
    currentIndex = (currentIndex + 1) % currentGallery.length;
    showImage(currentIndex);
}

