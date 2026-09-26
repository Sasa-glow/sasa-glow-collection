"use strict";

/*
 * SASA Glow Collection
 * Main frontend interactions
 *
 * Security notes:
 * - No eval() or Function() usage.
 * - No untrusted HTML is injected into the page.
 * - User-controlled values are handled as text.
 * - localStorage access is protected with try/catch.
 * - Product prices are for frontend display only.
 *   Real checkout prices MUST be verified server-side.
 */

document.addEventListener("DOMContentLoaded", () => {
    try {
        initializeSasaGlow();
    } catch (error) {
        // Fail gracefully instead of breaking the entire page.
        console.error("SASA Glow initialization error:", error);
    }
});


/* =========================================================
   MAIN INITIALIZER
========================================================= */

function initializeSasaGlow() {
    initializeMobileMenu();
    initializeSmoothNavigation();
    initializeRevealAnimations();
    initializeProductButtons();
    initializeNewsletter();
    initializeHeaderScroll();
    initializeBackToTop();
    initializeFooterYear();
    initializeGlowCursor();
    initializeParallax();
}


/* =========================================================
   MOBILE MENU
========================================================= */

function initializeMobileMenu() {
    const menuButton = document.querySelector(".menu-toggle");
    const navigation = document.querySelector(".main-nav");

    if (!menuButton || !navigation) {
        return;
    }

    menuButton.setAttribute("aria-expanded", "false");

    menuButton.addEventListener("click", () => {
        const isOpen = navigation.classList.toggle("is-open");

        menuButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        menuButton.classList.toggle("is-active", isOpen);

        document.body.classList.toggle(
            "menu-open",
            isOpen
        );
    });

    const navigationLinks = navigation.querySelectorAll("a");

    navigationLinks.forEach((link) => {
        link.addEventListener("click", () => {
            navigation.classList.remove("is-open");
            menuButton.classList.remove("is-active");
            menuButton.setAttribute("aria-expanded", "false");
            document.body.classList.remove("menu-open");
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            navigation.classList.remove("is-open");
            menuButton.classList.remove("is-active");
            menuButton.setAttribute("aria-expanded", "false");
            document.body.classList.remove("menu-open");
        }
    });
}


/* =========================================================
   SMOOTH NAVIGATION
========================================================= */

function initializeSmoothNavigation() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") {
                return;
            }

            const target = document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();

            target.scrollIntoView({
                behavior: getScrollBehavior(),
                block: "start"
            });

            // Keep URL hash useful without forcing a page reload.
            try {
                history.pushState(null, "", targetId);
            } catch (error) {
                // History API may be unavailable in some environments.
            }
        });
    });
}


/* =========================================================
   SCROLL REVEAL ANIMATIONS
========================================================= */

function initializeRevealAnimations() {
    const revealElements = document.querySelectorAll(
        ".product-card, .story-content, .story-visual, " +
        ".ritual-card, .quote-section, .newsletter-section"
    );

    if (!revealElements.length) {
        return;
    }

    // Respect accessibility preferences.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        revealElements.forEach((element) => {
            element.classList.add("is-visible");
        });

        return;
    }

    revealElements.forEach((element) => {
        element.classList.add("reveal-on-scroll");
    });

    if (!("IntersectionObserver" in window)) {
        revealElements.forEach((element) => {
            element.classList.add("is-visible");
        });

        return;
    }

    const observer = new IntersectionObserver(
        (entries, observerInstance) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("is-visible");
                observerInstance.unobserve(entry.target);
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -40px 0px"
        }
    );

    revealElements.forEach((element) => {
        observer.observe(element);
    });
}


/* =========================================================
   PRODUCT INTERACTIONS
========================================================= */

