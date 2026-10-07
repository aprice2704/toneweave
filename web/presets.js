function bead(color, waitMs, radius = 7) {
 return { color, waitMs, radius };
}

export const rackPresets = {
 "three-stones": {
   label: "Three Stones",
   pattern: [
     bead("blue", 0, 8),
     bead("green", 520, 6),
     bead("blue", 760, 9),
   ],
 },
 "temple-steps": {
   label: "Temple Steps",
   pattern: [
     bead("red", 0, 8),
     bead("green", 420, 7),
     bead("blue", 420, 6),
     bead("purple", 680, 9),
   ],
 },
 "glass-drops": {
   label: "Glass Drops",
   pattern: [
     bead("purple", 0, 5),
     bead("blue", 760, 8),
     bead("purple", 300, 5),
     bead("amber", 920, 9),
   ],
 },
 pendulum: {
   label: "Pendulum",
   pattern: [
     bead("green", 0, 7),
     bead("purple", 520, 9),
     bead("green", 520, 7),
     bead("purple", 520, 9),
   ],
 },
 "five-pebbles": {
   label: "Five Pebbles",
   pattern: [
     bead("red", 0, 5),
     bead("green", 320, 6),
     bead("blue", 420, 9),
     bead("green", 420, 6),
     bead("red", 700, 5),
   ],
 },
 "quiet-arc": {
   label: "Quiet Arc",
   pattern: [
     bead("green", 0, 5),
     bead("blue", 440, 7),
     bead("purple", 600, 10),
     bead("blue", 820, 6),
   ],
 },
};

export function applyRackPreset(node, id) {
 const preset = rackPresets[id];
 if (!preset) return;

 node.preset = id;
 node.pattern = preset.pattern.map((item) => ({ ...item }));
}