import { rackPresets, applyRackPreset } from "./presets.js";
import { rackBeads } from "./rack.js";

const waits = [
 [240, "Tight"],
 [360, "Near"],
 [480, "Even"],
 [720, "Wide"],
 [960, "Long"],
];

const sizes = [
 [4, "·"],
 [7, "●"],
 [10, "●"],
 [14, "●"],
];

export function renderRackEditor(root, node, refresh) {
 root.append(caption("Pattern seed"));

 const presets = document.createElement("div");
 presets.className = "preset-grid";

 for (const [id, preset] of Object.entries(rackPresets)) {
   presets.append(choice(
     preset.label,
     node.preset === id,
     () => {
       applyRackPreset(node, id);
       refresh();
     },
   ));
 }

 root.append(presets);
 root.append(caption("Beads"));

 node.pattern = rackBeads(node);

 node.pattern.forEach((bead, index) => {
   root.append(beadEditor(bead, index, () => {
     node.preset = "";
     refresh();
   }));
 });
}

function beadEditor(bead, index, refresh) {
 const row = document.createElement("div");
 row.className = "rack-bead-row";

 const head = document.createElement("div");
 head.className = "rack-bead-head";

 const dot = document.createElement("span");
 dot.className = "rack-edit-bead";
 dot.style.background = colorValue(bead.color);
 dot.style.width = `${10 + bead.radius}px`;
 dot.style.height = `${10 + bead.radius}px`;

 const name = document.createElement("span");
 name.textContent = `Bead ${index + 1}`;
 head.append(dot, name);

 const timing = document.createElement("div");
 timing.className = "mini-choice-grid";

 for (const [waitMs, label] of waits) {
   timing.append(choice(label, bead.waitMs === waitMs, () => {
     bead.waitMs = waitMs;
     refresh();
   }, "mini-choice"));
 }

 const volume = document.createElement("div");
 volume.className = "mini-choice-grid size-choice-grid";

 for (const [radius, label] of sizes) {
   const button = choice(label, bead.radius === radius, () => {
     bead.radius = radius;
     refresh();
   }, "mini-choice");
   button.style.fontSize = `${10 + radius}px`;
   volume.append(button);
 }

 row.append(head, smallLabel("Gap"), timing, smallLabel("Force"), volume);
 return row;
}

function choice(text, selected, action, extra = "") {
 const button = document.createElement("button");
 button.type = "button";
 button.className = `voice-choice ${extra}`.trim();
 button.textContent = text;
 if (selected) button.classList.add("selected");
 button.addEventListener("click", action);
 return button;
}

function caption(text) {
 const div = document.createElement("div");
 div.className = "field-caption";
 div.textContent = text;
 return div;
}

function smallLabel(text) {
 const span = document.createElement("span");
 span.className = "rack-small-label";
 span.textContent = text;
 return span;
}

function colorValue(color) {
 return {
   red: "#df7d7d",
   green: "#79c99e",
   blue: "#78a7ff",
   amber: "#e7ba6c",
   purple: "#b58cff",
 }[color] ?? "#d9dde5";
}