document.addEventListener("DOMContentLoaded", function () {
    var navbar = document.querySelector(".navbar-default");
    var navToggle = document.querySelector(".navbar-toggle");
    var navMenu = document.getElementById("bs-navbar");

    function closeNavigation() {
        if (!navToggle || !navMenu) return;
        navMenu.classList.remove("in");
        navToggle.setAttribute("aria-expanded", "false");
    }

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", function () {
            var willOpen = !navMenu.classList.contains("in");
            navMenu.classList.toggle("in", willOpen);
            navToggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
        });

        navMenu.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", closeNavigation);
        });
    }

    if (navbar) {
        function updateNavbar() {
            navbar.classList.toggle("navbar-shrink", window.scrollY > 50);
        }
        updateNavbar();
        window.addEventListener("scroll", updateNavbar, { passive: true });
    }

    document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var currentIndex = 0;
        var timer = null;
        var interval = parseInt(carousel.getAttribute("data-interval"), 10) || 6000;
        var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        var heroBackground = carousel.closest(".hero-background");

        if (slides.length < 2) {
            return;
        }

        function showSlide(index) {
            currentIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                var isActive = slideIndex === currentIndex;
                slide.classList.toggle("is-active", isActive);
                slide.setAttribute("aria-hidden", isActive ? "false" : "true");
            });

            if (heroBackground) {
                heroBackground.classList.toggle(
                    "is-project-scene",
                    slides[currentIndex].classList.contains("hero-carousel-slide--project-scene")
                );
            }

            dots.forEach(function (dot, dotIndex) {
                var isActive = dotIndex === currentIndex;
                dot.classList.toggle("is-active", isActive);
                dot.setAttribute("aria-pressed", isActive ? "true" : "false");
            });
        }

        function stopAutoplay() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        function startAutoplay() {
            stopAutoplay();
            if (!reduceMotion && !document.hidden) {
                timer = window.setInterval(function () {
                    showSlide(currentIndex + 1);
                }, interval);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(parseInt(dot.getAttribute("data-hero-dot"), 10));
                startAutoplay();
            });
        });

        carousel.addEventListener("mouseenter", stopAutoplay);
        carousel.addEventListener("mouseleave", startAutoplay);
        carousel.addEventListener("focusin", stopAutoplay);
        carousel.addEventListener("focusout", function (event) {
            if (!carousel.contains(event.relatedTarget)) {
                startAutoplay();
            }
        });

        document.addEventListener("visibilitychange", function () {
            if (document.hidden) {
                stopAutoplay();
            } else {
                startAutoplay();
            }
        });

        startAutoplay();
    });

});
