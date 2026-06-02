# Galaxy Goals View – Implementation Plan

## Goal Description
Replace the existing linear “Goals Map” page with an immersive, space‑themed galaxy view where each **Big Goal** appears as an independent floating node (planet/star). Goals are clustered loosely by life‑area, can be dragged anywhere, and can be linked optionally with faint connection lines. The background is a dark gradient with ambient stars, a floating‑action‑button (FAB) to add goals, and an elegant modal for creating or editing a goal.

---

### User Review Required
- **Design confirmation** – Do you want the exact colour gradients and node‑size logic as described, or would you prefer any tweaks (e.g., node size range, gradient angles)?
- **Persistence** – Should we use the existing Supabase setup (if any) or a simple `localStorage` fallback for now?
- **Goal‑connection feature** – Optional. Should we implement it now or ship core view first?

> **IMPORTANT**: Please confirm the above points or let me know any adjustments before I start coding.

---

### Open Questions
- **Data source** – Shape of the goal objects (`id, name, lifeArea, progressPercent, tasksThisWeek`).
- **Mobile layout** – Preferred method for 2‑column grid on small screens (CSS grid vs JS).
- **Modal animations** – Any extra effects beyond slide‑up?

---

### Proposed Changes
| Component | File(s) | Actions |
|-----------|---------|---------|
| 1. New page container | `lifemart os.html` | Add `<section class="goals-page">…</section>` with dark gradient background and `<div id="goals-canvas"></div>` |
| 2. Ambient stars | `lifemart os.html` (script) & CSS | `createStars()` creates 12‑16 tiny white circles; CSS `.star` for size/opacity |
| 3. Goal node markup | `lifemart os.html` (JS template) | Render each goal as `<div class="goal-node" data-id="…">` containing `<div class="goal-planet">` (emoji) and `<div class="goal-name">` |
| 4. CSS for nodes & animations | `lifemart os.html` (style block) | Add `.goal-node`, `.goal-planet`, orbit ring animation, hover scaling, glow shadows |
| 5. Area colour / gradient mapping | `lifemart os.html` (script) | `AREA_COLORS` object – set node background gradient & glow based on life area |
| 6. Positioning logic | `lifemart os.html` (script) | `AREA_ZONES` anchors; `positionGoal()` computes `left/top` percentages with random offsets; draggable nodes; persist positions via Supabase or `localStorage` |
| 7. FAB (floating action button) | `lifemart os.html` (HTML + CSS) | Add `<button class="fab-add-goal">+</button>` fixed bottom‑right with gradient background, hover rotate, active press effect |
| 8. Add‑Goal modal | `lifemart os.html` (HTML, CSS, JS) | Hidden `.modal-add-goal` with glass background, life‑area selector pills, AI/manual options |
| 9. Goal detail panel (bottom sheet) | `lifemart os.html` (HTML, CSS, JS) | `.goal-panel` slides up on node tap, dims other nodes, shows small planet, name, area badge, progress ring, steps list with checkboxes |
|10. Empty‑state galaxy | `lifemart os.html` (HTML + CSS) | `.empty-galaxy` with four pulsing `.ghost-star` elements and invitation button |
|11. Responsive mobile layout | CSS media query | Switch to a 2‑column CSS grid when width ≤ 680 px |
|12. Optional goal connections | `lifemart os.html` (script, SVG overlay) | Long‑press + drag draws a faint dashed line; saved with same persistence layer (toggleable) |
|13. Clean‑up | Remove old linear‑path markup & JS |
|14. Documentation | Update `README.md` with a brief usage note |

---

### Verification Plan
1. **Manual UI inspection** – Gradient background, ambient stars, each goal node with correct colour/emoji.
2. **Node interaction** – Hover scaling, drag‑and‑drop, persistence after reload.
3. **FAB & modal** – FAB opens Add‑Goal modal; adding a goal creates a new node.
4. **Goal panel** – Tap node → other nodes dim, panel slides up, shows correct data; closing restores view.
5. **Empty state** – When no goals exist, ghost stars and invitation appear.
6. **Responsive** – Mobile view reflows nodes into a 2‑column layout, still draggable.
7. **Accessibility** – All interactive elements have `tabindex="0"`, `aria-label`s, visible focus outlines.
8. **Performance** – Star creation runs once; dragging is smooth; no layout thrashing.

---

### Next Steps
1. Create `task.md` with a checklist of incremental tasks.
2. Implement changes block‑by‑block, committing after each logical piece.
3. Manual verification after each commit.

---

*This file documents the full implementation plan for the galaxy‑style Goals view.*
