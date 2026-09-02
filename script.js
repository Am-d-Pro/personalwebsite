document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // Authentication & Session Management
    // ==========================================================================
    const AUTH_KEY = 'portfolio_user_session';

    const Auth = {
        getUser() {
            try {
                const data = localStorage.getItem(AUTH_KEY);
                return data ? JSON.parse(data) : null;
            } catch (e) {
                return null;
            }
        },
        isLoggedIn() {
            return !!this.getUser();
        },
        login(username, password) {
            if (!username.trim()) {
                return { success: false, message: 'Please enter your username.' };
            }
            if (!password.trim()) {
                return { success: false, message: 'Please enter your password.' };
            }
            const userSession = {
                username: username.trim(),
                loginTime: new Date().toISOString()
            };
            localStorage.setItem(AUTH_KEY, JSON.stringify(userSession));
            return { success: true, user: userSession };
        },
        logout() {
            localStorage.removeItem(AUTH_KEY);
        }
    };

    // --- DOM Elements ---
    const navAuthItem = document.getElementById('nav-auth-item');
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    const authError = document.getElementById('auth-error');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // --- Update Navbar Auth Controls ---
    function updateNavAuth() {
        if (!navAuthItem) return;

        if (Auth.isLoggedIn()) {
            const user = Auth.getUser();
            navAuthItem.innerHTML = `
                <div class="nav-auth-container">
                    <span class="user-badge">
                        <span class="user-badge-icon"></span>
                        ${escapeHtml(user.username)}
                    </span>
                    <button id="logout-btn" class="btn-logout" title="Log out of your session">Logout</button>
                </div>
            `;
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    Auth.logout();
                    updateNavAuth();
                    updateProjectsView();
                });
            }
        } else {
            navAuthItem.innerHTML = `
                <button id="nav-login-btn" class="btn btn-secondary btn-sm">Login</button>
            `;
            const navLoginBtn = document.getElementById('nav-login-btn');
            if (navLoginBtn) {
                navLoginBtn.addEventListener('click', openModal);
            }
        }
    }

    // --- Modal Controls ---
    function openModal() {
        if (!loginModal) return;
        loginModal.classList.add('active');
        if (authError) authError.classList.remove('show');
        const userInput = document.getElementById('auth-username');
        if (userInput) userInput.focus();
    }

    function closeModal() {
        if (!loginModal) return;
        loginModal.classList.remove('active');
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && loginModal && loginModal.classList.contains('active')) {
            closeModal();
        }
    });

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('auth-username');
            const passwordInput = document.getElementById('auth-password');
            const username = usernameInput ? usernameInput.value : '';
            const password = passwordInput ? passwordInput.value : '';

            const result = Auth.login(username, password);
            if (result.success) {
                if (loginForm) loginForm.reset();
                closeModal();
                updateNavAuth();
                updateProjectsView();
            } else {
                if (authError) {
                    authError.textContent = result.message;
                    authError.classList.add('show');
                }
            }
        });
    }

    // --- Projects Page Protection Renderer ---
    function updateProjectsView() {
        const projectsGrid = document.querySelector('.projects-grid');
        const lockedState = document.getElementById('projects-locked-state');
        if (!projectsGrid && !lockedState) return;

        if (Auth.isLoggedIn()) {
            if (projectsGrid) projectsGrid.style.display = 'grid';
            if (lockedState) lockedState.style.display = 'none';
        } else {
            if (projectsGrid) projectsGrid.style.display = 'none';
            if (lockedState) lockedState.style.display = 'flex';

            const lockedLoginBtn = document.getElementById('locked-login-btn');
            if (lockedLoginBtn) {
                lockedLoginBtn.onclick = openModal;
            }
        }
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Initialize Auth UI State
    updateNavAuth();
    updateProjectsView();

    // ==========================================================================
    // Page Interactions & Animations
    // ==========================================================================
    // Reveal animations on scroll
    const revealElements = document.querySelectorAll('.reveal');

    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    };

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver(revealCallback, revealOptions);
    revealElements.forEach(el => revealObserver.observe(el));

    // Mobile menu toggle
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('nav-open');
            if (navLinks.classList.contains('nav-open')) {
                menuBtn.innerHTML = '✕';
            } else {
                menuBtn.innerHTML = '☰';
            }
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('nav-open');
                menuBtn.innerHTML = '☰';
            });
        });
    }

    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(10, 10, 10, 0.9)';
                navbar.style.padding = '0.75rem 0';
            } else {
                navbar.style.background = 'rgba(10, 10, 10, 0.7)';
                navbar.style.padding = '1rem 0';
            }
        });
    }

    // Handle form submission (if any contact form exists)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            btn.innerText = 'Sending...';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerText = 'Sent Successfully!';
                btn.style.background = 'var(--accent-secondary)';
                contactForm.reset();

                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.disabled = false;
                    btn.style.background = '';
                }, 3000);
            }, 1500);
        });
    }
});

