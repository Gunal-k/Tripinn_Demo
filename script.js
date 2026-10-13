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

  // --- Carousel Navigation with Controlled Slow Scroll ---
  const carousel = document.getElementById('plansContainer');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (carousel && prevBtn && nextBtn) {
    let isScrolling = false;

    const updateButtonStates = () => {
      const isAtStart = carousel.scrollLeft <= 4;
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      const isAtEnd = carousel.scrollLeft >= maxScroll - 4;

      prevBtn.disabled = isAtStart;
      nextBtn.disabled = isAtEnd;

      prevBtn.style.opacity = isAtStart ? '0.35' : '1';
      prevBtn.style.pointerEvents = isAtStart ? 'none' : 'auto';
      nextBtn.style.opacity = isAtEnd ? '0.35' : '1';
      nextBtn.style.pointerEvents = isAtEnd ? 'none' : 'auto';
    };

    // Custom slow smooth scroll animation
    const smoothScrollTo = (targetPosition, duration = 850) => {
      const startPosition = carousel.scrollLeft;
      const distance = targetPosition - startPosition;
      let startTime = null;

      // Smooth cubic easing (starts gentle, glides to a stop)
      const easeInOutCubic = (t) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const animation = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const ease = easeInOutCubic(progress);

        carousel.scrollLeft = startPosition + distance * ease;

        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        } else {
          // Animation finished: restore native snap
          carousel.style.scrollSnapType = 'x mandatory';
          isScrolling = false;
          updateButtonStates();

          // Trigger highlight pulse
          const cards = Array.from(carousel.querySelectorAll('.plan'));
          const carouselRect = carousel.getBoundingClientRect();
          const currentCard = cards.find((card) => {
            const rect = card.getBoundingClientRect();
            return rect.left >= carouselRect.left - 20 && rect.left <= carouselRect.right;
          });

          if (currentCard) {
            currentCard.classList.remove('card-highlight');
            void currentCard.offsetWidth;
            currentCard.classList.add('card-highlight');
          }
        }
      };

      requestAnimationFrame(animation);
    };

    const scrollCarousel = (direction) => {
      if (isScrolling) return;

      const cards = Array.from(carousel.querySelectorAll('.plan'));
      if (!cards.length) return;

      const style = window.getComputedStyle(carousel);
      const gap = parseFloat(style.columnGap || style.gap) || 24;
      const cardWidth = cards[0].offsetWidth;
      const scrollStep = cardWidth + gap;

      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      const rawTarget =
        direction === 'next'
          ? carousel.scrollLeft + scrollStep
          : carousel.scrollLeft - scrollStep;
      const targetScroll = Math.max(0, Math.min(rawTarget, maxScroll));

      isScrolling = true;
      carousel.style.scrollSnapType = 'none';

      // 850ms gives a smooth, noticeable glide (increase to 1000ms+ for even slower)
      smoothScrollTo(targetScroll, 850);
    };

    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      scrollCarousel('prev');
    });

    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      scrollCarousel('next');
    });

    carousel.addEventListener('scroll', updateButtonStates, { passive: true });
    window.addEventListener('resize', updateButtonStates, { passive: true });

    updateButtonStates();
  }
});