/* ============================================================
   Truepocket â€” script.js  (performance-optimised)
   Key improvements:
   â€¢ Passive event listeners everywhere possible
   â€¢ Particle O(n) connection culling with spatial grid
   â€¢ rAF-throttled mousemove for cursor & 3D tilt
   â€¢ Scroll handler debounced / passive
   â€¢ Testimonials rendered lazily via IntersectionObserver
   â€¢ Counter animation triggered only once per element
   â€¢ All heavy loops use requestAnimationFrame, not setTimeout
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // â”€â”€ THEME TOGGLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const THEME_KEY = 'truepocket-theme';
    const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const getStoredTheme  = () => localStorage.getItem(THEME_KEY) || getSystemTheme();

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || getSystemTheme();
        applyTheme(current === 'dark' ? 'light' : 'dark');
    }

    applyTheme(getStoredTheme());

    // Track OS theme changes only when the user hasn't overridden
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem(THEME_KEY)) applyTheme(e.matches ? 'dark' : 'light');
    });

    const desktopToggle = document.getElementById('theme-toggle');
    const mobileToggle  = document.getElementById('theme-toggle-mobile');
    if (desktopToggle) desktopToggle.addEventListener('click', toggleTheme);
    if (mobileToggle)  mobileToggle.addEventListener('click', toggleTheme);


    // â”€â”€ PARTICLE CANVAS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let W, H;

        function resizeCanvas() {
            W = canvas.width  = window.innerWidth;
            H = canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas, { passive: true });

        const COLORS = [
            'rgba(0,212,170,',
            'rgba(108,99,255,',
            'rgba(79,195,247,',
            'rgba(255,255,255,'
        ];
        const MAX_DIST = 110; // connection distance
        const MAX_DIST_SQ = MAX_DIST * MAX_DIST;

        class Particle {
            constructor() { this.reset(true); }
            reset(randomY = false) {
                this.x       = Math.random() * W;
                this.y       = randomY ? Math.random() * H : Math.random() * H;
                this.size    = Math.random() * 2 + 0.5;
                this.speedX  = (Math.random() - 0.5) * 0.35;
                this.speedY  = (Math.random() - 0.5) * 0.35;
                this.colorBase = COLORS[Math.floor(Math.random() * COLORS.length)];
                this.opacity = Math.random() * 0.45 + 0.1;
                this.fadeDir = Math.random() > 0.5 ? 1 : -1;
                this.life    = 0;
                this.maxLife = 220 + Math.random() * 280;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.life++;
                this.opacity += this.fadeDir * 0.002;
                if (this.opacity > 0.55) this.fadeDir = -1;
                if (this.opacity < 0.05) this.fadeDir =  1;
                if (this.life > this.maxLife || this.x < -10 || this.x > W + 10 || this.y < -10 || this.y > H + 10) {
                    this.reset();
                }
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.colorBase + this.opacity + ')';
                ctx.fill();
            }
        }

        // Limit particle count based on screen area and device type for smooth performance
        const isMobile = window.innerWidth < 768;
        const COUNT = isMobile
            ? Math.min(15, Math.floor((W * H) / 60000))
            : Math.min(40, Math.floor((W * H) / 32000));
        const particles = Array.from({ length: COUNT }, () => new Particle());

        /* O(n) connection drawing using a simple cell grid */
        function drawConnections() {
            const cellSize = MAX_DIST;
            const cols = Math.ceil(W / cellSize) + 1;
            const grid = new Map();

            // Assign particles to grid cells
            for (const p of particles) {
                const cx = (p.x / cellSize) | 0;
                const cy = (p.y / cellSize) | 0;
                const key = cx + cy * cols;
                if (!grid.has(key)) grid.set(key, []);
                grid.get(key).push(p);
            }

            ctx.lineWidth = 0.5;

            for (const p of particles) {
                const cx = (p.x / cellSize) | 0;
                const cy = (p.y / cellSize) | 0;

                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        const neighbors = grid.get((cx + dx) + (cy + dy) * cols);
                        if (!neighbors) continue;
                        for (const q of neighbors) {
                            if (q === p) continue;
                            const distSq = (p.x - q.x) ** 2 + (p.y - q.y) ** 2;
                            if (distSq < MAX_DIST_SQ) {
                                const alpha = (1 - distSq / MAX_DIST_SQ) * 0.12;
                                ctx.strokeStyle = `rgba(0,212,170,${alpha})`;
                                ctx.beginPath();
                                ctx.moveTo(p.x, p.y);
                                ctx.lineTo(q.x, q.y);
                                ctx.stroke();
                            }
                        }
                    }
                }
            }
        }

        let rafId;
        function animateParticles() {
            ctx.clearRect(0, 0, W, H);
            drawConnections();
            for (const p of particles) { p.update(); p.draw(); }
            rafId = requestAnimationFrame(animateParticles);
        }
        animateParticles();

        // Pause particles when tab is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) cancelAnimationFrame(rafId);
            else animateParticles();
        });

        // Pause particles when canvas is scrolled out of view
        const canvasObserver = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) animateParticles();
            else cancelAnimationFrame(rafId);
        }, { threshold: 0 });
        canvasObserver.observe(canvas);
    }


    // â”€â”€ COUNTER ANIMATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    function animateCounter(el, target, suffix = '', duration = 1800) {
        const start     = performance.now();
        const isDecimal = String(target).includes('.');
        el.dataset.animated = 'true';
        function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased    = 1 - (1 - progress) ** 3;
            el.textContent = (isDecimal ? (eased * target).toFixed(1) : Math.round(eased * target)) + suffix;
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    const statObserver = new IntersectionObserver(entries => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const h3 = entry.target.querySelector('h3');
            if (!h3 || h3.dataset.animated) continue;
            const text = h3.textContent.trim();
            if (text === '4.9/5') {
                animateCounter(h3, 4.9, '/5');
            } else if (/^\d/.test(text)) {
                const num    = parseFloat(text.replace(/[^0-9.]/g, ''));
                const suffix = text.replace(/[0-9.]/g, '');
                if (!isNaN(num)) animateCounter(h3, num, suffix);
            }
            statObserver.unobserve(entry.target);
        }
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-card').forEach(c => statObserver.observe(c));


    // â”€â”€ CUSTOM CURSOR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const cursorDot     = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice && cursorDot && cursorOutline) {
        document.documentElement.style.cursor = 'none';
        document.querySelectorAll('a, button, .feature-card, .store-btn').forEach(el => {
            el.style.cursor = 'none';
        });

        let mouseX = innerWidth / 2, mouseY = innerHeight / 2;
        let outX = mouseX, outY = mouseY;
        let pendingMouse = false;

        // Throttle mousemove with rAF
        window.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (!pendingMouse) {
                pendingMouse = true;
                requestAnimationFrame(() => {
                    cursorDot.style.transform = `translate3d(${mouseX}px,${mouseY}px,0) translate(-50%,-50%)`;
                    pendingMouse = false;
                });
            }
        }, { passive: true });

        (function tickOutline() {
            outX += (mouseX - outX) * 0.14;
            outY += (mouseY - outY) * 0.14;
            cursorOutline.style.transform = `translate3d(${outX}px,${outY}px,0) translate(-50%,-50%)`;
            requestAnimationFrame(tickOutline);
        })();

        // Hover effects on interactive elements
        document.querySelectorAll('a, button, .feature-card, .store-btn').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorOutline.style.width  = '60px';
                cursorOutline.style.height = '60px';
                cursorOutline.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
            }, { passive: true });
            el.addEventListener('mouseleave', () => {
                cursorOutline.style.width  = '40px';
                cursorOutline.style.height = '40px';
                cursorOutline.style.backgroundColor = 'transparent';
            }, { passive: true });
        });
    }


    // â”€â”€ 3D TILT FOR GLASS PANELS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Skip entirely on touch/mobile â€” not useful and costs event overhead
    if (!isTouchDevice && window.innerWidth >= 768) {
        document.querySelectorAll('.glass-panel').forEach(el => {
            let tiltPending = false;
            el.addEventListener('mousemove', e => {
                if (tiltPending) return;
                tiltPending = true;
                requestAnimationFrame(() => {
                    const rect   = el.getBoundingClientRect();
                    const x      = e.clientX - rect.left;
                    const y      = e.clientY - rect.top;
                    const rotX   = ((y - rect.height / 2) / rect.height * 2) * -8;
                    const rotY   = ((x - rect.width  / 2) / rect.width  * 2) *  8;
                    el.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.015,1.015,1.015)`;
                    tiltPending = false;
                });
            }, { passive: true });

            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
            }, { passive: true });
        });
    }


    // â”€â”€ NAVBAR SCROLL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const navbar = document.getElementById('navbar');
    let scrollPending = false;

    window.addEventListener('scroll', () => {
        if (scrollPending) return;
        scrollPending = true;
        requestAnimationFrame(() => {
            if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
            scrollPending = false;
        });
    }, { passive: true });


    // â”€â”€ MOBILE MENU â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks  = document.querySelector('.nav-links');

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('active');
            mobileBtn.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileBtn.setAttribute('aria-label', 'Open navigation menu');
            });
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 992) {
                navLinks.classList.remove('active');
            }
        }, { passive: true });
    }


    // â”€â”€ SMOOTH ANCHOR SCROLLING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const id = this.getAttribute('href');
            if (id === '#') return;
            const target = document.querySelector(id);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });


    // â”€â”€ SCROLL-IN ANIMATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const revealObserver = new IntersectionObserver(entries => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                entry.target.style.opacity    = '1';
                entry.target.style.transform  = 'translateY(0) scale(1)';
                entry.target.style.filter     = 'blur(0)';
                revealObserver.unobserve(entry.target);
            }
        }
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.feature-card, .step, .cta-box, .section-header').forEach((el, i) => {
        el.style.opacity   = '0';
        el.style.transform = 'translateY(30px) scale(0.97)';
        el.style.filter    = 'blur(4px)';
        el.style.transition = `opacity 0.7s ease ${(i % 3) * 0.08}s, transform 0.7s ease ${(i % 3) * 0.08}s, filter 0.7s ease`;
        revealObserver.observe(el);
    });


    // â”€â”€ TESTIMONIALS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const testimonialsData = [
        { name: "Rajesh Kumar",       title: "Student",           text: "The zero-interest message was clear, and I could review the terms before I continued.",           rating: 5 },
        { name: "Priya Sharma",       title: "Daily Wage Worker", text: "The process felt straightforward and secure, and the day-6 late fee rule was easy to understand.", rating: 5 },
        { name: "Anand Patel",        title: "Delivery Worker",   text: "I needed simple support and Truepocket made the steps easy to follow.",                           rating: 5 },
        { name: "Divya Singh",        title: "Employee",          text: "The terms were explained clearly and I felt comfortable reviewing everything on my phone.",         rating: 4 },
        { name: "Vikram Menon",       title: "Construction Worker",text: "The app was simple to use and the support team answered my questions quickly.",                   rating: 5 },
        { name: "Sneha Iyer",         title: "College Student",   text: "The steps were clear and the zero-interest support felt trustworthy from the start.",              rating: 5 },
        { name: "Karthik Reddy",      title: "Retail Worker",     text: "I liked that the repayment details and late fee timing were visible before I moved ahead.",        rating: 5 },
        { name: "Anjali Nair",        title: "Teacher",           text: "The application was quick to understand and the support was helpful.",                             rating: 5 },
        { name: "Suresh Kumar",       title: "Electrician",       text: "A practical option when you want support that does not feel complicated.",                         rating: 4 },
        { name: "Meera Desai",        title: "Employee",          text: "The experience felt organized and I could review the details at my own pace.",                     rating: 5 },
        { name: "Arjun Menon",        title: "Software Developer",text: "The app handled the basics well and the flow felt secure.",                                        rating: 5 },
        { name: "Harini Kumar",       title: "Student",           text: "I appreciated the straightforward application and the clean presentation.",                        rating: 5 },
        { name: "Ravi Shankar",       title: "Photographer",      text: "A good option if you want a simple application and clear communication.",                          rating: 5 },
        { name: "Deepika Reddy",      title: "Food Vendor",       text: "The details were easy to review and the support team answered quickly.",                           rating: 5 },
        { name: "Nikhil Joshi",       title: "Daily Wage Worker", text: "The process was simple enough to complete without confusion.",                                     rating: 5 },
        { name: "Aadhya Singh",       title: "Student",           text: "I could complete the application without needing to visit an office.",                             rating: 5 },
        { name: "Sanjay Deshmukh",    title: "Plumber",           text: "The app made it easier to understand what to expect before applying.",                             rating: 5 },
        { name: "Pooja Kapoor",       title: "Employee",          text: "The interface felt clean and the microfinance flow was easy to follow.",                           rating: 5 },
        { name: "Rahul Iyer",         title: "Freelancer",        text: "A useful option for people who want a clear, digital process.",                                    rating: 5 },
        { name: "Geeta Patel",        title: "Nurse",             text: "The application moved at a steady pace and the terms were visible upfront.",                       rating: 5 },
        { name: "Manoj Kumar",        title: "Mechanic",          text: "Each step was explained well, which made the process easier to trust.",                            rating: 5 },
        { name: "Kavya Sharma",       title: "Content Creator",   text: "The support felt more transparent than I expected.",                                               rating: 5 },
        { name: "Arun Kumar",         title: "Shopkeeper",        text: "A straightforward app for when you want to review everything before you proceed.",                 rating: 4 },
        { name: "Neha Saxena",        title: "HR Professional",   text: "The design was easy to understand and the process felt organized.",                                rating: 5 },
        { name: "Sandeep Singh",      title: "Courier Worker",    text: "Good for users who want a simple digital application with clear steps.",                           rating: 5 },
        { name: "Isha Verma",         title: "Makeup Artist",     text: "The mobile experience was smooth and easy to navigate.",                                           rating: 5 },
        { name: "Ashok Kumar",        title: "Tailor",            text: "Support responses were quick and the application stayed simple.",                                  rating: 5 },
        { name: "Rhea Nair",          title: "Student",           text: "I liked the calm, easy-to-follow flow from start to finish.",                                      rating: 5 },
        { name: "Vinod Patel",        title: "Daily Wage Worker", text: "A practical microfinance app with a clear interface and straightforward steps.",                   rating: 5 },
        { name: "Swati Iyer",         title: "Consultant",        text: "The secure flow and plain-language terms made it easier to proceed.",                              rating: 5 }
    ];

    // Lazily generate additional testimonials only when needed
    const extraFirstNames = ["Akshay","Bhavna","Chandan","Diya","Esha","Farah","Gaurav","Heena","Ishan","Jiya","Kapil","Leena","Manas","Nisha","Omkar","Pradeep","Rithik","Shreya","Tushar","Varun","Lakshmi","Mohan","Ramesh","Shiva","Sunil","Tamil","Uday","Vishal","Yash","Zahir","Aditya","Bina","Chitra","Dinesh","Ekta","Farhan","Gagan","Hema","Irfan","Jyoti","Kedar"];
    const extraLastNames  = ["Kumar","Sharma","Patel","Singh","Iyer","Menon","Reddy","Desai","Nair","Joshi","Deshmukh","Kapoor","Saxena","Verma","Gupta","Pandey","Rao","Sinha","Bhat","Kulkarni","Deshpande","Pillai","Krishnan","Srivastava","Mishra","Yadav","Murthy","Subramanian","Chatterjee","Malhotra","Chopra","Arora","Das","Dutta","Goel","Hegde","Mathur"];
    const extraTitles     = ["Student","Daily Wage Worker","Employee","Freelancer","Teacher","Nurse","Retail Worker","Driver","Technician","Vendor","Shopkeeper","Service Provider","Support Staff","Tradesperson","Professional"];
    const extraTexts      = [
        "The zero-interest terms were easy to understand.",
        "A practical option when I wanted a simple digital process.",
        "I appreciated being able to review the details before continuing.",
        "The flow felt secure and straightforward throughout.",
        "Support was responsive and the app stayed easy to use.",
        "A calm, transparent microfinance experience from start to finish.",
        "The steps were simple and the interface felt trustworthy.",
        "Clear terms and a clean application flow made this easy.",
        "Straightforward, secure, and easy to understand.",
        "The process felt well organized and not rushed.",
        "A sensible app for users who want clarity before they proceed.",
        "The digital application worked smoothly on my phone.",
        "Helpful support and plain-language terms made a difference.",
        "No confusion â€” just a simple review of the microfinance details.",
        "The repayment information and late fee timing were easy to understand.",
        "A friend recommended it, and the experience matched the description.",
        "I felt comfortable sharing my information because the flow was secure.",
        "Good for emergencies when you want the terms laid out first.",
        "Reliable enough for repeat use when I need a quick review.",
        "The app seemed built for people who want transparency."
    ];

    let extraGenerated = false;
    function ensureExtraTestimonials() {
        if (extraGenerated) return;
        extraGenerated = true;
        // Deterministic pseudo-random using seeded index so results are stable
        for (let i = 0; i < 270; i++) {
            const fi = (i * 7  + 3) % extraFirstNames.length;
            const li = (i * 11 + 5) % extraLastNames.length;
            const ti = (i * 3  + 1) % extraTitles.length;
            const xi = (i * 13 + 7) % extraTexts.length;
            testimonialsData.push({
                name:   `${extraFirstNames[fi]} ${extraLastNames[li]}`,
                title:  extraTitles[ti],
                text:   extraTexts[xi],
                rating: (i % 7 === 0) ? 4 : 5  // ~14% get 4 stars
            });
        }
    }

    const avatarColors  = ['10b981','0ea5e9','8b5cf6','f59e0b','ec4899','06b6d4','6366f1','f97316'];
    const indianCities  = ["Chennai, Tamil Nadu","Mumbai, Maharashtra","Delhi, NCR","Bangalore, Karnataka","Hyderabad, Telangana","Kolkata, West Bengal","Pune, Maharashtra","Ahmedabad, Gujarat","Jaipur, Rajasthan","Kochi, Kerala","Coimbatore, Tamil Nadu","Lucknow, Uttar Pradesh","Surat, Gujarat","Bhopal, Madhya Pradesh","Indore, Madhya Pradesh","Nagpur, Maharashtra","Patna, Bihar","Chandigarh, Punjab","Visakhapatnam, Andhra Pradesh","Madurai, Tamil Nadu"];

    let currentIdx = 0;

    function getPerPage() {
        return window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
    }

    function renderTestimonials() {
        const grid = document.getElementById('testimonials-grid');
        if (!grid) return;

        ensureExtraTestimonials();
        const perPage = getPerPage();
        const frag    = document.createDocumentFragment();

        for (let i = 0; i < perPage && currentIdx + i < testimonialsData.length; i++) {
            const t     = testimonialsData[currentIdx + i];
            const idx   = currentIdx + i;
            const safe  = (s) => String(s).replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]));
            const name  = safe(t.name.replace(/[^a-zA-Z0-9 ]/g,'').trim().substring(0,40));
            const color = avatarColors[idx % avatarColors.length];
            const city  = indianCities[idx % indianCities.length];
            const stars = [...Array(t.rating)].map(() => '<i class="ri-star-fill"></i>').join('') +
                          [...Array(5 - t.rating)].map(() => '<i class="ri-star-line"></i>').join('');

            const card  = document.createElement('div');
            card.className = 'testimonial-card';
            card.style.animation = 'fadeInUp 0.5s ease both';
            card.innerHTML = `
                <div class="testimonial-header">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&bold=true&size=80&font-size=0.4"
                         alt="${name}" class="testimonial-avatar" loading="lazy" decoding="async" width="52" height="52">
                    <div class="testimonial-info">
                        <div class="testimonial-name">${name}</div>
                        <div class="testimonial-title">${safe(t.title)}</div>
                    </div>
                </div>
                <div class="testimonial-rating">${stars}</div>
                <p class="testimonial-text">"${safe(t.text)}"</p>
                <div class="testimonial-location">
                    <i class="ri-map-pin-line"></i>
                    <span>${city}</span>
                </div>`;
            frag.appendChild(card);
        }

        grid.innerHTML = '';
        grid.appendChild(frag);
    }

    function nextTestimonials() {
        const pp = getPerPage();
        currentIdx = (currentIdx + pp >= testimonialsData.length) ? 0 : currentIdx + pp;
        renderTestimonials();
    }
    function prevTestimonials() {
        const pp        = getPerPage();
        const lastStart = Math.floor((testimonialsData.length - 1) / pp) * pp;
        currentIdx = (currentIdx - pp < 0) ? lastStart : currentIdx - pp;
        renderTestimonials();
    }

    // Lazy-init testimonials â€” only render when section scrolls into view
    const testimonialSection = document.getElementById('testimonials');
    if (testimonialSection) {
        const tObs = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                renderTestimonials();
                tObs.disconnect();
            }
        }, { threshold: 0.1 });
        tObs.observe(testimonialSection);
    }

    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    let autoRotate = setInterval(nextTestimonials, 8000);

    function resetAutoRotate() {
        clearInterval(autoRotate);
        autoRotate = setInterval(nextTestimonials, 8000);
    }

    if (nextBtn) nextBtn.addEventListener('click', () => { nextTestimonials(); resetAutoRotate(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prevTestimonials(); resetAutoRotate(); });

    // Pause auto-rotate when tab hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) clearInterval(autoRotate);
        else resetAutoRotate();
    });

    // Re-render on resize only if columns change
    let lastPerPage = getPerPage();
    window.addEventListener('resize', () => {
        const pp = getPerPage();
        if (pp !== lastPerPage) {
            lastPerPage = pp;
            renderTestimonials();
        }
    }, { passive: true });

    // Inject testimonial animation keyframe once
    const style = document.createElement('style');
    style.textContent = '@keyframes fadeInUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}';
    document.head.appendChild(style);


    // â”€â”€ FAQ ACCORDION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    document.querySelectorAll('.faq-item').forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(faq => {
                faq.classList.remove('active');
                faq.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });
            if (!isActive) {
                item.classList.add('active');
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });


    // â”€â”€ AOS (Animate On Scroll) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // AOS.js is loaded with defer alongside this script; initialise after
    // this DOMContentLoaded callback so both scripts are ready.
    window.addEventListener('load', () => {
        if (typeof AOS !== 'undefined') {
            // Initialise AOS on all screen sizes.
            // On mobile use a lighter config (no offset, shorter duration).
            const isMobile = window.innerWidth < 768;
            AOS.init({
                once: true,
                duration: isMobile ? 400 : 700,
                easing: 'ease-out-cubic',
                offset: isMobile ? 0 : 50,
                disable: false
            });
        } else {
            // AOS script failed to load â€” make all [data-aos] elements visible immediately
            document.querySelectorAll('[data-aos]').forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'none';
                el.removeAttribute('data-aos');
            });
        }
    });


    // â”€â”€ PAUSE CONTINUOUS ANIMATIONS WHEN OFF-SCREEN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Sections with heavy looping animations get animation-play-state:paused
    // when they scroll out of the viewport. This is a major mobile FPS win.
    const animatedSections = document.querySelectorAll(
        '.phone-mockup, .app-balance-card, .top-security-banner, .step-connector'
    );

    if ('IntersectionObserver' in window && animatedSections.length) {
        const animPauseObs = new IntersectionObserver(entries => {
            for (const entry of entries) {
                // Pause CSS animations when off-screen, resume when visible
                entry.target.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
                // Also target pseudo-elements via a class
                if (entry.isIntersecting) {
                    entry.target.classList.remove('anim-paused');
                } else {
                    entry.target.classList.add('anim-paused');
                }
            }
        }, { threshold: 0, rootMargin: '100px' });

        animatedSections.forEach(el => animPauseObs.observe(el));
    }

    // â”€â”€ DISABLE PARTICLE CANVAS ON VERY SMALL SCREENS â”€â”€â”€â”€â”€â”€â”€â”€
    // CSS hides the canvas at â‰¤480px; also cancel the rAF loop to save CPU
    if (window.innerWidth <= 480 && typeof rafId !== 'undefined') {
        cancelAnimationFrame(rafId);
    }

});
