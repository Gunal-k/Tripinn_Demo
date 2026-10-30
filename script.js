/**
 * TripInn Holidays • Apple Design System & Mobile UX Script
 * Implements iOS bottom sheets, smooth carousel pagination, segmented controls,
 * theme management, and touch-first interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Lucide Icons Initializer ---
  const refreshIcons = () => {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  };
  refreshIcons();

  // --- 2. Apple Theme System (Sync with OS & LocalStorage) ---
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');

  const updateThemeUI = (isDark) => {
    if (isDark) {
      document.body.classList.add('dark-mode');
      if (themeToggle) {
        themeToggle.innerHTML = '<i data-lucide="sun"></i>';
      }
    } else {
      document.body.classList.remove('dark-mode');
      if (themeToggle) {
        themeToggle.innerHTML = '<i data-lucide="moon"></i>';
      }
    }
    refreshIcons();
  };

  const savedTheme = localStorage.getItem('tripinn-theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    updateThemeUI(true);
  } else {
    updateThemeUI(false);
  }

  // Listen to system changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('tripinn-theme')) {
      updateThemeUI(e.matches);
    }
  });

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isCurrentlyDark = document.body.classList.contains('dark-mode');
      const nextTheme = !isCurrentlyDark;
      updateThemeUI(nextTheme);
      localStorage.setItem('tripinn-theme', nextTheme ? 'dark' : 'light');
    });
  }

  // --- 3. iOS Mobile Navigation Drawer ---
  const menuToggle = document.getElementById('menuToggle');
  const mobileNavSheet = document.getElementById('mobileNavSheet');
  const mobileNavBackdrop = document.getElementById('mobileNavBackdrop');
  const mobileNavClose = document.getElementById('mobileNavClose');

  const openMobileNav = () => {
    if (!mobileNavSheet) return;
    mobileNavSheet.classList.add('active');
    if (mobileNavBackdrop) mobileNavBackdrop.classList.add('active');
    if (menuToggle) menuToggle.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeMobileNav = () => {
    if (!mobileNavSheet) return;
    mobileNavSheet.classList.remove('active');
    if (mobileNavBackdrop) mobileNavBackdrop.classList.remove('active');
    if (menuToggle) menuToggle.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileNavSheet && mobileNavSheet.classList.contains('active');
      if (isOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  if (mobileNavClose) mobileNavClose.addEventListener('click', closeMobileNav);
  if (mobileNavBackdrop) mobileNavBackdrop.addEventListener('click', closeMobileNav);

  // Close when tapping any link inside sheet
  if (mobileNavSheet) {
    mobileNavSheet.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMobileNav);
    });
  }

  // --- 4. Trip Plans Carousel, Dots & Indicator ---
  const carousel = document.getElementById('plansContainer');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const paginationDotsContainer = document.getElementById('paginationDots');
  const currentSlideNum = document.getElementById('currentSlideNum');
  const cards = carousel ? Array.from(carousel.querySelectorAll('.trip-card')) : [];

  const updatePaginationAndButtons = () => {
    if (!carousel || !cards.length) return;

    const scrollLeft = carousel.scrollLeft;
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;

    // Button states (Desktop)
    if (prevBtn) {
      const atStart = scrollLeft <= 10;
      prevBtn.disabled = atStart;
      prevBtn.style.opacity = atStart ? '0.25' : '1';
    }

    if (nextBtn) {
      const atEnd = scrollLeft >= maxScroll - 10;
      nextBtn.disabled = atEnd;
      nextBtn.style.opacity = atEnd ? '0.25' : '1';
    }

    // Determine current active card index based on center scroll position
    const containerCenter = scrollLeft + carousel.clientWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(containerCenter - cardCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    // Update Dots
    if (paginationDotsContainer) {
      const dots = paginationDotsContainer.querySelectorAll('.dot');
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === closestIndex);
      });
    }

    // Update Counter
    if (currentSlideNum) {
      currentSlideNum.textContent = closestIndex + 1;
    }
  };

  // Scroll to specific card
  const scrollToCard = (index) => {
    if (!carousel || !cards[index]) return;
    const targetCard = cards[index];
    const scrollTarget = targetCard.offsetLeft - 16;
    carousel.scrollTo({
      left: Math.max(0, scrollTarget),
      behavior: 'smooth'
    });
  };

  // Dot Click Handlers
  if (paginationDotsContainer) {
    paginationDotsContainer.addEventListener('click', (e) => {
      const dot = e.target.closest('.dot');
      if (!dot) return;
      const slideIndex = parseInt(dot.getAttribute('data-slide'), 10);
      if (!isNaN(slideIndex)) {
        scrollToCard(slideIndex);
      }
    });
  }

  // Desktop Carousel Arrow Controls
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (!carousel) return;
      const cardWidth = cards[0] ? cards[0].offsetWidth + 22 : 340;
      carousel.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (!carousel) return;
      const cardWidth = cards[0] ? cards[0].offsetWidth + 22 : 340;
      carousel.scrollBy({ left: cardWidth, behavior: 'smooth' });
    });
  }

  if (carousel) {
    carousel.addEventListener('scroll', updatePaginationAndButtons, { passive: true });
    window.addEventListener('resize', updatePaginationAndButtons, { passive: true });
    // Initial sync
    setTimeout(updatePaginationAndButtons, 100);
  }

  // --- 5. Apple Segmented Control Filter ---
  const segmentBtns = document.querySelectorAll('.segment-btn');
  segmentBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      segmentBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.getAttribute('data-filter');

      cards.forEach((card) => {
        const dest = card.getAttribute('data-destination');
        if (filter === 'all' || dest === filter) {
          card.style.display = 'flex';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
        }
      });

      // Reset carousel scroll to first visible card
      if (carousel) {
        carousel.scrollTo({ left: 0, behavior: 'smooth' });
        setTimeout(updatePaginationAndButtons, 200);
      }
    });
  });

  // --- 6. iOS Bottom Sheet / Itinerary Modal Store & Logic ---
  const tripDetails = {
    'munnar-kanthalloor': {
      title: 'Munnar & Kanthalloor',
      tag: '3 DAYS / 2 NIGHTS • ESCAPE',
      meta: '₹7,499 per person • ₹3,000 Advance',
      days: [
        {
          num: 'Day 1',
          title: 'Arrival in Munnar, Tea Hills & Dam View',
          desc: 'Overnight drive from Chennai. Check-in to our 3-star mountain resort. Fresh up and embark on a scenic tea garden walk, visit Mattupetty Dam, and Echo Point. Evening group icebreakers, delicious buffet dinner, and cozy bonfire.'
        },
        {
          num: 'Day 2',
          title: 'Magical Kanthalloor & Fruit Orchards',
          desc: 'Morning drive to the hidden valley of Kanthalloor. Explore apple, strawberry, and orange orchards. Witness the fragrant sandalwood forests of Marayoor and panoramic valley viewpoints. Return to resort for music night and campfire.'
        },
        {
          num: 'Day 3',
          title: 'Misty Sunrise & Spice Garden Shopping',
          desc: 'Early morning sunrise viewpoint trail. Hearty breakfast, check-out, and explore authentic Munnar spice plantations & homemade chocolate shops. Relaxing journey back to Chennai.'
        }
      ],
      inclusions: [
        'Round-trip A/C tempo traveller from Chennai',
        '3-Star resort stay on twin/triple sharing',
        'Daily breakfast & authentic dinner',
        'Campfire night with music (weather permitting)',
        'Experienced trip coordinator throughout',
        'All road tolls, driver batta & parking'
      ],
      bookingMsg: 'Hi TripInn Holidays, I want to book the Munnar & Kanthalloor trip!'
    },
    'munnar-kolukkumalai': {
      title: 'Munnar & Kolukkumalai',
      tag: '3 DAYS / 2 NIGHTS • ADVENTURE',
      meta: '₹7,499 per person • ₹3,000 Advance',
      days: [
        {
          num: 'Day 1',
          title: 'Chennai to Munnar & Tea Valley Trail',
          desc: 'Board our luxury A/C van from Chennai on Friday night. Wake up in Munnar’s mist. Check in, enjoy breakfast, and explore Mattupetty Dam and scenic viewpoint trails. Evening bonding games and dinner.'
        },
        {
          num: 'Day 2',
          title: '4x4 Jeep Safari & Kolukkumalai Sunrise',
          desc: '3:30 AM thrilling 4x4 rugged Jeep safari up to Kolukkumalai Peak (7,900 ft)—the highest organic tea estate in the world! Watch the legendary sunrise above the ocean of clouds. Afternoon visit to Eravikulam National Park to spot the Nilgiri Tahr.'
        },
        {
          num: 'Day 3',
          title: 'Waterfalls, Spice Farms & Return',
          desc: 'Relaxed breakfast, check-out, stop at Cheeyappara & Valara waterfalls for photos. Local spice shopping, followed by a comfortable journey back to Chennai with newfound friends.'
        }
      ],
      inclusions: [
        'A/C Van transit from Chennai and back',
        '3-Star verified resort stay',
        'Kolukkumalai 4x4 Jeep Safari fee included',
        'Breakfast & dinner covered',
        'Evening bonfire and group music',
        'Dedicated 24/7 trip coordinator'
      ],
      bookingMsg: 'Hi TripInn Holidays, I want to book the Munnar & Kolukkumalai trip!'
    },
    'valparai': {
      title: 'Valparai & Athirapally',
      tag: '2 DAYS / 1 NIGHT • NATURE & FALLS',
      meta: '₹6,500 per person • ₹3,000 Advance',
      days: [
        {
          num: 'Day 1',
          title: '40 Hairpin Bends & Misty Tea Valleys',
          desc: 'Scenic drive winding through the famous 40 hairpin curves of the Anaimalai Hills. Spot lion-tailed macaques and hornbills. Check in to Valparai estate stay, visit Solaiyar Dam, and enjoy a sunset view from tea gardens. Campfire and dinner.'
        },
        {
          num: 'Day 2',
          title: 'Athirapally Falls (India’s Niagara)',
          desc: 'Early morning forest drive into Kerala’s Sholayar range. Reach the thundering Athirapally Waterfalls. Walk down through the bamboo grove to feel the roaring mist. Afternoon journey back to Chennai.'
        }
      ],
      inclusions: [
        'Round-trip A/C push-back transit from Chennai',
        'Handpicked 3-star resort accommodation',
        'Breakfast & authentic South Indian dinner',
        'Guided sightseeing across Valparai & Athirapally',
        'All state permits, tolls & driver allowances'
      ],
      bookingMsg: 'Hi TripInn Holidays, I want to book the Valparai & Athirapally trip!'
    },
    'hogenakkal': {
      title: 'Hogenakkal & Yelagiri',
      tag: '2 DAYS / 1 NIGHT • LAKES & FALLS',
      meta: '₹6,500 per person • ₹3,000 Advance',
      days: [
        {
          num: 'Day 1',
          title: 'Coracle Boating on Kaveri & Drive to Yelagiri',
          desc: 'Morning arrival at Hogenakkal. Board traditional round coracle boats gliding between towering canyon walls. Enjoy fresh meals and scenic waterfalls. Afternoon scenic ghat road ascent into Yelagiri Hills. Resort check-in, campfire, and dinner.'
        },
        {
          num: 'Day 2',
          title: 'Punganur Lake Boating & Sunset Hilltop',
          desc: 'Breakfast, morning pedal boating on Punganur Lake, and stroll through nature parks. Visit Swamimalai viewpoint or enjoy adventure park games. Evening return to Chennai, reaching before 10 PM.'
        }
      ],
      inclusions: [
        'A/C sanitized tempo traveller from Chennai',
        'Resort stay in Yelagiri with mountain views',
        'All Meals Included (Breakfast, Lunch, Dinner)',
        'Traditional coracle boat ride tickets',
        'Evening campfire and guided activities'
      ],
      bookingMsg: 'Hi TripInn Holidays, I want to book the Hogenakkal & Yelagiri trip!'
    }
  };

  const itineraryModal = document.getElementById('itineraryModal');
  const itineraryModalBackdrop = document.getElementById('itineraryModalBackdrop');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalTripTag = document.getElementById('modalTripTag');
  const modalTripTitle = document.getElementById('modalTripTitle');
  const modalTripMeta = document.getElementById('modalTripMeta');
  const modalTripContent = document.getElementById('modalTripContent');
  const modalBookBtn = document.getElementById('modalBookBtn');

  const openItineraryModal = (tripKey) => {
    const data = tripDetails[tripKey];
    if (!data || !itineraryModal) return;

    if (modalTripTag) modalTripTag.textContent = data.tag;
    if (modalTripTitle) modalTripTitle.textContent = data.title;
    if (modalTripMeta) modalTripMeta.textContent = data.meta;

    if (modalTripContent) {
      let daysHtml = '';
      data.days.forEach((day) => {
        daysHtml += `
          <div class="itinerary-day-card">
            <div class="day-header">
              <span class="day-badge">${day.num}</span>
              <span class="day-title">${day.title}</span>
            </div>
            <p class="day-desc">${day.desc}</p>
          </div>
        `;
      });

      let inclusionsHtml = `
        <div class="itinerary-inclusions-box">
          <div class="inclusions-title">
            <i data-lucide="check-circle-2"></i>
            <span>Package Inclusions</span>
          </div>
          <ul class="inclusions-list">
      `;
      data.inclusions.forEach((inc) => {
        inclusionsHtml += `
          <li>
            <i data-lucide="check"></i>
            <span>${inc}</span>
          </li>
        `;
      });
      inclusionsHtml += `</ul></div>`;

      modalTripContent.innerHTML = daysHtml + inclusionsHtml;
    }

    if (modalBookBtn) {
      modalBookBtn.href = `https://wa.me/919092613147?text=${encodeURIComponent(data.bookingMsg)}`;
    }

    refreshIcons();

    itineraryModal.classList.add('active');
    if (itineraryModalBackdrop) itineraryModalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeItineraryModal = () => {
    if (!itineraryModal) return;
    itineraryModal.classList.remove('active');
    if (itineraryModalBackdrop) itineraryModalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  };

  // Attach click listeners to all "View Itinerary" buttons
  document.querySelectorAll('.open-modal-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tripKey = btn.getAttribute('data-trip');
      openItineraryModal(tripKey);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeItineraryModal);
  if (itineraryModalBackdrop) itineraryModalBackdrop.addEventListener('click', closeItineraryModal);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeItineraryModal();
      closeMobileNav();
    }
  });

  // Mobile Drag Down to Dismiss on Modal Handle
  const modalDragHandle = document.querySelector('.modal-drag-handle');
  if (modalDragHandle && itineraryModal) {
    let startY = 0;
    let currentY = 0;

    modalDragHandle.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
    }, { passive: true });

    modalDragHandle.addEventListener('touchmove', (e) => {
      currentY = e.touches[0].clientY;
      const diff = currentY - startY;
      if (diff > 0) {
        itineraryModal.style.transform = `translateY(${diff}px)`;
      }
    }, { passive: true });

    modalDragHandle.addEventListener('touchend', () => {
      const diff = currentY - startY;
      if (diff > 90) {
        itineraryModal.style.transform = '';
        closeItineraryModal();
      } else {
        itineraryModal.style.transform = '';
      }
    }, { passive: true });
  }

  // --- 7. iOS Settings-Style Accordion FAQ ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const trigger = item.querySelector('.faq-trigger');
    if (trigger) {
      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close others for clean iOS grouped feel
        faqItems.forEach((other) => {
          other.classList.remove('active');
          const otherTrigger = other.querySelector('.faq-trigger');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
        });

        if (!isActive) {
          item.classList.add('active');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });

  // --- 8. Mobile Sticky Floating Action Bar Visibility ---
  const mobileStickyBar = document.getElementById('mobileStickyBar');
  const heroSection = document.querySelector('.hero-section');

  if (mobileStickyBar && heroSection) {
    const checkScrollPosition = () => {
      const heroBottom = heroSection.getBoundingClientRect().bottom;
      // Show sticky bar once hero is scrolled past
      if (heroBottom < 100) {
        mobileStickyBar.classList.add('visible');
      } else {
        mobileStickyBar.classList.remove('visible');
      }
    };

    window.addEventListener('scroll', checkScrollPosition, { passive: true });
    checkScrollPosition();
  }

  // --- 9. Real-Time Telemetry & WhatsApp Conversion Event ---
  const trackAnalyticsEvent = (eventType, extra = {}) => {
    if (window.va && typeof window.va === 'function') {
      window.va('event', { name: eventType, ...extra });
    }
  };

  // Track initial page visit
  trackAnalyticsEvent('page_view', { path: window.location.pathname });

  // Track WhatsApp inquiry clicks across all CTAs
  document.querySelectorAll('a[href*="wa.me"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      trackAnalyticsEvent('whatsapp_click', {
        href: btn.getAttribute('href'),
        label: btn.innerText.trim() || 'WhatsApp CTA',
      });
    });
  });
});