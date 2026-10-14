const digitalInputs =
  document.querySelector("#digitalInputs");

const truthTable =
  document.querySelector("#truthTable");

const switches = [];

// Crear las ocho entradas digitales

for (let i = 0; i < 8; i++) {

  const label = document.createElement("label");
  label.className = "input-switch";

  const input = document.createElement("input");
  input.type = "checkbox";
  input.setAttribute("aria-label", `Entrada D${i}`);

  const span = document.createElement("span");
  span.textContent = `D${i}`;

  label.append(input, span);
  digitalInputs.append(label);

  switches.push(input);

  input.addEventListener("change", updateDigital);

  // Crear tabla de verdad

  const code = i.toString(2).padStart(3, "0");

  const row = document.createElement("tr");
  row.id = `digital-row-${i}`;

  [`D${i}`, ...code].forEach(cell => {

    const td = document.createElement("td");
    td.textContent = cell;

    row.append(td);

  });

  truthTable.append(row);
}

// Actualizar codificador digital

function updateDigital() {

  const active = switches.flatMap((input, i) =>
    input.checked ? [i] : []
  );

  const selected = active.length
    ? Math.max(...active)
    : null;

  const binaryOutput =
    document.querySelector("#binaryOutput");

  const digitalMessage =
    document.querySelector("#digitalMessage");

  const validOutput =
    document.querySelector("#validOutput");

  if (selected === null) {

    binaryOutput.textContent = "— — —";
    validOutput.textContent = "0";

    digitalMessage.textContent =
      "Sin entrada activa: salida no válida";

  } else {

    const binary = selected
      .toString(2)
      .padStart(3, "0");

    binaryOutput.textContent =
      binary.split("").join(" ");

    validOutput.textContent = "1";

    if (active.length > 1) {

      digitalMessage.textContent =
        `Prioridad: gana D${selected} ` +
        `(${active.length} entradas activas)`;

    } else {

      digitalMessage.textContent =
        `D${selected} activa → código ${binary}`;

    }
  }

  // Resaltar fila correspondiente

  for (let i = 0; i < 8; i++) {

    document
      .querySelector(`#digital-row-${i}`)
      .classList.toggle(
        "selected",
        i === selected
      );

  }
}

// Botón limpiar entradas

document
  .querySelector("#digitalClear")
  .addEventListener("click", () => {

    switches.forEach(s => {
      s.checked = false;
    });

    updateDigital();

  });

// Botón ejemplo D2 y D6

document
  .querySelector("#digitalExample")
  .addEventListener("click", () => {

    switches.forEach(s => {
      s.checked = false;
    });

    switches[2].checked = true;
    switches[6].checked = true;

    updateDigital();

  });

updateDigital();

// 24 ciclos por vuelta en cada canal.
// Decodificación en cuadratura x4:
// 24 * 4 = 96 cuentas por vuelta.

const STEPS_PER_REV = 96;

const DEG_PER_STEP =
  360 / STEPS_PER_REV;

// Estados de cuadratura A y B

const quadrature = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1]
];

let count = 0;
let rotationPosition = 0;
let automatic = null;

// Actualizar valores del encoder

function refreshRotor(dir = "Sin movimiento") {

  rotationPosition = count * DEG_PER_STEP;

  const rotor =
    document.querySelector("#rotor");

  rotor.style.transform =
    `rotate(${rotationPosition}deg)`;

  // Ángulo entre 0 y 360 grados

  const angle =
    ((rotationPosition % 360) + 360) % 360;

  document.querySelector("#angle").textContent =
    `${angle.toFixed(2)}°`;

  // Contador de cuentas

  document.querySelector("#counts").textContent =
    count;

  // Vueltas acumuladas

  document.querySelector("#revs").textContent =
    (count / STEPS_PER_REV).toFixed(3);

  // Dirección

  document.querySelector("#direction").textContent =
    dir;

  // Calcular estado de cuadratura

  const index = ((count % 4) + 4) % 4;

  const state = quadrature[index];

  ["A", "B"].forEach((letter, i) => {

    const elem =
      document.querySelector(`#signal${letter}`);

    elem.textContent = state[i];

    elem.classList.toggle(
      "high",
      Boolean(state[i])
    );

    elem.classList.toggle(
      "low",
      !state[i]
    );

  });

}

// Función para girar

function rotate(step) {

  count += step;

  if (step > 0) {

    refreshRotor("Horario");

  } else {

    refreshRotor("Antihorario");

  }

}

