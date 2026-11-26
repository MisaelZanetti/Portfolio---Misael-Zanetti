// Snake con selección previa de colores y velocidad.
const snakePreview = document.querySelector('[data-preview="snake"]');

if (snakePreview) {
  const palettes = {
    snake: [
      { name: "Verde", value: "#7ee081" }, { name: "Celeste", value: "#56d6e8" },
      { name: "Azul", value: "#5278ff" }, { name: "Violeta", value: "#b47aff" },
      { name: "Naranja", value: "#ff9b54" }, { name: "Rosa", value: "#ff6fae" },
    ],
    fruit: [
      { name: "Rojo", value: "#ff5f65" }, { name: "Amarillo", value: "#ffd45c" },
      { name: "Rosa", value: "#ff6fae" }, { name: "Azul", value: "#5278ff" },
      { name: "Lima", value: "#b9e45b" }, { name: "Naranja", value: "#ff9b54" },
    ],
  };
  const speeds = { slow: 190, normal: 125, fast: 75 };
  const settings = { snake: palettes.snake[0].value, fruit: palettes.fruit[0].value, speed: "slow" };
  const setup = snakePreview.querySelector("[data-snake-setup]");
  const play = snakePreview.querySelector("[data-snake-play]");
  const canvas = snakePreview.querySelector("[data-snake-board]");
  const context = canvas?.getContext("2d");
  const scoreOutput = snakePreview.querySelector("[data-snake-score]");
  const status = snakePreview.querySelector("[data-snake-status]");
  const columns = 20;
  const rows = 12;
  let snake = [];
  let food = { x: 18, y: 8 };
  let direction = { x: 1, y: 0 };
  let nextDirection = direction;
  let score = 0;
  let timer = null;
  let running = false;
  let pixelRatio = 1;

  Object.entries(palettes).forEach(([type, colors]) => {
    const container = snakePreview.querySelector(`[data-snake-color="${type}"]`);
    colors.forEach((color, index) => {
      const swatch = document.createElement("button");
      swatch.type = "button";
      swatch.className = "snake-swatch";
      swatch.style.setProperty("--swatch-color", color.value);
      swatch.setAttribute("aria-label", color.name);
      swatch.setAttribute("aria-pressed", String(index === 0));
      if (index === 0) swatch.classList.add("is-selected");
      swatch.addEventListener("click", () => {
        settings[type] = color.value;
        container.querySelectorAll(".snake-swatch").forEach((item) => {
          const selected = item === swatch;
          item.classList.toggle("is-selected", selected);
          item.setAttribute("aria-pressed", String(selected));
        });
        if (running) draw();
      });
      container.append(swatch);
    });
  });

  snakePreview.querySelectorAll("[data-snake-speed]").forEach((button) => {
    button.addEventListener("click", () => {
      settings.speed = button.dataset.snakeSpeed;
      snakePreview.querySelectorAll("[data-snake-speed]").forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });
      if (running) startLoop();
    });
  });

  function placeFood() {
    const openCells = [];
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < columns; x += 1) {
        if (!snake.some((part) => part.x === x && part.y === y)) openCells.push({ x, y });
      }
    }
    food = openCells[Math.floor(Math.random() * openCells.length)] || food;
  }

  function resizeBoard() {
    if (!canvas || !context) return;
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(bounds.width * pixelRatio);
    canvas.height = Math.round(bounds.height * pixelRatio);
    draw();
  }

  function draw() {
    if (!context || !canvas?.clientWidth || !canvas.clientHeight) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);
    const cellWidth = width / columns;
    const cellHeight = height / rows;
    context.strokeStyle = "rgb(255 255 255 / 7%)";
    context.lineWidth = 1;
    for (let x = 1; x < columns; x += 1) {
      context.beginPath(); context.moveTo(x * cellWidth, 0); context.lineTo(x * cellWidth, height); context.stroke();
    }
    for (let y = 1; y < rows; y += 1) {
      context.beginPath(); context.moveTo(0, y * cellHeight); context.lineTo(width, y * cellHeight); context.stroke();
    }
    const inset = Math.max(2, Math.min(cellWidth, cellHeight) * .13);
    context.fillStyle = settings.fruit;
    context.beginPath();
    context.arc((food.x + .5) * cellWidth, (food.y + .5) * cellHeight, Math.min(cellWidth, cellHeight) * .34, 0, Math.PI * 2);
    context.fill();
    snake.forEach((part, index) => {
      context.fillStyle = settings.snake;
      const radius = Math.min(cellWidth, cellHeight) * (index === 0 ? .28 : .18);
      context.beginPath();
      context.roundRect(part.x * cellWidth + inset, part.y * cellHeight + inset, cellWidth - inset * 2, cellHeight - inset * 2, radius);
      context.fill();
    });
  }

  function finishGame(message) {
    running = false;
    window.clearInterval(timer);
    timer = null;
    status.textContent = message;
    draw();
  }

  function step() {
    direction = nextDirection;
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    const eating = head.x === food.x && head.y === food.y;
    if (head.x < 0 || head.x >= columns || head.y < 0 || head.y >= rows || snake.slice(0, eating ? undefined : -1).some((part) => part.x === head.x && part.y === head.y)) {
      finishGame(`Fin de la partida · ${score} ${score === 1 ? "punto" : "puntos"}. Tocá Reiniciar para volver a jugar.`);
      return;
    }
    snake.unshift(head);
    if (eating) {
      score += 1;
      scoreOutput.textContent = String(score);
      placeFood();
      status.textContent = "¡Bien! Seguí con las flechas o WASD.";
    } else snake.pop();
    draw();
  }

  function startLoop() {
    window.clearInterval(timer);
    timer = window.setInterval(step, speeds[settings.speed]);
  }

  function startGame() {
    setup.hidden = true;
    play.hidden = false;
    snake = [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }];
    direction = { x: 1, y: 0 };
    nextDirection = direction;
    score = 0;
    scoreOutput.textContent = "0";
    status.textContent = "Usá las flechas o WASD para moverte.";
    placeFood();
    running = true;
    resizeBoard();
    startLoop();
  }

  const directionKeys = {
    ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }, D: { x: 1, y: 0 },
  };
  document.addEventListener("keydown", (event) => {
    const next = directionKeys[event.key];
    if (!running || !next) return;
    event.preventDefault();
    if (next.x !== -direction.x || next.y !== -direction.y) nextDirection = next;
  });

  snakePreview.querySelector("[data-snake-start]").addEventListener("click", startGame);
  snakePreview.querySelector("[data-snake-restart]").addEventListener("click", startGame);
  if (window.ResizeObserver && canvas) new ResizeObserver(resizeBoard).observe(canvas);
  window.addEventListener("resize", resizeBoard);
}
