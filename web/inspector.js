import { renderRackEditor } from "./rack_editor.js";
import { voices } from "./sounds.js";

const inspector = document.querySelector("#inspector");
const pitchColors = [
 ["red", "Red"],
 ["green", "Green"],
 ["blue", "Blue"],
 ["amber", "Amber"],
 ["purple", "Purple"],
];
const sourceRates = [
 [6, "Drift"],
 [4.5, "Calm"],
 [3, "Flow"],
 [2, "Pulse"],
];
const sourceSizes = [
 [4, "Soft"],
 [7, "Normal"],
 [10, "Strong"],
 [14, "Deep"],
];

export function renderInspector(node, onChange) {
 const nextKey = node
   ? `${node.type}:${node.id}:${JSON.stringify(node.pattern ?? [])}:${node.voice ?? ""}:${node.shift ?? ""}:${node.color ?? ""}:${node.radius ?? ""}:${node.period ?? ""}`
   : "none";

 if (inspector.dataset.key === nextKey) return;
 inspector.dataset.key = nextKey;
 inspector.replaceChildren();

 if (!node) {
   inspector.append(title("Inspector"));
   inspector.append(message("Select a node to inspect it."));
   return;
 }

 inspector.append(title(`${label(node.type)} #${node.id}`));

 const refresh = () => {
   inspector.dataset.key = "";
   onChange();
 };

 if (node.type === "bell") renderBell(node, refresh);
 else if (node.type === "rack") renderRackEditor(inspector, node, refresh);
 else if (node.type === "shift") renderShift(node, refresh);
 else if (node.type === "source") renderSource(node, refresh);
 else inspector.append(message("This node has no editable properties yet."));
}

function renderBell(node, refresh) {
 inspector.append(caption("Voice"));
 const choices = document.createElement("div");
 choices.className = "voice-grid";

 for (const [id, voice] of Object.entries(voices)) {
   choices.append(choice(voice.label, id === (node.voice ?? "temple"), () => {
     node.voice = id;
     refresh();
   }));
 }

 inspector.append(choices);
 inspector.append(note("Colour sets pitch. Bead radius sets strike strength and volume."));
}

function renderShift(node, refresh) {
 inspector.append(caption("Pitch shift"));
 const choices = document.createElement("div");
 choices.className = "shift-grid";

 for (const steps of [-2, -1, 1, 2]) {
   choices.append(choice(steps > 0 ? `+${steps}` : `${steps}`,
     steps === (node.shift ?? 1), () => {
       node.shift = steps;
       refresh();
     }));
 }

 inspector.append(choices);
}

function renderSource(node, refresh) {
 inspector.append(caption("Pitch"));
 const colors = document.createElement("div");
 colors.className = "color-grid";

 for (const [id, name] of pitchColors) {
   const button = choice(name, id === (node.color ?? "blue"), () => {
     node.color = id;
     refresh();
   });
   button.classList.add("color-choice", `color-${id}`);
   colors.append(button);
 }

 inspector.append(colors, caption("Strike size"));
 const sizeGrid = document.createElement("div");
 sizeGrid.className = "size-grid";

 for (const [radius, name] of sourceSizes) {
   sizeGrid.append(choice(name, radius === (node.radius ?? 7), () => {
     node.radius = radius;
     refresh();
   }));
 }

 inspector.append(sizeGrid, caption("Breathing"));
 const rates = document.createElement("div");
 rates.className = "rate-grid";

 for (const [period, name] of sourceRates) {
   rates.append(choice(name, period === (node.period ?? 4.5), () => {
     node.period = period;
     refresh();
   }));
 }

 inspector.append(rates);
}

function choice(text, selected, action) {
 const button = document.createElement("button");
 button.type = "button";
 button.className = "voice-choice";
 button.textContent = text;
 if (selected) button.classList.add("selected");
 button.addEventListener("click", action);
 return button;
}

function title(text) {
 const h = document.createElement("h2");
 h.textContent = text;
 return h;
}

function caption(text) {
 const div = document.createElement("div");
 div.className = "field-caption";
 div.textContent = text;
 return div;
}

function message(text) {
 const p = document.createElement("p");
 p.textContent = text;
 return p;
}

function note(text) {
 const p = message(text);
 p.classList.add("inspector-note");
 return p;
}

function label(value) {
 return value[0].toUpperCase() + value.slice(1);
}