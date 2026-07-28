/*!
 * Start Bootstrap - Agency Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

$(document).ready(function() {
    // jQuery for page scrolling feature - requires jQuery Easing plugin
    $('a.page-scroll[href^="#"]').bind('click', function(event) {
        var $anchor = $(this);
        var $target = $($anchor.attr('href'));
        if (!$target.length) {
            return;
        }
        $('html, body').stop().animate({
            scrollTop: $target.offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });

    // Highlight the top nav as scrolling occurs
    $('body').scrollspy({
        target: '.navbar-fixed-top'
    });

    // Closes the Responsive Menu on Menu Item Click
    $('.navbar-collapse ul li a').click(function() {
        $('.navbar-toggle:visible').click();
    });

    // Handle the modal hash in URL when a modal is opened
    $('div.modal').on('show.bs.modal', function() {
        var modal = this;
        var hash = modal.id;
        window.location.hash = hash;
        window.onhashchange = function() {
            if (!location.hash) {
                $(modal).modal('hide');
            }
        };
    });

    // Clear the URL hash when the modal is closed
    $('div.modal').on('hidden.bs.modal', function() {
        history.pushState("", document.title, window.location.pathname + window.location.search);
        console.log('Modal closed and hash cleared');

        // Move focus to a different element to prevent aria-hidden issues
        setTimeout(function() {
            $('.navbar-brand').focus();  // Assuming moving focus to the navbar brand link
        }, 500);
    });
});

document.addEventListener("DOMContentLoaded", function () {
    [".vision-box", ".company-info-box"].forEach(function (selector) {
        let el = document.querySelector(selector);
        if (el) {
            new IntersectionObserver(
                function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("appear");
                        }
                    });
                },
                { threshold: 0.5 }
            ).observe(el);
        }
    });

    document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var currentIndex = 0;
        var timer = null;
        var interval = parseInt(carousel.getAttribute("data-interval"), 10) || 6000;
        var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

    document.querySelectorAll(".home-process-timeline").forEach(function (timeline) {
        var items = Array.prototype.slice.call(timeline.querySelectorAll("[data-process-item]"));
        var supportsHover = window.matchMedia("(hover: hover)").matches;

        function setOpen(item, shouldOpen) {
            var button = item.querySelector(".home-process-step");
            var popover = item.querySelector(".home-process-popover");
            item.classList.toggle("is-open", shouldOpen);
            button.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
            popover.hidden = !shouldOpen;
        }

        function closeOthers(currentItem) {
            items.forEach(function (item) {
                if (item !== currentItem) {
                    item.removeAttribute("data-process-locked");
                    setOpen(item, false);
                }
            });
        }

        items.forEach(function (item) {
            var button = item.querySelector(".home-process-step");

            if (supportsHover) {
                item.addEventListener("mouseenter", function () {
                    closeOthers(item);
                    setOpen(item, true);
                });
                item.addEventListener("mouseleave", function () {
                    if (!item.hasAttribute("data-process-locked")) {
                        setOpen(item, false);
                    }
                });
            }

            button.addEventListener("focus", function () {
                closeOthers(item);
                setOpen(item, true);
            });

            button.addEventListener("click", function (event) {
                event.stopPropagation();
                var willLock = !item.hasAttribute("data-process-locked");
                closeOthers(item);
                if (willLock) {
                    item.setAttribute("data-process-locked", "");
                    setOpen(item, true);
                } else {
                    item.removeAttribute("data-process-locked");
                    setOpen(item, false);
                }
            });
        });

        document.addEventListener("click", function (event) {
            if (!timeline.contains(event.target)) {
                items.forEach(function (item) {
                    item.removeAttribute("data-process-locked");
                    setOpen(item, false);
                });
            }
        });

        timeline.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                items.forEach(function (item) {
                    item.removeAttribute("data-process-locked");
                    setOpen(item, false);
                });
            }
        });
    });
});
