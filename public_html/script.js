document.addEventListener('DOMContentLoaded', () => {
    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const burger = document.querySelector('.burger');
    const navLinks = document.querySelector('.nav-links');

    burger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        burger.classList.toggle('active');
    });

    // Close mobile menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            burger.classList.remove('active');
        });
    });

    // Intersection Observer for Reveal Animations
    const observerOptions = {
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Image Sequence Scroll Sync
    const canvas = document.getElementById('hero-canvas');
    const ctx = canvas?.getContext('2d');
    const heroPinContainer = document.querySelector('.hero-pin-container');
    const heroContent = document.querySelector('.hero-content');

    const frameCount = 51; // 51 images in assets/flower_images
    const images = [];
    const sequence = { frame: 0 };

    let targetFrame = 0;
    let actualFrame = 0;
    const lerpFactor = 0.1;

    // Preload image sequence (ezgif-frame-001.png format)
    const currentFrame = index => (
        `assets/flower_images/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.png`
    );

    const preloadImages = () => {
        for (let i = 0; i < frameCount; i++) {
            const img = new Image();
            img.src = currentFrame(i);
            images.push(img);
        }
    };

    preloadImages();

    const drawFrame = (frameIndex) => {
        const index = Math.max(0, Math.min(frameCount - 1, Math.floor(frameIndex)));
        const img = images[index];

        if (!ctx || !img || !img.complete) return;

        const cw = canvas.width;
        const ch = canvas.height;
        const iw = img.width;
        const ih = img.height;
        const iRatio = iw / ih;
        const cRatio = cw / ch;

        let sx, sy, sw, sh;
        if (iRatio > cRatio) {
            sw = ih * cRatio;
            sh = ih;
            sx = (iw - sw) / 2;
            sy = 0;
        } else {
            sw = iw;
            sh = iw / cRatio;
            sx = 0;
            sy = (ih - sh) / 2;
        }

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
    };

    const resizeCanvas = () => {
        if (!canvas) return;
        canvas.width = window.innerWidth * window.devicePixelRatio;
        canvas.height = window.innerHeight * window.devicePixelRatio;
        drawFrame(actualFrame);
    };

    window.addEventListener('resize', resizeCanvas);

    const updateLoop = () => {
        if (heroPinContainer) {
            const rect = heroPinContainer.getBoundingClientRect();
            // Progress goes from 0 to 1 based on how much of the pin container has scrolled past
            const scrollProgress = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));

            targetFrame = (frameCount - 1) * scrollProgress;
            actualFrame += (targetFrame - actualFrame) * lerpFactor;

            drawFrame(actualFrame);

            // Parallax and Fade effects
            const parallaxVal = scrollProgress * 100;
            // Shift from -50% (centered) to slightly higher (-55% or similar) to avoid pushing down
            const yOffset = -50 - (parallaxVal * 0.1);
            canvas.style.transform = `translate3d(-50%, ${yOffset}%, 0) scale(1.1)`;

            if (heroContent) {
                heroContent.style.transform = `translate3d(0, ${-parallaxVal * 0.5}px, 0)`;
                heroContent.style.opacity = 1 - (scrollProgress * 2);
            }
        }
        requestAnimationFrame(updateLoop);
    };

    // Initial draw when first image loads
    if (images[0]) {
        images[0].onload = resizeCanvas;
    }

    requestAnimationFrame(updateLoop);

    // General Parallax Scroll Effect
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;

        // Section Parallax Feature (Video)
        const featureVideo = document.querySelector('.parallax-feature .parallax-video');
        if (featureVideo) {
            const featureSection = document.querySelector('.parallax-feature');
            const rect = featureSection.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            if (rect.top < windowHeight && rect.bottom > 0) {
                const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
                const travel = (progress - 0.5) * 100; // Move +/- 50px
                featureVideo.style.transform = `translate3d(0, ${travel}px, 0)`;
            }
        }

        // About Background Parallax
        const aboutBg = document.querySelector('.about-parallax');
        const aboutSection = document.getElementById('about');
        if (aboutBg && aboutSection) {
            const sectionRect = aboutSection.getBoundingClientRect();
            const sectionTop = sectionRect.top;
            const windowHeight = window.innerHeight;

            // Only calculate if the section is partially visible
            if (sectionTop < windowHeight && sectionTop + sectionRect.height > 0) {
                // Calculate relative progress (0 when section enters, 1 when section leaves)
                const progress = (windowHeight - sectionTop) / (windowHeight + sectionRect.height);
                const travel = (progress - 0.5) * 150; // Move +/- 75px
                aboutBg.style.transform = `translate3d(0, ${travel}px, 0)`;
            }
        }

        // Bouquet Card Zoom Effect
        document.querySelectorAll('.bouquet-card').forEach(card => {
            const img = card.querySelector('img');
            if (!img) return;

            const rect = card.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const cardCenter = rect.top + rect.height / 2;
            const viewportCenter = windowHeight / 2;

            // Calculate distance from center (normalized)
            const distanceFromCenter = Math.abs(viewportCenter - cardCenter);
            const maxDistance = windowHeight / 2 + rect.height / 2;

            if (distanceFromCenter < maxDistance) {
                // Scale from 1.0 at edges to 1.15 at center
                const zoomFactor = 1 + (0.15 * (1 - distanceFromCenter / maxDistance));
                img.style.setProperty('--zoom', zoomFactor);
            }
        });
    });

    // Form Submission Handling (Visual feedback only)
    const form = document.getElementById('florist-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.innerText;

            btn.innerText = 'Sending...';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerText = 'Success! We\'ll contact you soon.';
                btn.style.backgroundColor = '#5d6d5e';
                form.reset();

                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.backgroundColor = '';
                    btn.disabled = false;
                }, 3000);
            }, 1500);
        });
    }

    // Smooth Scroll for Internal Links (redundant but helps legacy / custom behavior)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 70, // Account for fixed nav
                    behavior: 'smooth'
                });
            }
        });
    });

    // Security Measures: Disable Right Click and Copying
    document.addEventListener('contextmenu', e => e.preventDefault());

    document.addEventListener('keydown', e => {
        // Prevent Ctrl+C, Ctrl+U, Ctrl+S, Ctrl+P, Ctrl+Shift+I, etc.
        if (e.ctrlKey && (
            e.key === 'c' ||
            e.key === 'u' ||
            e.key === 's' ||
            e.key === 'p' ||
            (e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c'))
        )) {
            e.preventDefault();
            return false;
        }
    });

    // Hidden Console Watermark
    console.log(
        "%c Developed by aarambh tech with love %c",
        "background: #f1a7b0; color: #fff; padding: 5px; border-radius: 3px; font-weight: bold;",
        ""
    );
});
