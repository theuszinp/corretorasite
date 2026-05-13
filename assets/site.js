(function () {
  const phone = "5571984324307";
  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");

  function updateHeader() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  if (menuToggle && header && nav) {
    menuToggle.addEventListener("click", () => {
      const open = header.classList.toggle("menu-open");
      menuToggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", event => {
      const dropdownTrigger = event.target.closest(".has-dropdown > .nav-link");
      if (dropdownTrigger && window.matchMedia("(max-width: 760px)").matches) {
        event.preventDefault();
        const item = dropdownTrigger.closest(".has-dropdown");
        item.classList.toggle("is-open");
        nav.querySelectorAll(".has-dropdown").forEach(other => {
          if (other !== item) other.classList.remove("is-open");
        });
        return;
      }

      if (event.target.closest("a")) {
        header.classList.remove("menu-open");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  const observer = "IntersectionObserver" in window
    ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.12 })
    : null;

  document.querySelectorAll(".reveal").forEach(element => {
    if (observer) observer.observe(element);
    else element.classList.add("is-visible");
  });

  document.querySelectorAll("[data-count]").forEach(counter => {
    const target = Number(counter.dataset.count || 0);
    const suffix = counter.dataset.suffix || "";
    let started = false;
    const run = () => {
      if (started) return;
      started = true;
      const duration = 1100;
      const start = performance.now();
      const decimals = String(target).includes(".") ? 1 : 0;
      function frame(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = (target * eased).toFixed(decimals).replace(".0", "") + suffix;
        if (progress < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    };
    if ("IntersectionObserver" in window) {
      const countObserver = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          run();
          countObserver.disconnect();
        }
      });
      countObserver.observe(counter);
    } else {
      run();
    }
  });

  document.querySelectorAll("[data-logo-carousel]").forEach(carousel => {
    const tracks = Array.from(carousel.querySelectorAll("[data-logo-track]"));
    if (!tracks.length) return;

    const lanes = tracks.map((track, index) => {
      const originalItems = Array.from(track.children);
      originalItems.forEach(item => {
        const clone = item.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
      });

      return {
        track,
        direction: track.dataset.direction === "right" ? 1 : -1,
        offset: index % 2 ? -140 : 0,
        startOffset: 0,
        halfWidth: 0
      };
    });

    let speed = 0.42;
    let isDragging = false;
    let startX = 0;

    function measure() {
      lanes.forEach(lane => {
        lane.halfWidth = lane.track.scrollWidth / 2;
      });
    }

    function normalize(lane) {
      if (!lane.halfWidth) return;
      while (lane.offset <= -lane.halfWidth) lane.offset += lane.halfWidth;
      while (lane.offset > 0) lane.offset -= lane.halfWidth;
    }

    function paint() {
      lanes.forEach(lane => {
        lane.track.style.transform = `translate3d(${lane.offset}px, 0, 0)`;
      });
    }

    function animate() {
      if (!isDragging) {
        lanes.forEach(lane => {
          lane.offset += speed * lane.direction;
          normalize(lane);
        });
        paint();
      }
      requestAnimationFrame(animate);
    }

    carousel.addEventListener("pointerdown", event => {
      isDragging = true;
      startX = event.clientX;
      lanes.forEach(lane => {
        lane.startOffset = lane.offset;
      });
      carousel.classList.add("is-dragging");
      carousel.setPointerCapture(event.pointerId);
    });

    carousel.addEventListener("pointermove", event => {
      if (!isDragging) return;
      const delta = event.clientX - startX;
      lanes.forEach(lane => {
        lane.offset = lane.startOffset + delta;
        normalize(lane);
      });
      paint();
    });

    function stopDrag(event) {
      if (!isDragging) return;
      isDragging = false;
      carousel.classList.remove("is-dragging");
      if (event && carousel.hasPointerCapture(event.pointerId)) {
        carousel.releasePointerCapture(event.pointerId);
      }
    }

    carousel.addEventListener("pointerup", stopDrag);
    carousel.addEventListener("pointercancel", stopDrag);
    carousel.addEventListener("pointerleave", stopDrag);
    carousel.addEventListener("mouseenter", () => { speed = 0.18; });
    carousel.addEventListener("mouseleave", () => { speed = 0.42; });
    window.addEventListener("resize", measure);

    measure();
    paint();
    requestAnimationFrame(animate);
  });

  document.querySelectorAll("[data-quote-form]").forEach(form => {
    const status = form.querySelector("[data-form-status]");
    const phoneInput = form.querySelector("[name='phone']");

    if (phoneInput) {
      phoneInput.addEventListener("input", () => {
        let value = phoneInput.value.replace(/\D/g, "").slice(0, 11);
        if (value.length > 10) value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
        else if (value.length > 6) value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
        else if (value.length > 2) value = value.replace(/^(\d{2})(\d+)$/, "($1) $2");
        else if (value.length > 0) value = "(" + value;
        phoneInput.value = value;
      });
    }

    form.addEventListener("submit", event => {
      event.preventDefault();
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const contact = String(data.get("phone") || "").trim();
      const insurance = String(data.get("insurance") || "").trim();

      if (name.length < 3 || contact.replace(/\D/g, "").length < 10 || !insurance) {
        if (status) status.textContent = "Preencha nome, WhatsApp e tipo de seguro para continuar.";
        return;
      }

      const text = `Olá! Meu nome é ${name}. Quero uma cotação de ${insurance}. Meu WhatsApp é ${contact}.`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
      if (status) status.textContent = "Abrindo WhatsApp com sua solicitação...";
    });
  });
})();
