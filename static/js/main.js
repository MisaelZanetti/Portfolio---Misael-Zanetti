// Interacciones comunes: navegación desplegable y selección del minijuego.
const menuToggle = document.querySelector("[data-menu-toggle]");
const siteMenu = document.querySelector("[data-site-menu]");

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
