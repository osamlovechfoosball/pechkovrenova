document.documentElement.classList.add("js");

const navToggle = document.querySelector("[data-nav-toggle]");
const siteNav = document.querySelector("[data-site-nav]");
const navLinks = document.querySelectorAll("[data-site-nav] a");
const siteHeader = document.querySelector("[data-header]");
const contactForm = document.querySelector("[data-contact-form]");
const formNote = document.querySelector("[data-form-note]");
const contactFormToggle = document.querySelector("[data-contact-toggle]");
const contactFormPanel = document.querySelector("[data-contact-panel]");
const heroSection = document.querySelector(".hero");
const rotatingHeadline = document.querySelector("[data-rotating-headline]");
const galleries = document.querySelectorAll("[data-gallery]");
const editableSelector = "input, textarea, select, [contenteditable='true']";
const revealTargets = document.querySelectorAll(
  ".section-heading, .service-card, .audience-card, .gallery-shell, .process-intro, .process-list li, .proof-grid article, .about-layout > *, .contact-copy, .contact-form"
);

// Enhance services only at mobile widths; the original cards remain the
// desktop and no-JavaScript presentation.
function setupMobileServices() {
  const mobile = window.matchMedia("(max-width: 860px)");
  const cards = Array.from(document.querySelectorAll(".service-card"));

  function syncServices() {
    cards.forEach((card, index) => {
      const heading = card.querySelector("h3");
      const description = card.querySelector("p");
      if (!heading || !description) return;

      let button = heading.querySelector(".service-toggle");
      if (mobile.matches && !button) {
        button = document.createElement("button");
        button.type = "button";
        button.className = "service-toggle";
        button.textContent = heading.textContent;
        description.id ||= `service-description-${index + 1}`;
        button.setAttribute("aria-controls", description.id);
        button.setAttribute("aria-expanded", "false");
        description.hidden = true;
        button.addEventListener("click", () => {
          const expanded = button.getAttribute("aria-expanded") !== "true";
          button.setAttribute("aria-expanded", String(expanded));
          description.hidden = !expanded;
        });
        heading.replaceChildren(button);
        card.classList.add("service-disclosure");
      } else if (!mobile.matches && button) {
        heading.textContent = button.textContent;
        description.hidden = false;
        card.classList.remove("service-disclosure");
      }
    });
  }

  mobile.addEventListener("change", syncServices);
  syncServices();
}

setupMobileServices();

function closeNavigation() {
  document.body.classList.remove("nav-open");
  siteNav?.classList.remove("is-open");
  navToggle?.setAttribute("aria-expanded", "false");
}

navToggle?.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";

  document.body.classList.toggle("nav-open", !isOpen);
  siteNav?.classList.toggle("is-open", !isOpen);
  navToggle.setAttribute("aria-expanded", String(!isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeNavigation);
});

function setupActiveNavigation() {
  if (!siteNav) {
    return;
  }

  const sectionLinks = Array.from(siteNav.querySelectorAll("a[href^='#']"))
    .filter((link) => !link.closest(".language-switch"))
    .map((link) => {
      const sectionId = link.getAttribute("href")?.slice(1);
      const section = sectionId ? document.getElementById(sectionId) : null;

      return section ? { link, section } : null;
    })
    .filter(Boolean);

  if (!sectionLinks.length) {
    return;
  }

  let activeLink;
  let frameRequested = false;

  function setActiveLink(link) {
    if (activeLink === link) {
      return;
    }

    sectionLinks.forEach((item) => {
      const isActive = item.link === link;
      item.link.classList.toggle("is-active", isActive);

      if (isActive) {
        item.link.setAttribute("aria-current", "location");
      } else {
        item.link.removeAttribute("aria-current");
      }
    });

    activeLink = link;
  }

  function updateActiveLink() {
    const headerOffset = (siteHeader?.offsetHeight ?? 0) + Math.min(window.innerHeight * 0.22, 180);
    const pagePosition = window.scrollY + headerOffset;
    const isAtPageEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    let currentItem = sectionLinks[0];

    sectionLinks.forEach((item) => {
      if (item.section.offsetTop <= pagePosition) {
        currentItem = item;
      }
    });

    if (isAtPageEnd) {
      currentItem = sectionLinks[sectionLinks.length - 1];
    }

    setActiveLink(currentItem.link);
    frameRequested = false;
  }

  function requestActiveLinkUpdate() {
    if (frameRequested) {
      return;
    }

    frameRequested = true;
    requestAnimationFrame(updateActiveLink);
  }

  window.addEventListener("scroll", requestActiveLinkUpdate, { passive: true });
  window.addEventListener("resize", requestActiveLinkUpdate);
  window.addEventListener("load", requestActiveLinkUpdate);
  requestActiveLinkUpdate();
}

