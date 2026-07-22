---
name: apps-port-audit
description: >-
  Audit a rexerai native block already ported from apps/<brand> into block-editor
  against the apps-port-host contract (wiring, canvas styles, isCanvas edit fork,
  LayersPanel groupId/fieldType, portal/drawer, motion scroller). Use when the user
  asks to audit/kiểm tra block đã port, port xong chưa, verify wiring, thiếu
  groupId/isCanvas/canvas styles, apps → host readiness, or “block convert đủ chưa”.
  Outputs PASS/FAIL + proposed fixes; does not implement unless the user confirms.
  Distinct from apps-port-host (do the port) and block-review (responsive/visual QA).
---

# Apps port audit — block đã convert đủ chưa?

Project skill for **rexerai**. Input: block name, `type_code`, or `blocks/<Name>.tsx`.
Output: structured audit report + **proposed fixes**. Do **not** implement until the user confirms.

How to port / fix patterns: [`../apps-port-host/SKILL.md`](../apps-port-host/SKILL.md) + its references.
Detailed check signals: [references/audit-checklist.md](references/audit-checklist.md).

## vs other skills

| Skill | When |
|---|---|
| `apps-port-host` | **Doing** the port / wiring |
| `apps-port-audit` | Block **already exists** — check contract + propose fixes |
| `block-review` | Responsive / motion / visual QA after wiring is OK |

Ambiguous “review block X” about UI/responsive → `block-review`. Mentions convert/port/wiring/canvas edit/`groupId` → this skill.

## Workflow

```
1. Identify  →  2. Script wiring  →  3. Code audit  →  4. Report  →  5. Stop (propose only)
```

### 1. Identify

- Map to `src/components/modules/block-editor/blocks/<Name>.tsx` + snake `type_code`.
- Full block vs **sub-component** (apps-port-host Step 0): sub = no BlockType/registry/BE seed; audit parent for CMS keys + drawer rules only.
- Collect: component file, BlockDef (`blocks/_registry/defs/…`), related expand in `LayersPanel` if any.

### 2. Automated wiring (full blocks only)

From repo root:

```bash
bash .claude/skills/framer-clone-host/scripts/verify-block-wiring.sh <type_code> <ComponentName>
```

Covers: file exists, `activeKey` / `data-element-key` / `selectableClass` / `@container` / motion hooks, `types.ts`, Path A registry or Path B, `ORDERED_TYPES`. Paste salient ✓/✗ into the report.

Skip for pure sub-components (no `type_code`).

### 3. Code audit (script gaps)

Read component + BlockDef. Use [audit-checklist.md](references/audit-checklist.md). Focus:

| Area | Fail if |
|---|---|
| Canvas styles | No `styleOf` / `composeStyle(base, styleOf(key))`; design tokens only on Tailwind `text-*`/`font-*` |
| Key sync | `data-element-key` missing or ≠ `elements[]` / expand |
| Layers UX | Missing `fieldType`; paired fields without contiguous `groupId`/`groupLabel` |
| Edit fork | Pin/scrub/hide-inactive but no `isCanvas` + `data-canvas-edit`; edit grid leaks to Preview/`/p` |
| Motion | `scrollTrigger` without `scroller`; `new Lenis` / `gsap.registerPlugin` inside block |
| Mobile | Layout via `md:` / `useIsMobile` instead of `@2xl` / `useContainerMobile` |
| Sticky/overlay | Needs pin track / fixed header but missing from `BlockPreview` sets |
| Drawer | Overlay without portal / scroll-lock / `data-lenis-prevent`; sub registered as BlockType |
| BE seed | Note only (P2) — FE cannot seed Go |

Severity: **P0** = cannot edit/preview or wiring broken; **P1** = Layers/`groupId`/edit fork UX; **P2** = polish / BE note.

### 4. Report (always this template)

```markdown
## Port audit: <Name> (`<type_code>` · full|sub)

### Verdict: PASS | FAIL | PASS_WITH_NOTES

### Wiring (script)
- ✓/✗ … (salient lines from verify-block-wiring.sh; N/A if sub)

### Host contract
| Check | Result | Evidence | Fix proposal |
|---|---|---|---|
| … | PASS/FAIL/N/A | `file:line` | … |

### Proposed fixes (ordered)
1. [P0] … — `path` — follow apps-port-host §… / host-adaptations §…
2. [P1] …

### Out of scope here
- Responsive deep QA → block-review
- BE seed apply → note only
```

Each FAIL needs evidence (`file:line`) and a concrete fix pointing at apps-port-host (e.g. canvas styles, canvas edit surface ≠ preview, `groupId`, portal).

### 5. Stop

List proposed fixes. Ask before implementing. If user says fix → follow `apps-port-host` (do not invent a parallel port flow).

## Quick pointers (do not duplicate)

| Topic | Where |
|---|---|
| Full vs sub, port workflow | `../apps-port-host/SKILL.md` |
| Portal, styles, isCanvas, groupId | `../apps-port-host/references/host-adaptations.md` |
| Touchpoint table | `../apps-port-host/references/wiring-checklist.md` |
| Grep/read signals for this audit | [references/audit-checklist.md](references/audit-checklist.md) |
