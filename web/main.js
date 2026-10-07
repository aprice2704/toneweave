const svg = document.querySelector("#stage");
const linksG = document.querySelector("#links");
const ballsG = document.querySelector("#balls");
const nodesG = document.querySelector("#nodes");
const statusEl = document.querySelector("#status");
const selectionEl = document.querySelector("#selection");
const enableAudioBtn = document.querySelector("#enable-audio");
const toggleRunBtn = document.querySelector("#toggle-run");
const resetBtn = document.querySelector("#reset");

const NS = "http://www.w3.org/2000/svg";

const palette = {
  blue: "#78a7ff",
  purple: "#b58cff",
  green: "#79c99e",
  amber: "#e7ba6c",
  red: "#df7d7d",
};

const frequencies = {
  blue: 392.00,
  purple: 523.25,
  green: 329.63,
  amber: 440.00,
  red: 261.63,
};

const state = {
  nodes: [],
  links: [],
  balls: [],
  nextNodeId: 1,
  nextBallId: 1,
  selectedNodeId: null,
  running: true,
  audioCtx: null,
  lastFrame: performance.now(),
};

const SPEED = 115; // SVG units per second

function node(type, x, y, extra = {}) {
  const value = {
    id: state.nextNodeId++,
    type,
    x,
    y,
    lastEmitMs: 0,
    ...extra,
  };
  state.nodes.push(value);
  return value;
}

function link(from, to) {
  if (from === to) return;
  if (state.links.some((l) => l.from === from && l.to === to)) return;
  state.links.push({ from, to });
}

function getNode(id) {
  return state.nodes.find((n) => n.id === id);
}

function resetWorld() {
  state.nodes = [];
  state.links = [];
  state.balls = [];
  state.nextNodeId = 1;
  state.nextBallId = 1;
  state.selectedNodeId = null;

  const source = node("source", 120, 300, {
    period: 3.7,
    color: "blue",
  });

  const painter = node("paint", 335, 190, {
    paint: "purple",
  });

  const upperBell = node("bell", 585, 150, {
    name: "Bell",
  });

  const rack = node("rack", 380, 420, {
    pattern: ["blue", "purple", "blue", "green"],
    spacingMs: 480,
  });

  const lowerBell = node("bell", 760, 420, {
    name: "Bowl",
  });

  link(source.id, painter.id);
  link(painter.id, upperBell.id);
  link(source.id, rack.id);
  link(rack.id, lowerBell.id);

  render();
}

function createSvg(tag, attrs = {}) {
  const el = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, String(value));
  }
  return el;
}

function render() {
  renderLinks();
  renderBalls();
  renderNodes();
  renderSelection();
}

function renderLinks() {
  linksG.replaceChildren();

  for (const item of state.links) {
    const from = getNode(item.from);
    const to = getNode(item.to);
    if (!from || !to) continue;

    linksG.append(
      createSvg("line", {
        x1: from.x,
        y1: from.y,
        x2: to.x,
        y2: to.y,
        class: "link",
      })
    );
  }
}

function renderBalls() {
  ballsG.replaceChildren();

  for (const ball of state.balls) {
    const from = getNode(ball.from);
    const to = getNode(ball.to);
    if (!from || !to) continue;

    const x = from.x + (to.x - from.x) * ball.progress;
    const y = from.y + (to.y - from.y) * ball.progress;

    ballsG.append(
      createSvg("circle", {
        cx: x,
        cy: y,
        r: 7,
        fill: palette[ball.color],
        class: "ball",
      })
    );
  }
}