setupActiveNavigation();

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNavigation();
  }
});

function clearCollapsedPageCaret(target) {
  const targetElement = target instanceof Element ? target : null;

  if (targetElement?.closest(editableSelector)) {
    return;
  }

  requestAnimationFrame(() => {
    const selection = window.getSelection();

    if (selection?.isCollapsed) {
      selection.removeAllRanges();
    }
  });
}

document.addEventListener("mouseup", (event) => {
  clearCollapsedPageCaret(event.target);
});

function updateStickyContact() {
  const threshold = heroSection
    ? heroSection.offsetTop + heroSection.offsetHeight * 0.72
    : 320;

  document.body.classList.toggle("show-sticky-contact", window.scrollY > threshold);
}

window.addEventListener("scroll", updateStickyContact, { passive: true });
window.addEventListener("resize", updateStickyContact);
updateStickyContact();

function setupRotatingHeadline() {
  if (!rotatingHeadline) {
    return;
  }

  const slides = Array.from(rotatingHeadline.querySelectorAll(".hero-title-slide"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeIndex = window.matchMedia("(max-width: 860px)").matches && slides.length > 1 ? 1 : 0;
  let rotationTimer;

  slides.forEach((slide, index) => {
    slide.classList.toggle("is-active", index === activeIndex);
  });

  if (slides.length < 2 || reduceMotion.matches) {
    return;
  }

  function stopRotation() {
    window.clearInterval(rotationTimer);
    rotationTimer = undefined;
  }

  function startRotation() {
    stopRotation();

    if (document.hidden || reduceMotion.matches) {
      return;
    }

    rotationTimer = window.setInterval(() => {
      slides[activeIndex].classList.remove("is-active");
      activeIndex = (activeIndex + 1) % slides.length;
      slides[activeIndex].classList.add("is-active");
    }, 10000);
  }

  document.addEventListener("visibilitychange", startRotation);
  reduceMotion.addEventListener?.("change", startRotation);
  startRotation();
}

setupRotatingHeadline();

function setupGalleries() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  galleries.forEach((gallery) => {
    const track = gallery.querySelector("[data-gallery-track]");
    const previousButton = gallery.querySelector("[data-gallery-prev]");
    const nextButton = gallery.querySelector("[data-gallery-next]");
    const originalSlides = Array.from(track?.querySelectorAll(".gallery-slide") ?? []);
    const firstSlide = originalSlides[0];

    if (!track || !previousButton || !nextButton || !firstSlide) {
      return;
    }

    const makeClone = (slide) => {
      const clone = slide.cloneNode(true);
      clone.dataset.galleryClone = "true";
      clone.setAttribute("aria-hidden", "true");
      clone.tabIndex = -1;
      clone.removeAttribute("id");
      return clone;
    };

    track.prepend(...originalSlides.map(makeClone));
    track.append(...originalSlides.map(makeClone));

    function getScrollStep() {
      const trackStyles = window.getComputedStyle(track);
      const gap = Number.parseFloat(trackStyles.columnGap || trackStyles.gap) || 0;

      return firstSlide.getBoundingClientRect().width + gap;
    }

    function updateGalleryControls() {
      previousButton.disabled = false;
      nextButton.disabled = false;
    }

    function getLoopSpan() {
      return getScrollStep() * originalSlides.length;
    }

    function keepGalleryLooping() {
      const loopSpan = getLoopSpan();
      const maximumScroll = Math.max(0, track.scrollWidth - track.clientWidth);

      if (loopSpan <= 0 || maximumScroll <= 0) {
        return;
      }

      if (track.scrollLeft <= 2) {
        track.scrollLeft += loopSpan;
      } else if (track.scrollLeft >= maximumScroll - 2) {
        track.scrollLeft -= loopSpan;
      }
    }

    function moveGallery(direction) {
      track.scrollBy({
        left: direction * getScrollStep(),
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }

    previousButton.addEventListener("click", () => moveGallery(-1));
    nextButton.addEventListener("click", () => moveGallery(1));
    track.addEventListener("scroll", () => {
      updateGalleryControls();
      requestAnimationFrame(keepGalleryLooping);
    }, { passive: true });
    track.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveGallery(-1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        moveGallery(1);
      }
    });
    window.addEventListener("resize", () => {
      track.scrollLeft = getLoopSpan();
      updateGalleryControls();
    });
    requestAnimationFrame(() => {
      track.scrollLeft = getLoopSpan();
      updateGalleryControls();
    });
  });
}

setupGalleries();

function setupGalleryLightbox() {
  const slides = Array.from(document.querySelectorAll(".gallery-slide:not([data-gallery-clone])"));

  if (slides.length === 0) {
    return;
  }

  const isEnglish = document.documentElement.lang === "en";
  const lightbox = document.createElement("div");
  lightbox.className = "gallery-lightbox";
  lightbox.hidden = true;
  lightbox.innerHTML = `
    <div class="gallery-lightbox-dialog" role="dialog" aria-modal="true" aria-label="${isEnglish ? "Photo viewer" : "Преглед на снимки"}">
      <div class="gallery-lightbox-toolbar">
        <div class="gallery-lightbox-controls">
          <button class="gallery-lightbox-button" type="button" data-lightbox-zoom-out aria-label="${isEnglish ? "Zoom out" : "Намали"}">−</button>
          <button class="gallery-lightbox-button" type="button" data-lightbox-zoom-in aria-label="${isEnglish ? "Zoom in" : "Увеличи"}">+</button>
          <button class="gallery-lightbox-button gallery-lightbox-close" type="button" data-lightbox-close aria-label="${isEnglish ? "Close photo viewer" : "Затвори снимката"}">×</button>
        </div>
      </div>
      <div class="gallery-lightbox-viewport">
        <div class="gallery-lightbox-track" data-lightbox-track tabindex="0"></div>
      </div>
    </div>
  `;
  document.body.append(lightbox);

  const track = lightbox.querySelector("[data-lightbox-track]");
  const zoomOutButton = lightbox.querySelector("[data-lightbox-zoom-out]");
  const zoomInButton = lightbox.querySelector("[data-lightbox-zoom-in]");
  const closeButton = lightbox.querySelector("[data-lightbox-close]");
  const lightboxImages = [];
  let activeIndex = 0;
  let scale = 1;
  let returnFocus;
  let scrollFrame;

  slides.forEach((slide, index) => {
    const sourceImage = slide.querySelector("img");

    if (!sourceImage) {
      return;
    }

    const modalSlide = document.createElement("figure");
    const modalImage = document.createElement("img");
    modalSlide.className = "gallery-lightbox-slide";
    modalImage.src = sourceImage.currentSrc || sourceImage.src;
    modalImage.alt = sourceImage.alt;
    modalImage.draggable = false;
    modalSlide.append(modalImage);
    track.append(modalSlide);
    lightboxImages.push(modalImage);

    slide.tabIndex = 0;
    slide.setAttribute("role", "button");
    slide.setAttribute(
      "aria-label",
      `${isEnglish ? "Open photo" : "Отвори снимка"}: ${sourceImage.alt}`
    );

    const openSelectedPhoto = () => openLightbox(index, slide);
    slide.addEventListener("click", openSelectedPhoto);
    slide.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openSelectedPhoto();
      }
    });
  });

  const firstModalSlide = track.firstElementChild;
  const lastModalSlide = track.lastElementChild;

  if (!firstModalSlide || !lastModalSlide) {
    return;
  }

  const createLightboxClone = (slide) => {
    const clone = slide.cloneNode(true);
    clone.dataset.galleryLightboxClone = "true";
    clone.setAttribute("aria-hidden", "true");
    return clone;
  };

  track.prepend(createLightboxClone(lastModalSlide));
  track.append(createLightboxClone(firstModalSlide));

  function setScale(nextScale) {
    scale = Math.min(3, Math.max(1, nextScale));
    lightboxImages[activeIndex].style.transform = `scale(${scale})`;
    zoomOutButton.disabled = scale <= 1;
    zoomInButton.disabled = scale >= 3;
  }

  function goToPhoto(index, behavior = "smooth", direction = 0) {
    const photoCount = lightboxImages.length;
    const nextIndex = ((index % photoCount) + photoCount) % photoCount;
    let physicalIndex = nextIndex + 1;

    if (direction > 0 && activeIndex === photoCount - 1 && nextIndex === 0) {
      physicalIndex = photoCount + 1;
    } else if (direction < 0 && activeIndex === 0 && nextIndex === photoCount - 1) {
      physicalIndex = 0;
    }

    track.scrollTo({ left: physicalIndex * track.clientWidth, behavior });
  }

  function syncActivePhoto() {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => {
      const photoCount = lightboxImages.length;
      const slideWidth = Math.max(1, track.clientWidth);
      const physicalIndex = Math.round(track.scrollLeft / slideWidth);
      let nextIndex = physicalIndex - 1;
      let loopTarget;

      if (physicalIndex <= 0) {
        nextIndex = photoCount - 1;
        loopTarget = photoCount * slideWidth;
      } else if (physicalIndex >= photoCount + 1) {
        nextIndex = 0;
        loopTarget = slideWidth;
      }

      if (nextIndex !== activeIndex) {
        lightboxImages[activeIndex].style.transform = "scale(1)";
        activeIndex = nextIndex;
        setScale(1);
      }

      if (loopTarget !== undefined) {
        track.scrollTo({ left: loopTarget, behavior: "auto" });
      }
    });
  }

  function openLightbox(index, trigger) {
    returnFocus = trigger;
    activeIndex = index;
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    lightboxImages.forEach((image) => {
      image.style.transform = "scale(1)";
    });
    setScale(1);

    requestAnimationFrame(() => {
      goToPhoto(activeIndex, "auto");
      closeButton.focus();
    });
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.classList.remove("lightbox-open");
    returnFocus?.focus();
  }

  zoomOutButton.addEventListener("click", () => setScale(scale - 0.25));
  zoomInButton.addEventListener("click", () => setScale(scale + 0.25));
  closeButton.addEventListener("click", closeLightbox);
  track.addEventListener("scroll", syncActivePhoto, { passive: true });
  track.addEventListener("wheel", (event) => {
    const horizontalDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.shiftKey
        ? event.deltaY
        : 0;

    if (horizontalDelta === 0) {
      return;
    }

    event.preventDefault();
    goToPhoto(activeIndex + Math.sign(horizontalDelta), "smooth", Math.sign(horizontalDelta));
  }, { passive: false });

  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLightbox();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPhoto(activeIndex - 1, "smooth", -1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToPhoto(activeIndex + 1, "smooth", 1);
    }
  });

  window.addEventListener("resize", () => {
    if (!lightbox.hidden) {
      goToPhoto(activeIndex, "auto");
    }
  });
}

