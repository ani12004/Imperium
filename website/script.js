// Tilt Effect for Cards
const cards = document.querySelectorAll('.feature-card');

cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10; // Max rotation deg
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
});

// Counter Animation
const counters = document.querySelectorAll('.counter');
const speed = 200;

const animateCounters = () => {
    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const inc = target / speed;

            if (count < target) {
                counter.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 20);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });
};

// Intersection Observer for Stats
const statsSection = document.querySelector('.stats');
let animated = false;

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
            animateCounters();
            animated = true;
        }
    });
}, { threshold: 0.5 });

observer.observe(statsSection);

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Search and Filter Functionality
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const commandCards = document.querySelectorAll('.command-card');
const categories = document.querySelectorAll('.command-category');

// Filter by Category
if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            categories.forEach(category => {
                if (filter === 'all' || category.id === filter) {
                    category.classList.remove('hidden');
                } else {
                    category.classList.add('hidden');
                }
            });
        });
    });
}

// Search Commands
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();

        categories.forEach(category => {
            let hasVisibleCommands = false;
            const cards = category.querySelectorAll('.command-card');

            cards.forEach(card => {
                const name = card.querySelector('.cmd-name').innerText.toLowerCase();
                const desc = card.querySelector('.cmd-desc').innerText.toLowerCase();

                if (name.includes(searchTerm) || desc.includes(searchTerm)) {
                    card.classList.remove('hidden');
                    hasVisibleCommands = true;
                } else {
                    card.classList.add('hidden');
                }
            });

            // Hide category if no commands match
            if (hasVisibleCommands) {
                category.classList.remove('hidden');
            } else {
                category.classList.add('hidden');
            }
        });
    });
}