function renderNodes() {
  nodesG.replaceChildren();

  for (const item of state.nodes) {
    const g = createSvg("g", {
      transform: `translate(${item.x} ${item.y})`,
      class: `node${state.selectedNodeId === item.id ? " selected" : ""}`,
      tabindex: 0,
    });
    g.dataset.nodeId = item.id;

    const shell = createSvg("rect", {
      x: -48,
      y: -32,
      width: 96,
      height: 64,
      rx: 16,
      class: "node-shell",
    });

    g.append(shell);

    if (item.type === "rack") {
      const pattern = item.pattern ?? [];
      const startX = -((pattern.length - 1) * 18) / 2;
      pattern.forEach((color, i) => {
        g.append(
          createSvg("circle", {
            cx: startX + i * 18,
            cy: -9,
            r: 6,
            fill: palette[color],
          })
        );
      });
    } else {
      let fill = "#d9dde5";
      if (item.type === "source") fill = palette[item.color];
      if (item.type === "paint") fill = palette[item.paint];

      g.append(
        createSvg("circle", {
          cx: 0,
          cy: -10,
          r: 9,
          fill,
        })
      );
    }

    const label = createSvg("text", {
      x: 0,
      y: 17,
      class: "node-label",
    });

    label.textContent =
      item.type === "bell"
        ? item.name ?? "Bell"
        : item.type[0].toUpperCase() + item.type.slice(1);

    g.append(label);

    installNodeInteraction(g, item);
    nodesG.append(g);
  }
}

function renderSelection() {
  const selected = getNode(state.selectedNodeId);

  selectionEl.textContent = selected
    ? `Selected: ${selected.type} #${selected.id}. Click another block to connect.`
    : "No block selected.";
}

function svgPointFromEvent(event) {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  return point.matrixTransform(svg.getScreenCTM().inverse());
}

function installNodeInteraction(group, item) {
  let pointerId = null;
  let startClientX = 0;
  let startClientY = 0;
  let moved = false;

  group.addEventListener("pointerdown", (event) => {
    pointerId = event.pointerId;
    startClientX = event.clientX;
    startClientY = event.clientY;
    moved = false;

    group.setPointerCapture(pointerId);
    group.classList.add("dragging");
    event.preventDefault();
  });

  group.addEventListener("pointermove", (event) => {
    if (pointerId !== event.pointerId) return;

    const travel = Math.hypot(
      event.clientX - startClientX,
      event.clientY - startClientY
    );

    if (travel > 4) moved = true;
    if (!moved) return;

    const p = svgPointFromEvent(event);
    item.x = Math.max(55, Math.min(945, p.x));
    item.y = Math.max(45, Math.min(595, p.y));

    render();
  });

  group.addEventListener("pointerup", (event) => {
    if (pointerId !== event.pointerId) return;

    if (group.hasPointerCapture(pointerId)) {
      group.releasePointerCapture(pointerId);
    }

    group.classList.remove("dragging");
    pointerId = null;

    if (!moved) selectNode(item.id);
  });

  group.addEventListener("pointercancel", () => {
    group.classList.remove("dragging");
    pointerId = null;
  });

  group.addEventListener("keydown", (event) => {
    const step = event.shiftKey ? 20 : 8;
    let changed = true;

    if (event.key === "ArrowLeft") item.x -= step;
    else if (event.key === "ArrowRight") item.x += step;
    else if (event.key === "ArrowUp") item.y -= step;
    else if (event.key === "ArrowDown") item.y += step;
    else changed = false;

    if (changed) {
      item.x = Math.max(55, Math.min(945, item.x));
      item.y = Math.max(45, Math.min(595, item.y));
      event.preventDefault();
      render();
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectNode(item.id);
    }
  });
}

function selectNode(id) {
  if (state.selectedNodeId == null) {
    state.selectedNodeId = id;
  } else if (state.selectedNodeId === id) {
    state.selectedNodeId = null;
  } else {
    link(state.selectedNodeId, id);
    state.selectedNodeId = null;
  }
  render();
}

function emitFrom(nodeId, color) {
  const outgoing = state.links.filter((l) => l.from === nodeId);

  for (const route of outgoing) {
    state.balls.push({
      id: state.nextBallId++,
      from: route.from,
      to: route.to,
      progress: 0,
      color,
    });
  }
}

