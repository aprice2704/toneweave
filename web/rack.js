const DEFAULT_RADIUS = 7;
const DEFAULT_WAIT = 480;

export function rackBeads(node) {
 return (node.pattern ?? []).map((item, index) => {
   if (typeof item === "string") {
     return {
       color: item,
       radius: DEFAULT_RADIUS,
       waitMs: index === 0 ? 0 : (node.spacingMs ?? DEFAULT_WAIT),
     };
   }

   return {
     color: item.color ?? "blue",
     radius: item.radius ?? DEFAULT_RADIUS,
     waitMs: item.waitMs ?? (index === 0 ? 0 : DEFAULT_WAIT),
   };
 });
}

export function rackVisuals(node) {
 const beads = rackBeads(node);
 if (!beads.length) return [];

 let elapsed = 0;
 const times = beads.map((bead) => {
   elapsed += Math.max(0, bead.waitMs);
   return elapsed;
 });

 const total = Math.max(1, times[times.length - 1]);

 return beads.map((bead, index) => ({
   ...bead,
   x: -32 + (times[index] / total) * 64,
   displayRadius: 3 + Math.min(14, bead.radius) * 0.28,
 }));
}

export function emitRack(node, schedule, emit, isRunning) {
 let elapsed = 0;

 for (const bead of rackBeads(node)) {
   elapsed += Math.max(0, bead.waitMs);
   schedule(() => {
     if (isRunning()) {
       emit(node.id, bead.color, bead.radius);
     }
   }, elapsed);
 }
}