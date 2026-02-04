const cases = {
  beginner: [
    {
      name: "White cross - edge flip",
      goal: "Flip the misoriented edge to complete the white cross.",
      alg: "F U R U' R' F'",
      tip: "Keep the white center on top to avoid losing orientation.",
    },
    {
      name: "First layer corner",
      goal: "Insert the white corner into the front-right slot.",
      alg: "R U R' U'",
      tip: "Repeat until the corner matches both side colors.",
    },
    {
      name: "Second layer edge",
      goal: "Insert the edge into the right slot without disturbing the cross.",
      alg: "U R U' R' U' F' U F",
      tip: "Match the front color before performing the trigger.",
    },
  ],
  cfop: [
    {
      name: "OLL 21 (Sune)",
      goal: "Orient the last layer.",
      alg: "R U R' U R U2 R'",
      tip: "Watch the headlights and keep them in the back.",
    },
    {
      name: "PLL T-perm",
      goal: "Swap two corners and two edges.",
      alg: "R U R' U' R' F R2 U' R' U' R U R' F'",
      tip: "Start with the block on the left for smoother execution.",
    },
    {
      name: "PLL J-perm (a)",
      goal: "Swap two corners and cycle edges.",
      alg: "L' U' L F L' U' L U L F' L2 U L",
      tip: "Turn slowly at the slice move to keep accuracy.",
    },
  ],
  f2l: [
    {
      name: "F2L 1 - Paired in top layer",
      goal: "Insert a paired corner-edge into the front-right slot.",
      alg: "U R U' R'",
      tip: "Use a U move first to align the pair with the slot.",
    },
    {
      name: "F2L 3 - Corner in slot",
      goal: "Take out the corner and pair it with the edge.",
      alg: "R U' R' U R U' R'",
      tip: "Keep the corner in the top layer before pairing.",
    },
    {
      name: "F2L 6 - Edge in slot",
      goal: "Move the edge out and insert the pair.",
      alg: "U R U2 R' U R U' R'",
      tip: "Watch for the matching colors on the right.",
    },
  ],
};

const colorOrder = ["white", "yellow", "red", "orange", "blue", "green"];

const cubeNet = document.getElementById("cube-net");
const solutionCard = document.getElementById("solution-card");
const caseName = document.getElementById("case-name");
const caseGoal = document.getElementById("case-goal");
const caseAlg = document.getElementById("case-alg");
const caseTip = document.getElementById("case-tip");
const moveTracker = document.getElementById("move-tracker");
const solutionPace = document.getElementById("solution-pace");
const sessionCount = document.getElementById("session-count");
const bestTime = document.getElementById("best-time");
const currentTime = document.getElementById("current-time");

const modeSelect = document.getElementById("mode-select");
const paceSelect = document.getElementById("pace-select");
const newCaseBtn = document.getElementById("new-case");
const toggleSolutionBtn = document.getElementById("toggle-solution");
const stepMoveBtn = document.getElementById("step-move");
const resetCaseBtn = document.getElementById("reset-case");

let activeCase = null;
let moveIndex = 0;
let timerInterval = null;
let startTime = null;
let sessionTotal = 0;
let bestMillis = null;

const faces = ["U", "L", "F", "R", "B", "D"];

const buildCube = () => {
  cubeNet.innerHTML = "";
  faces.forEach((face) => {
    const faceEl = document.createElement("div");
    faceEl.className = "face";
    faceEl.dataset.face = face;

    for (let i = 0; i < 9; i += 1) {
      const sticker = document.createElement("button");
      sticker.type = "button";
      sticker.className = "sticker white";
      sticker.dataset.colorIndex = "0";
      sticker.addEventListener("click", () => {
        const nextIndex = (Number(sticker.dataset.colorIndex) + 1) % colorOrder.length;
        sticker.dataset.colorIndex = String(nextIndex);
        sticker.className = `sticker ${colorOrder[nextIndex]}`;
      });
      faceEl.appendChild(sticker);
    }

    cubeNet.appendChild(faceEl);
  });
};

const updateMoveTracker = () => {
  moveTracker.innerHTML = "";
  if (!activeCase) {
    return;
  }
  const moves = activeCase.alg.split(" ");
  moves.forEach((move, index) => {
    const span = document.createElement("span");
    span.className = "move";
    if (index === moveIndex) {
      span.classList.add("active");
    }
    span.textContent = move;
    moveTracker.appendChild(span);
  });
};

const updateTimer = () => {
  if (!startTime) {
    currentTime.textContent = "00:00";
    return;
  }
  const elapsed = Date.now() - startTime;
  const seconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(seconds / 60);
  const displaySeconds = String(seconds % 60).padStart(2, "0");
  const displayMinutes = String(minutes).padStart(2, "0");
  currentTime.textContent = `${displayMinutes}:${displaySeconds}`;
};

const startTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  startTime = Date.now();
  updateTimer();
  timerInterval = setInterval(updateTimer, 500);
};

const stopTimer = () => {
  if (!startTime) {
    return;
  }
  const elapsed = Date.now() - startTime;
  if (!bestMillis || elapsed < bestMillis) {
    bestMillis = elapsed;
    const seconds = Math.floor(bestMillis / 1000);
    const minutes = Math.floor(seconds / 60);
    bestTime.textContent = `${String(minutes).padStart(2, "0")}:${String(
      seconds % 60
    ).padStart(2, "0")}`;
  }
  clearInterval(timerInterval);
  timerInterval = null;
  startTime = null;
  updateTimer();
};

const setCase = (caseItem) => {
  activeCase = caseItem;
  moveIndex = 0;
  caseName.textContent = caseItem.name;
  caseGoal.textContent = caseItem.goal;
  caseAlg.textContent = caseItem.alg;
  caseTip.textContent = `Tip: ${caseItem.tip}`;
  solutionPace.textContent = paceSelect.value.replace(/^[a-z]/, (char) => char.toUpperCase());
  updateMoveTracker();
  solutionCard.classList.add("visible");
  sessionTotal += 1;
  sessionCount.textContent = String(sessionTotal);
  startTimer();
};

const resetCase = () => {
  activeCase = null;
  moveIndex = 0;
  caseName.textContent = "Ready to start";
  caseGoal.textContent = "Select a mode and click “New case” to begin.";
  caseAlg.textContent = "--";
  caseTip.textContent = "Tip: Keep your cube oriented with white on top.";
  moveTracker.innerHTML = "";
  solutionCard.classList.remove("visible");
  stopTimer();
};

newCaseBtn.addEventListener("click", () => {
  const mode = modeSelect.value;
  const options = cases[mode];
  const randomCase = options[Math.floor(Math.random() * options.length)];
  setCase(randomCase);
});

toggleSolutionBtn.addEventListener("click", () => {
  solutionCard.classList.toggle("visible");
});

stepMoveBtn.addEventListener("click", () => {
  if (!activeCase) {
    return;
  }
  const moves = activeCase.alg.split(" ");
  moveIndex = (moveIndex + 1) % moves.length;
  updateMoveTracker();
  if (moveIndex === moves.length - 1) {
    stopTimer();
  }
});

resetCaseBtn.addEventListener("click", () => {
  resetCase();
});

paceSelect.addEventListener("change", () => {
  solutionPace.textContent = paceSelect.value.replace(/^[a-z]/, (char) => char.toUpperCase());
});

buildCube();
resetCase();