// Botón giro horario

document
  .querySelector("#cw")
  .addEventListener("click", () => {

    rotate(1);

  });

// Botón giro antihorario

document
  .querySelector("#ccw")
  .addEventListener("click", () => {

    rotate(-1);

  });

// Botón de movimiento automático

const autoButton =
  document.querySelector("#auto");

function stopAuto() {

  if (automatic !== null) {

    clearInterval(automatic);
    automatic = null;

  }

  autoButton.textContent =
    "▶ Giro automático";

}

autoButton.addEventListener("click", () => {

  if (automatic !== null) {

    stopAuto();
    return;

  }

  automatic = setInterval(() => {

    rotate(1);

  }, 120);

  autoButton.textContent =
    "⏸ Pausar giro";

});

// Reiniciar el encoder

document
  .querySelector("#resetRotor")
  .addEventListener("click", () => {

    stopAuto();

    count = 0;

    refreshRotor();

  });

refreshRotor();

// CUESTIONARIO INTERACTIVO

const questions = [

  {
    q: "¿Qué hace un encoder digital 8 → 3?",

    answers: [
      "Convierte 8 entradas en un código binario de 3 bits",
      "Mide temperatura",
      "Convierte corriente alterna en directa"
    ],

    correct: 0,

    why: "Representa la entrada activa mediante tres bits."
  },

  {
    q: "Si activas D2 y D6, ¿cuál tiene prioridad?",

    answers: [
      "D2",
      "D6",
      "Ninguna"
    ],

    correct: 1,

    why: "La entrada con el número más alto tiene prioridad."
  },

  {
    q: "¿Qué permite identificar el desfase entre A y B?",

    answers: [
      "La temperatura",
      "El sentido del giro",
      "El voltaje"
    ],

    correct: 1,

    why: "La secuencia de señales permite reconocer la dirección."
  },

  {
    q: "¿Qué ventaja tiene un encoder absoluto?",

    answers: [
      "Entrega un código de posición directamente",
      "Solo funciona a máxima velocidad",
      "No tiene salida digital"
    ],

    correct: 0,

    why: "Cada posición angular tiene un código asociado."
  }

];

let questionIndex = 0;
let score = 0;
let answered = false;

// Mostrar preguntas

function renderQuestion() {

  answered = false;

  const q = questions[questionIndex];

  document.querySelector("#question").textContent =
    q.q;

  const area = document.querySelector("#answers");

  area.replaceChildren();

  q.answers.forEach((answer, i) => {

    const button = document.createElement("button");

    button.textContent = answer;

    button.addEventListener("click", () => {

      chooseAnswer(i);

    });

    area.append(button);

  });

  document.querySelector("#quizFeedback").textContent =
    "";

  document.querySelector("#nextQuestion").hidden =
    true;

  document.querySelector("#restartQuiz").hidden =
    true;

  document.querySelector("#quizProgress").textContent =
    `Pregunta ${questionIndex + 1} de ${questions.length} ` +
    `| Aciertos: ${score}`;

}

// Evaluar respuesta

function chooseAnswer(i) {

  if (answered) return;

  answered = true;

  const q = questions[questionIndex];

  const correct = i === q.correct;

  if (correct) {
    score++;
  }

  document
    .querySelectorAll("#answers button")
    .forEach(button => {

      button.disabled = true;

    });

  document.querySelector("#quizFeedback").textContent =
    `${correct ? "✅ ¡Correcto!" : "❌ Incorrecto."} ${q.why}`;

  document.querySelector("#quizProgress").textContent =
    `Pregunta ${questionIndex + 1} de ${questions.length} ` +
    `| Aciertos: ${score}`;

  if (questionIndex === questions.length - 1) {

    document.querySelector("#quizFeedback").textContent +=
      ` Resultado final: ${score}/${questions.length}.`;

    document.querySelector("#restartQuiz").hidden =
      false;

  } else {

    document.querySelector("#nextQuestion").hidden =
      false;

  }

}

// Siguiente pregunta

document
  .querySelector("#nextQuestion")
  .addEventListener("click", () => {

    questionIndex++;
    renderQuestion();

  });

// Repetir cuestionario

document
  .querySelector("#restartQuiz")
  .addEventListener("click", () => {

    questionIndex = 0;
    score = 0;

    renderQuestion();

  });

renderQuestion();
