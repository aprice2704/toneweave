export const voices = {
 temple: {
   label: "Temple Bell",
   attack: 0.012,
   decay: 3.2,
   wave: "sine",
   partials: [
     [1, 1],
     [2.01, 0.28],
     [3.92, 0.12],
     [5.43, 0.05],
   ],
 },
 bowl: {
   label: "Singing Bowl",
   attack: 0.035,
   decay: 5.2,
   wave: "sine",
   partials: [
     [1, 1],
     [2.7, 0.18],
     [4.08, 0.08],
   ],
 },
 glass: {
   label: "Glass Chime",
   attack: 0.008,
   decay: 2.8,
   wave: "sine",
   partials: [
     [1, 1],
     [2, 0.18],
     [4, 0.06],
   ],
 },
 wood: {
   label: "Tubular Bell",
   attack: 0.01,
   decay: 4.8,
   wave: "sine",
   partials: [
     [1, 1],
     [2.76, 0.22],
     [5.4, 0.09],
     [8.93, 0.04],
   ],
 },
 pluck: {
   label: "Soft Pluck",
   attack: 0.003,
   decay: 1.35,
   wave: "triangle",
   partials: [
     [1, 1],
     [2, 0.22],
     [3, 0.08],
   ],
 },
};

export function voiceOrDefault(id) {
 return voices[id] ?? voices.temple;
}