function initializeProductButtons() {
    const buttons = document.querySelectorAll(".add-to-cart");

    if (!buttons.length) {
        return;
    }

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            const productName = sanitizeText(
                button.dataset.product || "Glow Product"
            );

            const rawPrice = Number(button.dataset.price);

            /*
             * Frontend prices are not trusted for actual payments.
             * They are only used for the visual/demo cart experience.
             */
            const price = Number.isFinite(rawPrice)
                ? rawPrice
                : 0;

            addProductToCart({
                name: productName,
                price
            });

            showToast(
                `${productName} added to your glow bag ✨`
            );

            animateProductButton(button);
        });
    });
}


/* =========================================================
   CART
========================================================= */

const CART_STORAGE_KEY = "sasa_glow_cart";

function getCart() {
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);

        if (!savedCart) {
            return [];
        }

        const parsedCart = JSON.parse(savedCart);

        if (!Array.isArray(parsedCart)) {
            return [];
        }

        return parsedCart.filter((item) => {
            return (
                item &&
                typeof item.name === "string" &&
                Number.isFinite(Number(item.price)) &&
                Number.isFinite(Number(item.quantity))
            );
        });
    } catch (error) {
        console.warn("Unable to read cart:", error);
        return [];
    }
}


function saveCart(cart) {
    try {
        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(cart)
        );
    } catch (error) {
        console.warn("Unable to save cart:", error);
    }
}


function addProductToCart(product) {
    const cart = getCart();

    const existingProduct = cart.find(
        (item) => item.name === product.name
    );

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    saveCart(cart);

    updateCartCount();
}


function getCartCount() {
    const cart = getCart();

    return cart.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
    );
}


function updateCartCount() {
    const count = getCartCount();

    const cartCounter = document.querySelector(
        "[data-cart-count]"
    );

    if (cartCounter) {
        cartCounter.textContent = String(count);
        cartCounter.setAttribute(
            "aria-label",
            `${count} items in cart`
        );
    }
}


/* =========================================================
   PRODUCT BUTTON ANIMATION
========================================================= */

function animateProductButton(button) {
    if (!button) {
        return;
    }

    const originalText =
        button.dataset.originalText ||
        button.textContent.trim();

    button.dataset.originalText = originalText;

    button.classList.add("added");

    button.textContent = "Added ✦";

    window.setTimeout(() => {
        button.classList.remove("added");
        button.textContent = originalText;
    }, 1300);
}


/* =========================================================
   NEWSLETTER
========================================================= */

function initializeNewsletter() {
    const form = document.querySelector("#newsletter-form");

    if (!form) {
        return;
    }

    const emailInput = form.querySelector(
        'input[type="email"]'
    );

    const message = document.querySelector(
        "#form-message"
    );

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!emailInput) {
            return;
        }

        const email = emailInput.value.trim();

        if (!email) {
            showFormMessage(
                message,
                "Please enter your email address.",
                "error"
            );

            emailInput.focus();
            return;
        }

        if (!emailInput.checkValidity()) {
            showFormMessage(
                message,
                "Please enter a valid email address.",
                "error"
            );

            emailInput.focus();
            return;
        }

        /*
         * This frontend version does not send personal data
         * anywhere. Connect this form to your trusted backend
         * or email provider later.
         */
        showFormMessage(
            message,
            "You're on the glow list ✨ Welcome to SASA Glow.",
            "success"
        );

        showToast("Welcome to the SASA Glow family ✨");

        form.reset();
    });
}


function showFormMessage(element, text, type) {
    if (!element) {
        return;
    }

    element.textContent = text;

    element.classList.remove(
        "success",
        "error"
    );

    if (type === "success") {
        element.classList.add("success");
    }

    if (type === "error") {
        element.classList.add("error");
    }
}


/* =========================================================
   TOAST NOTIFICATION
========================================================= */

let toastTimer = null;

function showToast(message) {
    const toast = document.querySelector("#toast");

    if (!toast) {
        return;
    }

    window.clearTimeout(toastTimer);

    toast.textContent = sanitizeText(message);
    toast.classList.add("show");

    toastTimer = window.setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}


/* =========================================================
   HEADER SCROLL EFFECT
========================================================= */

