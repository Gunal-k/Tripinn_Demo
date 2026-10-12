document.addEventListener('DOMContentLoaded', () => {
  // Re-render icons initially
  if (window.lucide) lucide.createIcons();

  // --- Mobile Navigation ---
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      mainNav.classList.toggle('active');
    });

    // Close menu when clicking an anchor link
    mainNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => mainNav.classList.remove('active'));
    });
  }

  // --- Theme Toggle ---
  const themeToggle = document.getElementById('themeToggle');
  const updateThemeIcon = (isDark) => {
    if (!themeToggle) return;
    themeToggle.innerHTML = isDark
      ? '<i data-lucide="sun"></i>'
      : '<i data-lucide="moon"></i>';
    if (window.lucide) lucide.createIcons();
  };

  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    updateThemeIcon(true);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      updateThemeIcon(isDark);
    });
  }

    // --- Carousel Navigation with Dynamic Disabled State ---
    const carousel = document.getElementById('plansContainer');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');

    if (carousel && prevBtn && nextBtn) {
    // Update button disabled state based on scroll offset
    const updateButtonStates = () => {
        // 2px threshold handles subpixel rounding errors across browsers
        const isAtStart = carousel.scrollLeft <= 2;
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        const isAtEnd = carousel.scrollLeft >= maxScroll - 2;

        prevBtn.disabled = isAtStart;
        nextBtn.disabled = isAtEnd;
    };

    const scrollCarousel = (direction) => {
        const cards = Array.from(carousel.querySelectorAll('.plan'));
        if (!cards.length) return;

        const style = window.getComputedStyle(carousel);
        const gap = parseFloat(style.columnGap || style.gap) || 24;
        const cardWidth = cards[0].getBoundingClientRect().width;
        const scrollStep = cardWidth + gap;

        carousel.scrollBy({
        left: direction === 'next' ? scrollStep : -scrollStep,
        behavior: 'smooth',
        });

        // Subtle highlight pulse on card
        setTimeout(() => {
        const carouselRect = carousel.getBoundingClientRect();
        const currentCard = cards.find((card) => {
            const rect = card.getBoundingClientRect();
            return (
            rect.left >= carouselRect.left - 50 &&
            rect.left <= carouselRect.right
            );
        });

        if (currentCard) {
            currentCard.classList.remove('card-highlight');
            void currentCard.offsetWidth;
            currentCard.classList.add('card-highlight');
        }
        }, 280);
    };

    // Event Listeners
    prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        scrollCarousel('prev');
    });

    nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        scrollCarousel('next');
    });

    // Track scroll and window resizing
    carousel.addEventListener('scroll', updateButtonStates, { passive: true });
    window.addEventListener('resize', updateButtonStates, { passive: true });

    // Initial check on page load
    updateButtonStates();
    }
});