document.addEventListener('DOMContentLoaded', function () {
    // ============================================
    // UTILITY: Safe execution wrapper
    // ============================================
    function safeExecute(fn) {
        try {
            fn();
        } catch (e) {
            console.warn('⚠️ Feature skipped:', e.message);
        }
    }

    // ============================================
    // 1. SCROLL TO TOP BUTTON
    // ============================================
    safeExecute(function () {
        const btn = document.createElement('button');
        btn.id = 'scrollTopBtn';
        btn.innerHTML = '↑';
        btn.style.cssText = `
            position: fixed; bottom: 30px; right: 30px; z-index: 999;
            background: #0d6efd; color: white; border: none; border-radius: 50%;
            width: 50px; height: 50px; font-size: 24px; cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3); opacity: 0;
            visibility: hidden; transition: all 0.3s ease;
        `;
        document.body.appendChild(btn);

        window.addEventListener('scroll', function () {
            if (window.scrollY > 300) {
                btn.style.opacity = '1';
                btn.style.visibility = 'visible';
            } else {
                btn.style.opacity = '0';
                btn.style.visibility = 'hidden';
            }
        });

        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // ============================================
    // 2. ACTIVE NAV LINK HIGHLIGHT
    // ============================================
    safeExecute(function () {
        const current = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.navbar-nav .nav-link, .nav-link, .fot').forEach(function (link) {
            const href = link.getAttribute('href');
            if (href === current) {
                link.classList.add('active');
            }
        });
    });

    // ============================================
    // 3. SCROLL REVEAL ANIMATIONS
    // ============================================
    safeExecute(function () {
        const els = document.querySelectorAll('.section, .card, .gallery-item, .testimonial-card, .stat-box, .dept-item');
        if (!els.length) return;

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.15 });

        els.forEach(function (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(40px)';
            el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
            observer.observe(el);
        });
    });

    // ============================================
    // 4. LIVE NUMBER COUNTERS (Homepage Stats)
    // ============================================
    safeExecute(function () {
        const counters = document.querySelectorAll('.stat-box h3');
        if (!counters.length) return;

        let animated = false;
        const observer = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting && !animated) {
                animated = true;

                counters.forEach(function (counter) {
                    // Extract number from text like "150+" or "10K+"
                    const text = counter.innerText.trim();
                    const raw = text.replace(/[^0-9K]/g, '');
                    let target = parseInt(raw);
                    if (text.includes('K')) target = target * 1000;

                    const duration = 2000;
                    const startTime = performance.now();
                    const startValue = 0;

                    function updateCounter(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const current = Math.floor(eased * target);

                        // Format output
                        let display = current;
                        if (current >= 10000) display = (current / 1000).toFixed(1) + 'K';
                        else if (current >= 1000) display = (current / 1000).toFixed(1) + 'K';
                        counter.innerText = display + '+';

                        if (progress < 1) {
                            requestAnimationFrame(updateCounter);
                        } else {
                            // Final value with original format
                            let finalDisplay = target;
                            if (target >= 10000) finalDisplay = (target / 1000).toFixed(1) + 'K';
                            else if (target >= 1000) finalDisplay = (target / 1000).toFixed(1) + 'K';
                            counter.innerText = finalDisplay + '+';
                        }
                    }
                    requestAnimationFrame(updateCounter);
                });
            }
        }, { threshold: 0.5 });

        counters.forEach(function (c) {
            observer.observe(c.closest('.stat-box') || c.parentElement);
        });
    });

    // ============================================
    // 5. TESTIMONIAL CAROUSEL (Homepage)
    // ============================================
    safeExecute(function () {
        const grid = document.querySelector('.testimonial-grid');
        if (!grid) return;

        const cards = grid.querySelectorAll('.testimonial-card');
        if (cards.length <= 1) return;

        // Hide all except first
        cards.forEach(function (card, index) {
            card.style.display = index === 0 ? 'flex' : 'none';
        });

        let current = 0;
        const total = cards.length;

        // Create dots
        const dotsWrapper = document.createElement('div');
        dotsWrapper.style.cssText = 'text-align: center; margin-top: 20px;';
        cards.forEach(function (_, i) {
            const dot = document.createElement('span');
            dot.style.cssText = `
                display: inline-block; width: 12px; height: 12px; border-radius: 50%;
                background: ${i === 0 ? '#0d6efd' : '#ccc'}; margin: 0 6px; cursor: pointer;
                transition: background 0.3s;
            `;
            dot.dataset.index = i;
            dot.addEventListener('click', function () {
                goTo(parseInt(this.dataset.index));
            });
            dotsWrapper.appendChild(dot);
        });
        grid.parentNode.insertBefore(dotsWrapper, grid.nextSibling);

        function goTo(index) {
            current = index;
            cards.forEach(function (card, i) {
                card.style.display = i === index ? 'flex' : 'none';
            });
            dotsWrapper.querySelectorAll('span').forEach(function (dot, i) {
                dot.style.background = i === index ? '#0d6efd' : '#ccc';
            });
        }

        // Auto-slide
        let interval = setInterval(function () {
            goTo((current + 1) % total);
        }, 5000);

        // Pause on hover
        grid.addEventListener('mouseenter', function () { clearInterval(interval); });
        grid.addEventListener('mouseleave', function () {
            interval = setInterval(function () {
                goTo((current + 1) % total);
            }, 5000);
        });
    });

    // ============================================
    // 6. DOCTOR FILTER SYSTEM
    // ============================================
    safeExecute(function () {
        const btns = document.querySelectorAll('.filter-btn');
        const cards = document.querySelectorAll('.doctor-card');
        if (!btns.length || !cards.length) return;

        btns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                btns.forEach(function (b) { b.classList.remove('active'); });
                this.classList.add('active');

                const filter = this.dataset.filter;
                cards.forEach(function (card) {
                    const category = card.dataset.category;
                    card.style.display = (filter === 'all' || category === filter) ? 'flex' : 'none';
                });
            });
        });
    });

    // ============================================
    // 7. DOCTOR "BOOK" BUTTON
    // ============================================
    safeExecute(function () {
        document.querySelectorAll('.book-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const name = this.dataset.doctorName || 'Doctor';
                sessionStorage.setItem('prefillDoctor', name);
                alert('📋 Booking with Dr. ' + name + '. Redirecting to appointment page...');
                window.location.href = 'appointment.html';
            });
        });
    });

    // ============================================
    // 8. DYNAMIC DOCTOR DROPDOWN (Appointment)
    // ============================================
    safeExecute(function () {
        const deptSelect = document.querySelector('#department');
        const docSelect = document.querySelector('#doctor');
        if (!deptSelect || !docSelect) return;

        const doctorsByDepartment = {
            cardiology: [
                'Dr. Ananya Sharma (Cardiologist)',
                'Dr. Ravi Desai (Interventional Cardiologist)',
                'Dr. Vikram Patel (Cardiac Surgeon)'
            ],
            neurology: [
                'Dr. Rajeev Verma (Neurologist)',
                'Dr. Sneha Reddy (Pediatric Neurologist)'
            ],
            orthopedics: [
                'Dr. Meera Iyer (Orthopedic Surgeon)',
                'Dr. Arjun Singh (Joint Replacement Surgeon)'
            ],
            ent: [
                'Dr. Sunil Kumar (ENT Specialist)',
                'Dr. Kavita Nair (Otolaryngologist)'
            ],
            dental: [
                'Dr. Priya Malhotra (Dentist)'
            ],
            general: [
                'Dr. Sanjay Gupta (General Physician)',
                'Dr. Pooja Mehta (Endocrinologist)'
            ]
        };

        deptSelect.addEventListener('change', function () {
            const dept = this.value;
            docSelect.innerHTML = '<option value="">Any Available</option>';
            if (dept && doctorsByDepartment[dept]) {
                doctorsByDepartment[dept].forEach(function (doc) {
                    const opt = document.createElement('option');
                    opt.value = doc;
                    opt.textContent = doc;
                    docSelect.appendChild(opt);
                });
            }
        });

        // Trigger on load if department is pre-selected
        if (deptSelect.value) {
            deptSelect.dispatchEvent(new Event('change'));
        }
    });

    // ============================================
    // 9. APPOINTMENT FORM VALIDATION
    // ============================================
    safeExecute(function () {
        const form = document.querySelector('#appointmentForm');
        if (!form) return;

        // Block past dates
        const dateInput = form.querySelector('#date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.setAttribute('min', today);
        }

        // Prefill doctor from sessionStorage
        const docField = form.querySelector('#doctor');
        if (docField && sessionStorage.getItem('prefillDoctor')) {
            docField.value = sessionStorage.getItem('prefillDoctor');
            sessionStorage.removeItem('prefillDoctor');
        }

        // Form validation on submit
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = form.querySelector('#name');
            const email = form.querySelector('#email');
            const phone = form.querySelector('#phone');
            const date = form.querySelector('#date');
            const dept = form.querySelector('#department');

            let isValid = true;

            // Reset borders
            [name, email, phone, date, dept].forEach(function (field) {
                if (field) field.style.borderColor = '#ced4da';
            });

            // Validate Name
            if (name && name.value.trim().length < 2) {
                name.style.borderColor = 'red';
                isValid = false;
                alert('⚠️ Please enter your full name.');
            }

            // Validate Phone
            if (phone && !/^[0-9]{10}$/.test(phone.value.trim())) {
                phone.style.borderColor = 'red';
                isValid = false;
                alert('⚠️ Please enter a valid 10-digit phone number.');
            }

            // Validate Email
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
                email.style.borderColor = 'red';
                isValid = false;
                alert('⚠️ Please enter a valid email address.');
            }

            // Validate Date
            if (date && !date.value) {
                date.style.borderColor = 'red';
                isValid = false;
                alert('⚠️ Please select an appointment date.');
            }

            // Validate Department
            if (dept && !dept.value) {
                dept.style.borderColor = 'red';
                isValid = false;
                alert('⚠️ Please select a department.');
            }

            if (isValid) {
                alert('✅ Appointment details are valid! (Firebase save coming soon)');
                form.reset();
                // Reset doctor dropdown
                const doc = form.querySelector('#doctor');
                if (doc) doc.innerHTML = '<option value="">Any Available</option>';
            }
        });
    });

    // ============================================
    // 10. PASSWORD TOGGLE (Login & Register)
    // ============================================
    safeExecute(function () {
        document.querySelectorAll('.toggle-password').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const targetId = this.dataset.target;
                const input = document.getElementById(targetId);
                if (!input) return;

                const icon = this.querySelector('i');
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
    });

    // ============================================
    // 11. LOGIN FORM SUBMISSION
    // ============================================
    safeExecute(function () {
        const form = document.getElementById('loginForm');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = document.getElementById('loginEmail');
            const password = document.getElementById('loginPassword');

            if (!email || !password) return;

            if (email.value.trim() === '' || password.value.trim() === '') {
                alert('⚠️ Please fill in both email and password.');
                return;
            }

            alert('✅ Login successful! (Firebase integration coming soon)');
            // window.location.href = 'dashboard.html';
        });
    });

    // ============================================
    // 12. REGISTER FORM SUBMISSION
    // ============================================
    safeExecute(function () {
        const form = document.getElementById('registerForm');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('registerName');
            const email = document.getElementById('registerEmail');
            const phone = document.getElementById('registerPhone');
            const password = document.getElementById('registerPassword');
            const confirm = document.getElementById('registerConfirmPassword');
            const terms = form.querySelector('input[type="checkbox"]');

            // Basic validation
            if (name && name.value.trim().length < 2) {
                alert('⚠️ Please enter your full name.');
                return;
            }

            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
                alert('⚠️ Please enter a valid email address.');
                return;
            }

            if (phone && !/^[0-9]{10}$/.test(phone.value.trim())) {
                alert('⚠️ Please enter a valid 10-digit phone number.');
                return;
            }

            if (password && password.value.length < 8) {
                alert('⚠️ Password must be at least 8 characters long.');
                return;
            }

            if (password && confirm && password.value !== confirm.value) {
                alert('⚠️ Passwords do not match.');
                return;
            }

            if (terms && !terms.checked) {
                alert('⚠️ Please agree to the Terms of Service and Privacy Policy.');
                return;
            }

            alert('✅ Registration successful! Please login to continue.');
            // window.location.href = 'login.html';
        });
    });

    // ============================================
    // 13. WORKING HOURS (Contact Page)
    // ============================================
    safeExecute(function () {
        const el = document.getElementById('openStatus');
        if (!el) return;

        const now = new Date();
        const day = now.getDay();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const current = hours + minutes / 60;

        let open = false;
        // Mon-Sat (1-6), 9:00 AM to 6:00 PM
        if (day >= 1 && day <= 6) {
            if (current >= 9 && current < 18) {
                open = true;
            }
        }

        el.innerHTML = open
            ? '✅ <span style="color:green;font-weight:bold;">Open Now</span> (9:00 AM – 6:00 PM)'
            : '❌ <span style="color:red;font-weight:bold;">Closed</span> (Mon–Sat, 9:00 AM – 6:00 PM)';
    });

    // ============================================
    // 14. DASHBOARD: TAB SWITCHER + GREETING
    // ============================================
    safeExecute(function () {
        const tabs = document.querySelectorAll('.dashboard-tab');
        const panels = document.querySelectorAll('.dashboard-panel');
        if (!tabs.length || !panels.length) return;

        // Dynamic Greeting
        const greetEl = document.getElementById('greeting');
        if (greetEl) {
            const hr = new Date().getHours();
            let greet = 'Good Evening';
            if (hr < 12) greet = 'Good Morning';
            else if (hr < 17) greet = 'Good Afternoon';
            greetEl.innerText = greet + ', Admin! 👋';
        }

        // Tab switching
        tabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                tabs.forEach(function (t) { t.classList.remove('active'); });
                this.classList.add('active');

                const target = this.dataset.tab;
                panels.forEach(function (panel) {
                    panel.style.display = panel.id === target ? 'block' : 'none';
                });
            });
        });

        // Show first panel by default
        if (panels.length > 0) {
            panels.forEach(function (p, i) {
                p.style.display = i === 0 ? 'block' : 'none';
            });
        }
    });

    // ============================================
    // LOG: Script loaded successfully
    // ============================================
    console.log('✅ Dehradun Hospital JS – All features loaded successfully!');
});