function onArrive(item, color) {
  switch (item.type) {
    case "bell":
      playBell(color);
      emitFrom(item.id, color);
      break;

    case "paint":
      emitFrom(item.id, item.paint);
      break;

    case "rack": {
      const pattern = item.pattern ?? [];
      const spacing = item.spacingMs ?? 480;

      pattern.forEach((rackColor, index) => {
        setTimeout(() => {
          if (!state.running) return;
          emitFrom(item.id, rackColor);
          playBell(rackColor, 0.28);
        }, index * spacing);
      });
      break;
    }

    default:
      emitFrom(item.id, color);
  }
}

function update(dtSeconds, nowMs) {
  for (const item of state.nodes) {
    if (item.type !== "source") continue;

    const periodMs = (item.period ?? 4) * 1000;

    if (nowMs - item.lastEmitMs >= periodMs) {
      item.lastEmitMs = nowMs;
      emitFrom(item.id, item.color ?? "blue");
    }
  }

  const arrivals = [];

  for (const ball of state.balls) {
    const from = getNode(ball.from);
    const to = getNode(ball.to);

    if (!from || !to) {
      ball.dead = true;
      continue;
    }

    const distance = Math.max(1, Math.hypot(to.x - from.x, to.y - from.y));
    ball.progress += (SPEED * dtSeconds) / distance;

    if (ball.progress >= 1) {
      ball.dead = true;
      arrivals.push({ node: to, color: ball.color });
    }
  }

  state.balls = state.balls.filter((ball) => !ball.dead);

  for (const arrival of arrivals) {
    onArrive(arrival.node, arrival.color);
  }
}

function frame(nowMs) {
  const dt = Math.min(0.05, (nowMs - state.lastFrame) / 1000);
  state.lastFrame = nowMs;

  if (state.running) {
    update(dt, nowMs);
    render();
  }

  requestAnimationFrame(frame);
}

async function enableAudio() {
  if (!state.audioCtx) {
    state.audioCtx = new AudioContext();
  }

  if (state.audioCtx.state === "suspended") {
    await state.audioCtx.resume();
  }

  enableAudioBtn.disabled = true;
  enableAudioBtn.textContent = "Sound enabled";
  toggleRunBtn.disabled = false;
  statusEl.textContent = "Sound enabled. Stretch a link to lengthen its delay.";
  playBell("blue", 0.5);
}

function playBell(color, gainScale = 1) {
  const ctx = state.audioCtx;
  if (!ctx) return;

  const now = ctx.currentTime;
  const fundamental = frequencies[color] ?? frequencies.blue;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.06 * gainScale, now + 0.015);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);
  master.connect(ctx.destination);

  const partials = [
    { ratio: 1.00, level: 1.00, decay: 2.3 },
    { ratio: 2.01, level: 0.30, decay: 1.5 },
    { ratio: 3.97, level: 0.12, decay: 0.9 },
  ];

  for (const partial of partials) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(fundamental * partial.ratio, now);

    gain.gain.setValueAtTime(partial.level, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + partial.decay);

    osc.connect(gain).connect(master);
    osc.start(now);
    osc.stop(now + partial.decay + 0.1);
  }
}

function addNode(type) {
  const x = 470 + Math.random() * 120;
  const y = 250 + Math.random() * 120;

  const extra =
    type === "source"
      ? { period: 4.5, color: "green" }
      : type === "rack"
        ? { pattern: ["blue", "purple", "blue", "green"], spacingMs: 480 }
        : type === "paint"
          ? { paint: "green" }
          : type === "bell"
            ? { name: "Bell" }
            : {};

  node(type, x, y, extra);
  render();
}

enableAudioBtn.addEventListener("click", enableAudio);

toggleRunBtn.addEventListener("click", () => {
  state.running = !state.running;
  toggleRunBtn.textContent = state.running ? "Pause" : "Play";
  statusEl.textContent = state.running ? "Running." : "Paused.";
});

resetBtn.addEventListener("click", () => {
  resetWorld();
  statusEl.textContent = state.audioCtx
    ? "Reset and running."
    : "Reset. Sound is still off.";
});

document.querySelectorAll(".add-node").forEach((button) => {
  button.addEventListener("click", () => addNode(button.dataset.type));
});

resetWorld();
requestAnimationFrame(frame);
