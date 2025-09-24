// Shared JavaScript for navigation and mobile menu functionality

// Enhanced mobile menu functionality
class MobileMenu {
    constructor() {
        this.menuToggle = document.querySelector('.mobile-menu-toggle');
        this.nav = document.querySelector('.main-nav');
        this.navList = document.querySelector('.nav-list');
        this.isOpen = false;

        this.init();
    }

    init() {
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu();
            });
        }

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.nav.contains(e.target) && !this.menuToggle.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Close menu when pressing Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });

        // Close menu when window is resized to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isOpen) {
                this.closeMenu();
            }
        });

        // Handle dropdown menus in mobile
        this.initDropdowns();
    }

    initDropdowns() {
        const dropdownItems = document.querySelectorAll('.nav-item.dropdown');
        dropdownItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            if (link) {
                link.addEventListener('click', (e) => {
                    if (window.innerWidth <= 768) {
                        e.preventDefault();
                        this.toggleDropdown(item);
                    }
                });
            }
        });
    }

    toggleDropdown(dropdownItem) {
        const isCurrentlyOpen = dropdownItem.classList.contains('mobile-open');

        // Close all other dropdowns
        document.querySelectorAll('.nav-item.dropdown').forEach(item => {
            item.classList.remove('mobile-open');
        });

        // Toggle current dropdown
        if (!isCurrentlyOpen) {
            dropdownItem.classList.add('mobile-open');
        }
    }

    toggleMenu() {
        this.isOpen ? this.closeMenu() : this.openMenu();
    }

    openMenu() {
        this.navList.classList.add('mobile-open');
        this.menuToggle.classList.add('active');
        this.isOpen = true;

        // Prevent body scroll when menu is open
        document.body.style.overflow = 'hidden';
    }

    closeMenu() {
        this.navList.classList.remove('mobile-open');
        this.menuToggle.classList.remove('active');
        this.isOpen = false;

        // Close all dropdowns
        document.querySelectorAll('.nav-item.dropdown').forEach(item => {
            item.classList.remove('mobile-open');
        });

        // Restore body scroll
        document.body.style.overflow = '';
    }
}

// Set active navigation based on current page
function setActiveNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Dropdown functionality
function initDropdowns() {
    const dropdownItems = document.querySelectorAll('.nav-item.dropdown');

    dropdownItems.forEach(item => {
        const dropdownMenu = item.querySelector('.dropdown-menu');
        const navLink = item.querySelector('.nav-link');

        // Desktop hover functionality
        item.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768) {
                dropdownMenu.style.opacity = '1';
                dropdownMenu.style.visibility = 'visible';
                dropdownMenu.style.transform = 'translateY(0)';
            }
        });

        item.addEventListener('mouseleave', () => {
            if (window.innerWidth > 768) {
                dropdownMenu.style.opacity = '0';
                dropdownMenu.style.visibility = 'hidden';
                dropdownMenu.style.transform = 'translateY(-10px)';
            }
        });

        // Mobile click functionality
        navLink.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                item.classList.toggle('mobile-open');
            }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-item.dropdown')) {
            dropdownItems.forEach(item => {
                item.classList.remove('mobile-open');
            });
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            dropdownItems.forEach(item => {
                item.classList.remove('mobile-open');
            });
        }
    });
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Enhanced shared content loading with error handling
async function loadSharedContent() {
    try {
        // Load shared header
        const headerResponse = await fetch('shared-header.html');
        if (headerResponse.ok) {
            const headerHtml = await headerResponse.text();
            const headerElement = document.getElementById('shared-header');
            if (headerElement) {
                headerElement.innerHTML = headerHtml;
                console.log('✅ Shared header loaded successfully');
            }
        } else {
            console.warn('⚠️ Failed to load shared header:', headerResponse.status);
        }

        // Load shared footer
        const footerResponse = await fetch('shared-footer.html');
        if (footerResponse.ok) {
            const footerHtml = await footerResponse.text();
            const footerElement = document.getElementById('shared-footer');
            if (footerElement) {
                footerElement.innerHTML = footerHtml;
                console.log('✅ Shared footer loaded successfully');
            }
        } else {
            console.warn('⚠️ Failed to load shared footer:', footerResponse.status);
        }
    } catch (error) {
        console.error('❌ Error loading shared content:', error);
    }
}

// Legacy function for backward compatibility
async function loadShared(id, file) {
    try {
        const response = await fetch(file);
        if (response.ok) {
            const html = await response.text();
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = html;
                console.log(`✅ ${file} loaded successfully`);
                return true;
            }
        }
        console.warn(`⚠️ Failed to load ${file}`);
        return false;
    } catch (error) {
        console.error(`❌ Error loading ${file}:`, error);
        return false;
    }
}

// Legacy function for backward compatibility
async function loadFragment(id, file) {
    return await loadShared(id, file);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load shared content if elements exist
    if (document.getElementById('shared-header') || document.getElementById('shared-footer')) {
        loadSharedContent();
    }

    // Initialize navigation and mobile menu after a short delay to ensure header is loaded
    setTimeout(() => {
        setActiveNavigation();
        initDropdowns();
        initSmoothScrolling();
        new MobileMenu();
    }, 100);
});