function initializeHeaderScroll() {
    const header = document.querySelector(".site-header");

    if (!header) {
        return;
    }

    const updateHeader = () => {
        if (window.scrollY > 30) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    };

    updateHeader();

    window.addEventListener(
        "scroll",
        updateHeader,
        {
            passive: true
        }
    );
}


/* =========================================================
   BACK TO TOP BUTTON
========================================================= */

function initializeBackToTop() {
    let button = document.querySelector(
        "[data-back-to-top]"
    );

    /*
     * Create the button only if it does not already exist.
     */
    if (!button) {
        button = document.createElement("button");

        button.type = "button";
        button.className = "back-to-top";
        button.setAttribute(
            "data-back-to-top",
            ""
        );
        button.setAttribute(
            "aria-label",
            "Back to top"
        );
        button.textContent = "↑";

        document.body.appendChild(button);
    }

    const updateButton = () => {
        button.classList.toggle(
            "visible",
            window.scrollY > 600
        );
    };

    updateButton();

    window.addEventListener(
        "scroll",
        updateButton,
        {
            passive: true
        }
    );

    button.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: getScrollBehavior()
        });
    });
}


/* =========================================================
   FOOTER YEAR
========================================================= */

function initializeFooterYear() {
    const yearElements = document.querySelectorAll(
        "[data-current-year]"
    );

    if (!yearElements.length) {
        return;
    }

    const year = new Date().getFullYear();

    yearElements.forEach((element) => {
        element.textContent = String(year);
    });
}


/* =========================================================
   SOFT GLOW CURSOR
========================================================= */

function initializeGlowCursor() {
    /*
     * Disable cursor effect on touch devices.
     */
    if (
        window.matchMedia("(hover: none)").matches ||
        window.matchMedia("(pointer: coarse)").matches
    ) {
        return;
    }

    if (
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
    ) {
        return;
    }

    const glow = document.createElement("div");

    glow.className = "cursor-glow";
    glow.setAttribute("aria-hidden", "true");

    document.body.appendChild(glow);

    let mouseX = -100;
    let mouseY = -100;
    let currentX = -100;
    let currentY = -100;

    document.addEventListener(
        "pointermove",
        (event) => {
            mouseX = event.clientX;
            mouseY = event.clientY;
        },
        {
            passive: true
        }
    );

    const animate = () => {
        currentX += (mouseX - currentX) * 0.12;
        currentY += (mouseY - currentY) * 0.12;

        glow.style.transform =
            `translate3d(${currentX}px, ${currentY}px, 0)`;

        window.requestAnimationFrame(animate);
    };

    window.requestAnimationFrame(animate);
}


/* =========================================================
   SUBTLE PARALLAX
========================================================= */

function initializeParallax() {
    if (
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
    ) {
        return;
    }

    const heroVisual = document.querySelector(
        ".hero-visual"
    );

    if (!heroVisual) {
        return;
    }

    let ticking = false;

    window.addEventListener(
        "scroll",
        () => {
            if (ticking) {
                return;
            }

            ticking = true;

            window.requestAnimationFrame(() => {
                const scrollPosition = window.scrollY;

                if (scrollPosition < window.innerHeight) {
                    const movement =
                        Math.min(
                            scrollPosition * 0.08,
                            35
                        );

                    heroVisual.style.transform =
                        `translate3d(0, ${movement}px, 0)`;
                }

                ticking = false;
            });
        },
        {
            passive: true
        }
    );
}


/* =========================================================
   ACCESSIBILITY HELPERS
========================================================= */

function getScrollBehavior() {
    if (
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
    ) {
        return "auto";
    }

    return "smooth";
}


/* =========================================================
   TEXT SANITIZATION
========================================================= */

function sanitizeText(value) {
    if (typeof value !== "string") {
        return "";
    }

    return value
        .replace(/[<>]/g, "")
        .trim()
        .slice(0, 200);
}