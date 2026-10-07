export const pitchOrder = ["red", "green", "blue", "amber", "purple"];

export function shiftPitch(color, steps) {
 const index = pitchOrder.indexOf(color);
 if (index < 0) return color;
 const length = pitchOrder.length;
 return pitchOrder[(index + steps % length + length) % length];
}