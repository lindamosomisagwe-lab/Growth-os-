// src/utils/id.js
// Dependency-free nanoid implementation for generating unique IDs.

const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

export function nanoid(n = 8) {
  return Array.from({ length: n }, () =>
    CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join("");
}

export function makeId(prefix) {
  return `${prefix}_${nanoid(8)}`;
}
