// Wordle con las mismas empresas que aparecen en Memotest.
const wordleGame = document.querySelector("[data-wordle-game]");

if (wordleGame) {
  const brands = [
    { name: "React", word: "REACT" }, { name: "VS Code", word: "VSCODE" },
    { name: "SQL", word: "SQL" }, { name: "Python", word: "PYTHON" },
    { name: "JavaScript", word: "JAVASCRIPT" }, { name: "Angular", word: "ANGULAR" },
    { name: "Flet", word: "FLET" }, { name: "Flask", word: "FLASK" },
    { name: "GitHub", word: "GITHUB" }, { name: "Claude", word: "CLAUDE" },
    { name: "Steam", word: "STEAM" }, { name: "Xbox", word: "XBOX" },
    { name: "ChatGPT", word: "CHATGPT" }, { name: "Epic Games", word: "EPICGAMES" },
    { name: "Godot", word: "GODOT" }, { name: "OpenCode", word: "OPENCODE" },
    { name: "PlayStation", word: "PLAYSTATION" },
    { name: "Pixel", word: "PIXEL" }, { name: "Código", word: "CODIGO" },
    { name: "Teclado", word: "TECLADO" }, { name: "Sistema", word: "SISTEMA" },
    { name: "Internet", word: "INTERNET" }, { name: "Servidor", word: "SERVIDOR" },
    { name: "Algoritmo", word: "ALGORITMO" }, { name: "Consola", word: "CONSOLA" },
    { name: "Memoria", word: "MEMORIA" }, { name: "Proyecto", word: "PROYECTO" },
    { name: "Videojuego", word: "VIDEOJUEGO" },
  ];
  const board = wordleGame.querySelector("[data-wordle-board]");
  const form = wordleGame.querySelector("[data-wordle-form]");
  const input = wordleGame.querySelector("[data-wordle-input]");
  const status = wordleGame.querySelector("[data-wordle-status]");
  const count = wordleGame.querySelector("[data-wordle-count]");
  let answer = "";
  let attempt = 0;
  let finished = false;

  const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f\s]/g, "").toUpperCase();

  function startRound() {
    const available = brands.filter((brand) => brand.word !== answer);
    answer = available[Math.floor(Math.random() * available.length)].word;
    attempt = 0;
    finished = false;
    count.textContent = "0 / 6";
    status.textContent = "Escribí una palabra que tenga la cantidad de letras indicada.";
    input.value = "";
    input.maxLength = 11;
    input.disabled = false;
    form.querySelector("[data-wordle-submit]").disabled = false;
    board.replaceChildren();
    board.style.setProperty("--word-length", answer.length);
    for (let row = 0; row < 6; row += 1) {
      const rowElement = document.createElement("div");
      rowElement.className = "wordle-row";
      rowElement.setAttribute("role", "row");
      for (let column = 0; column < answer.length; column += 1) {
        const tile = document.createElement("span");
        tile.className = "wordle-tile";
        tile.setAttribute("role", "gridcell");
        rowElement.append(tile);
      }
      board.append(rowElement);
    }
  }

  function evaluateGuess(guess) {
    const result = Array(guess.length).fill("absent");
    const remaining = {};
    for (let index = 0; index < answer.length; index += 1) {
      if (guess[index] === answer[index]) result[index] = "correct";
      else remaining[answer[index]] = (remaining[answer[index]] || 0) + 1;
    }
    for (let index = 0; index < answer.length; index += 1) {
      if (result[index] === "correct") continue;
      if (remaining[guess[index]] > 0) {
        result[index] = "present";
        remaining[guess[index]] -= 1;
      }
    }
    return result;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (finished) return;
    const guess = normalize(input.value);
    if (guess.length !== answer.length) {
      status.textContent = `La palabra tiene ${answer.length} letras. Tu intento tiene ${guess.length}.`;
      input.focus();
      return;
    }

    const row = board.children[attempt];
    const marks = evaluateGuess(guess);
    Array.from(row.children).forEach((tile, index) => {
      tile.textContent = guess[index];
      tile.classList.add(marks[index], "is-filled");
    });
    attempt += 1;
    count.textContent = `${attempt} / 6`;
    input.value = "";

    if (guess === answer) {
      finished = true;
      const answerName = brands.find((item) => item.word === answer).name;
      status.textContent = `¡Lo encontraste! Era ${answerName}.`;
    } else if (attempt === 6) {
      finished = true;
      const answerName = brands.find((item) => item.word === answer).name;
      status.textContent = `Se terminaron los intentos. La respuesta era ${answerName}.`;
    } else {
      status.textContent = `${6 - attempt} ${6 - attempt === 1 ? "intento" : "intentos"} restantes.`;
    }
    if (finished) {
      input.disabled = true;
      form.querySelector("[data-wordle-submit]").disabled = true;
    } else input.focus();
  });

  wordleGame.querySelector("[data-wordle-reset]").addEventListener("click", startRound);
  startRound();
}
