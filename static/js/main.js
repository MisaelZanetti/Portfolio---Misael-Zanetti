// Interacciones comunes: navegación desplegable y selección del minijuego.
const menuToggle = document.querySelector("[data-menu-toggle]");
const siteMenu = document.querySelector("[data-site-menu]");

// En la ficha del proyecto, ajusta contraste y color del header al acento elegido.
const projectDetail = document.querySelector("[data-project-detail-color]");
if (projectDetail) {
  const projectColor = projectDetail.dataset.projectDetailColor;
  const hex = projectColor.replace("#", "");
  const channels = /^[\da-f]{6}$/i.test(hex) ? [0, 2, 4].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255) : [1, 1, 1];
  const linear = channels.map((channel) => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
  const luminance = .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
  const darkAccent = luminance < .179;
  document.body.style.setProperty("--project-color", projectColor);
  projectDetail.style.setProperty("--project-ink", darkAccent ? "#f5f5f5" : "#0c0c0c");
  document.body.classList.add(darkAccent ? "project-detail-dark" : "project-detail-light");
}

// Cambia el contraste del header cuando cruza una sección de fondo oscuro.
const darkHeaderSections = document.querySelectorAll(".about-tech, .site-footer");
if (darkHeaderSections.length) {
  let headerCheckQueued = false;
  const updateHeaderContrast = () => {
    headerCheckQueued = false;
    const header = document.querySelector(".site-header");
    const headerLine = header ? header.getBoundingClientRect().height / 2 : 53;
    const overDarkSection = Array.from(darkHeaderSections).some((section) => {
      const bounds = section.getBoundingClientRect();
      return bounds.top <= headerLine && bounds.bottom > headerLine;
    });
    document.body.classList.toggle("header-on-dark", overDarkSection);
  };
  const queueHeaderContrastUpdate = () => {
    if (headerCheckQueued) return;
    headerCheckQueued = true;
    window.requestAnimationFrame(updateHeaderContrast);
  };
  window.addEventListener("scroll", queueHeaderContrastUpdate, { passive: true });
  window.addEventListener("resize", queueHeaderContrastUpdate);
  updateHeaderContrast();
}

if (menuToggle && siteMenu) {
  let closeMenuTimer;
  const setMenuOpen = (open) => {
    window.clearTimeout(closeMenuTimer);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");

    if (open) {
      siteMenu.hidden = false;
      window.requestAnimationFrame(() => {
        document.body.classList.add("menu-open");
        siteMenu.classList.add("is-open");
      });
    } else {
      document.body.classList.remove("menu-open");
      siteMenu.classList.remove("is-open");
      closeMenuTimer = window.setTimeout(() => { siteMenu.hidden = true; }, 730);
    }
  };

  menuToggle.addEventListener("click", () => {
    setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  siteMenu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });
}

const gameDisc = document.querySelector("#game-disc");
const gameOptions = document.querySelectorAll("[data-game-select]");

if (gameDisc && gameOptions.length) {
  const previews = gameDisc.querySelectorAll("[data-preview]");

  gameOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const selectedGame = option.dataset.gameSelect;
      gameDisc.dataset.game = selectedGame;
      gameDisc.classList.remove("is-switching");
      void gameDisc.offsetWidth;
      gameDisc.classList.add("is-switching");

      gameOptions.forEach((item) => {
        const isActive = item === option;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });

      previews.forEach((preview) => {
        const isVisible = preview.dataset.preview === selectedGame;
        preview.hidden = !isVisible;
        preview.setAttribute("aria-hidden", String(!isVisible));
      });
    });
  });
}

// En el footer, algunos caracteres cambian de color y posición con suavidad.
const letterField = document.querySelector("[data-letter-field]");

if (letterField) {
  const alphabet = "Q0V=WCUNGXTP/;MAWNATJV{DWKM#QXXPWAIH>RYUQA#PFRRO};KFG=YRPLKFXG";
  const accentClasses = ["letter-accent", "letter-pink", "letter-green", "letter-purple"];
  letterField.textContent = "";
  const letters = Array.from({ length: 80 }, (_, index) => {
    const letter = document.createElement("span");
    letter.textContent = alphabet[index % alphabet.length];
    letterField.append(letter);
    return letter;
  });

  let accentIndex = 0;
  window.setInterval(() => {
    for (let count = 0; count < 6; count += 1) {
      const letter = letters[Math.floor(Math.random() * letters.length)];
      letter.textContent = alphabet[Math.floor(Math.random() * alphabet.length)];
      letter.className = accentClasses[accentIndex % accentClasses.length];
      accentIndex += 1;
      window.setTimeout(() => letter.classList.remove(...accentClasses), 850);
    }
  }, 950);
}