setupGalleryLightbox();

function setupScrollReveal() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  revealTargets.forEach((target, index) => {
    target.classList.add("reveal-on-scroll");
    target.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 55}ms`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px 10% 0px",
    }
  );

  revealTargets.forEach((target) => observer.observe(target));
}

setupScrollReveal();

function setupContactFormDisclosure() {
  if (!contactFormToggle || !contactFormPanel) {
    return;
  }

  const mobileForm = window.matchMedia("(max-width: 560px)");

  const setExpanded = (expanded) => {
    const shouldExpand = mobileForm.matches ? expanded : true;
    contactFormToggle.setAttribute("aria-expanded", String(shouldExpand));
    contactFormPanel.hidden = !shouldExpand;
  };

  contactFormToggle.addEventListener("click", () => {
    setExpanded(contactFormToggle.getAttribute("aria-expanded") !== "true");
  });

  const syncWithViewport = () => setExpanded(false);
  mobileForm.addEventListener?.("change", syncWithViewport);
  setExpanded(false);
}

setupContactFormDisclosure();

contactForm?.addEventListener("focusin", () => {
  document.body.classList.add("form-active");
});

contactForm?.addEventListener("focusout", () => {
  requestAnimationFrame(() => {
    if (!contactForm.contains(document.activeElement)) {
      document.body.classList.remove("form-active");
    }
  });
});

function buildContactMessage(form, isEnglish) {
  const formData = new FormData(form);
  const files = Array.from(form.querySelector('input[type="file"]')?.files ?? []);
  const value = (name) => String(formData.get(name) ?? "").trim();
  const description = value("message") || (isEnglish ? "Not provided" : "Не е посочено");
  const photoSummary = files.length
    ? (isEnglish ? `${files.length} selected photo(s)` : `${files.length} избрани снимки`)
    : (isEnglish ? "No photos" : "Няма снимки");

  const lines = isEnglish
    ? [
        "New request from the Pechkov Renova website",
        "",
        `Name: ${value("name")}`,
        `Phone: ${value("phone")}`,
        `City / neighborhood: ${value("location")}`,
        `Site type: ${value("object-type")}`,
        `Description: ${description}`,
        `Photos: ${photoSummary}`,
      ]
    : [
        "Ново запитване от сайта на Печков Ренова",
        "",
        `Име: ${value("name")}`,
        `Телефон: ${value("phone")}`,
        `Град / квартал: ${value("location")}`,
        `Тип обект: ${value("object-type")}`,
        `Описание: ${description}`,
        `Снимки: ${photoSummary}`,
      ];

  return { files, text: lines.join("\n") };
}

function updateFormNote(message, state) {
  if (!formNote) {
    return;
  }

  formNote.textContent = message;
  formNote.classList.toggle("is-success", state === "success");
  formNote.classList.toggle("is-error", state === "error");
}

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const isEnglish = document.documentElement.lang === "en";
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const recipient = contactForm.dataset.recipient || "359885000544";
  const request = buildContactMessage(contactForm, isEnglish);
  const shareData = {
    title: isEnglish ? "Pechkov Renova request" : "Запитване до Печков Ренова",
    text: request.text,
  };
  let canShareFiles = false;

  if (request.files.length > 0 && typeof navigator.canShare === "function") {
    try {
      canShareFiles = navigator.canShare({ files: request.files });
    } catch {
      canShareFiles = false;
    }
  }

  if (canShareFiles) {
    shareData.files = request.files;
  }

  submitButton?.setAttribute("disabled", "");
  updateFormNote(
    isEnglish ? "Preparing your message..." : "Подготвяме съобщението...",
    "pending"
  );

  try {
    if (typeof navigator.share === "function" && canShareFiles) {
      try {
        await navigator.share(shareData);
        updateFormNote(
          isEnglish
            ? "The request and photos were shared. Send them in the selected Viber or WhatsApp conversation."
            : "Заявката и снимките са споделени. Изпратете ги в избрания Viber или WhatsApp разговор.",
          "success"
        );
        return;
      } catch (error) {
        if (error?.name === "AbortError") {
          updateFormNote(
            isEnglish ? "Sharing was cancelled. Your form details are still here." : "Споделянето беше отказано. Данните във формата са запазени.",
            "pending"
          );
          return;
        }
      }
    }

    const whatsappUrl = `https://wa.me/${recipient}?text=${encodeURIComponent(request.text)}`;
    const whatsappLink = document.createElement("a");
    whatsappLink.href = whatsappUrl;
    whatsappLink.target = "_blank";
    whatsappLink.rel = "noopener noreferrer";
    whatsappLink.click();

    updateFormNote(
      request.files.length
        ? (isEnglish
            ? "WhatsApp opened with your details. This browser cannot transfer photos automatically, so attach the selected photos in the chat."
            : "WhatsApp се отвори с попълнените данни. Този браузър не може да прехвърли снимките автоматично, затова ги добавете в чата.")
        : (isEnglish
            ? "WhatsApp opened with your completed request."
            : "WhatsApp се отвори с попълнената заявка."),
      "success"
    );
  } catch {
    updateFormNote(
      isEnglish
        ? "The message could not be opened. Please use the Viber or WhatsApp buttons next to the phone number."
        : "Съобщението не можа да се отвори. Използвайте бутоните Viber или WhatsApp до телефонния номер.",
      "error"
    );
  } finally {
    submitButton?.removeAttribute("disabled");
  }
});
