// Memotest: encuentra las parejas entre las marcas de tecnología y juegos.
const memotestGrid = document.querySelector("[data-memotest-grid]");

if (memotestGrid) {
  const pairCounter = document.querySelector("[data-memotest-score]");
  const statusLabel = document.querySelector("[data-memotest-status]");
  const resetButton = document.querySelector("[data-memotest-reset]");

  const brands = [
    { id: "react", name: "React", mark: "⚛", slug: "react", color: "61DAFB" },
    { id: "vscode", name: "VS Code", mark: "</>", slug: "visualstudiocode", color: "007ACC" },
    { id: "sql", name: "SQL", mark: "SQL", color: "CC2927" },
    { id: "python", name: "Python", mark: "Py", slug: "python", color: "3776AB" },
    { id: "javascript", name: "JavaScript", mark: "JS", slug: "javascript", color: "F7DF1E" },
    { id: "angular", name: "Angular", mark: "A", slug: "angular", color: "DD0031" },
    { id: "flet", name: "Flet", mark: "F", color: "7C3AED" },
    { id: "flask", name: "Flask", mark: "Fl", slug: "flask", color: "FFFFFF" },
    { id: "github", name: "GitHub", mark: "GH", slug: "github", color: "181717" },
    { id: "claude", name: "Claude", mark: "✳", slug: "claude", color: "D97757" },
    { id: "steam", name: "Steam", mark: "S", slug: "steam", color: "171A21" },
    { id: "xbox", name: "Xbox", mark: "X", slug: "xbox", color: "107C10" },
    { id: "chatgpt", name: "ChatGPT", mark: "✳", slug: "openai", color: "10A37F" },
    { id: "epicgames", name: "Epic Games", mark: "EPIC", slug: "epicgames", color: "2F2D2E" },
    { id: "godot", name: "Godot", mark: "G", slug: "godotengine", color: "478CBF" },
    { id: "opencode", name: "OpenCode", mark: "OC", slug: "opencode", color: "F04F00" },
    { id: "playstation", name: "PlayStation", mark: "PS", slug: "playstation", color: "003791" },
  ];

  const shuffle = (items) => {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  };

  // Cada ronda usa ocho logos. El punto de inicio avanza para que los 17
  // logos aparezcan a lo largo de varias partidas.
  const brandRotation = shuffle(brands);
  let nextBrandIndex = 0;
  let openCards = [];
  let foundPairs = 0;
  let isChecking = false;
  let mismatchTimer;

  const createCard = (brand, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "memory-card";
    card.dataset.brand = brand.id;
    card.setAttribute("aria-label", `Carta ${index + 1}, oculta`);

    const inner = document.createElement("span");
    inner.className = "memory-card-inner";

    const back = document.createElement("span");
    back.className = "memory-card-face memory-card-back";
    back.setAttribute("aria-hidden", "true");
    back.textContent = "+";

    const front = document.createElement("span");
    front.className = "memory-card-face memory-card-front";
    front.setAttribute("aria-hidden", "true");

    const icon = document.createElement("span");
    icon.className = `memory-brand-icon brand-${brand.id}`;

    const fallback = document.createElement("span");
    fallback.className = "memory-brand-fallback";
    fallback.textContent = brand.mark;
    icon.append(fallback);

    if (brand.slug) {
      const logo = document.createElement("img");
      logo.className = "memory-brand-logo";
      logo.src = `https://cdn.simpleicons.org/${brand.slug}/${brand.color}?viewbox=auto&size=48`;
      logo.alt = "";
      logo.width = 32;
      logo.height = 32;
      logo.loading = "lazy";
      logo.decoding = "async";
      logo.addEventListener("load", () => icon.classList.add("has-logo"), { once: true });
      logo.addEventListener("error", () => logo.remove(), { once: true });
      icon.append(logo);
    }

    const name = document.createElement("span");
    name.className = "memory-brand-name";
    name.textContent = brand.name;
    front.append(icon, name);
    inner.append(back, front);
    card.append(inner);

    card.addEventListener("click", () => revealCard(card));
    return card;
  };

  const updateScore = () => {
    pairCounter.textContent = String(foundPairs);
  };

  const startRound = () => {
    window.clearTimeout(mismatchTimer);
    openCards = [];
    foundPairs = 0;
    isChecking = false;
    updateScore();
    statusLabel.textContent = "Encontrá las 8 parejas.";

    const selectedBrands = Array.from({ length: 8 }, (_, offset) => (
      brandRotation[(nextBrandIndex + offset) % brandRotation.length]
    ));
    nextBrandIndex = (nextBrandIndex + 8) % brandRotation.length;

    const deck = shuffle([...selectedBrands, ...selectedBrands]);
    memotestGrid.replaceChildren(...deck.map(createCard));
  };

  function revealCard(card) {
    if (isChecking || card.classList.contains("is-open") || card.classList.contains("is-found")) {
      return;
    }

    card.classList.add("is-open");
    card.setAttribute("aria-label", `Carta revelada: ${brands.find((brand) => brand.id === card.dataset.brand).name}`);
    openCards.push(card);

    if (openCards.length < 2) return;

    isChecking = true;
    const [firstCard, secondCard] = openCards;

    if (firstCard.dataset.brand === secondCard.dataset.brand) {
      firstCard.classList.add("is-found");
      secondCard.classList.add("is-found");
      firstCard.setAttribute("aria-label", `Pareja encontrada: ${brands.find((brand) => brand.id === firstCard.dataset.brand).name}`);
      secondCard.setAttribute("aria-label", `Pareja encontrada: ${brands.find((brand) => brand.id === secondCard.dataset.brand).name}`);
      foundPairs += 1;
      updateScore();
      openCards = [];
      isChecking = false;

      if (foundPairs === 8) {
        statusLabel.textContent = "¡Muy bien! Encontraste todas las parejas.";
      } else {
        statusLabel.textContent = "¡Coinciden! Seguí buscando.";
      }
      return;
    }

    statusLabel.textContent = "No coinciden. Probá otra vez.";
    mismatchTimer = window.setTimeout(() => {
      [firstCard, secondCard].forEach((openCard) => {
        openCard.classList.remove("is-open");
        openCard.setAttribute("aria-label", "Carta oculta");
      });
      openCards = [];
      isChecking = false;
      statusLabel.textContent = "Encontrá las 8 parejas.";
    }, 850);
  }

  resetButton.addEventListener("click", startRound);
  startRound();
}
