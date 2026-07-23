# Act One Open Jar Vertical Slice Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a polished, runnable 3–5 minute Phaser vertical slice of Act One, from Lin Yi waking in the apartment through finding the note, talking to Miya, choosing a sensory focus, opening the jar, and entering the winter-memory completion scene.

**Architecture:** A Vite + React + TypeScript shell mounts a fixed 640×360 Phaser game. Pure TypeScript domain systems own progression, quests, inventory, choices, and versioned saves; Phaser scenes render the apartment, player, interactions, pixel HUD, dialogue, choice overlay, and transition. Content remains data-driven so Act Two can reuse the same systems.

**Tech Stack:** Vite, React 19, TypeScript, Phaser 3, Vitest, Playwright, pnpm.

---

### Task 1: Scaffold the game and verification commands

**Files:**
- Create: `game/package.json`
- Create: `game/index.html`
- Create: `game/tsconfig.json`
- Create: `game/tsconfig.node.json`
- Create: `game/vite.config.ts`
- Create: `game/vitest.config.ts`
- Create: `game/playwright.config.ts`
- Create: `game/src/main.tsx`
- Create: `game/src/app/App.tsx`
- Create: `game/src/app/app.css`
- Create: `game/src/test/setup.ts`

**Step 1: Add scripts and dependencies**

Create `package.json` with `dev`, `build`, `test`, `test:watch`, `test:e2e` and `typecheck`.
Use Phaser, React and React DOM as runtime dependencies; Vite, TypeScript, Vitest, jsdom,
Playwright and React type packages as development dependencies.

**Step 2: Configure the app**

Mount a React shell containing a `.game-frame` and `#game-root`. Configure Vite to serve
`../assets/rpg_v2` as the public asset directory.

**Step 3: Install dependencies**

Run: `pnpm install`

Expected: lockfile created and dependencies installed without audit errors that block install.

**Step 4: Verify the empty shell**

Run: `pnpm typecheck && pnpm test -- --run && pnpm build`

Expected: all commands exit `0`.

**Step 5: Commit**

```bash
git add game
git commit -m "feat(game): scaffold act one runtime"
```

### Task 2: Implement progression, inventory, quests, and saves with TDD

**Files:**
- Create: `game/src/game/domain/act1State.ts`
- Create: `game/src/game/domain/act1Reducer.ts`
- Create: `game/src/game/systems/QuestSystem.ts`
- Create: `game/src/game/systems/InventorySystem.ts`
- Create: `game/src/game/systems/SaveService.ts`
- Test: `game/src/game/domain/act1Reducer.test.ts`
- Test: `game/src/game/systems/SaveService.test.ts`

**Step 1: Write failing progression tests**

Cover:

- initial phase is `ARRIVE`;
- moving three tiles advances to `EXPLORE`;
- box interaction adds `item_taipo_note` exactly once;
- note reading unlocks `NOTE_READ`;
- jar inspection is blocked before the note is read;
- each sensory choice writes the expected value;
- `JAR_OPENING` and `COMPLETE` are idempotent.

**Step 2: Run the tests and verify failure**

Run: `pnpm test -- --run src/game/domain/act1Reducer.test.ts`

Expected: FAIL because reducer and state factories do not exist.

**Step 3: Implement the minimal domain logic**

Use a discriminated `Act1Event` union and a pure `reduceAct1(state, event)` function.
Keep side effects outside the reducer.

**Step 4: Add failing save tests**

Cover valid round-trip, unknown version, corrupted JSON, unsafe phase normalization,
and player tile recovery.

**Step 5: Implement `SaveService`**

Use the key `gleanings.act1.save.v1`. Parse defensively; keep corrupted raw text under
`gleanings.act1.corrupt`; fall back to a fresh state.

**Step 6: Run tests**

Run: `pnpm test -- --run`

Expected: all unit tests pass.

**Step 7: Commit**

```bash
git add game/src/game
git commit -m "feat(game): add act one progression and saves"
```

### Task 3: Add data-driven content contracts

**Files:**
- Create: `game/src/content/act1/dialogue.zh-CN.json`
- Create: `game/src/content/act1/quests.json`
- Create: `game/src/content/act1/interactables.json`
- Create: `game/src/content/act1/apartment-map.json`
- Create: `game/src/content/act1/content.ts`
- Test: `game/src/content/act1/content.test.ts`

**Step 1: Write schema tests**

Verify every quest ID referenced by the reducer exists, every interactable has a valid tile
coordinate inside `30×20`, every dialogue line has a Chinese speaker label, and the three
choice values are `aroma`, `hongqu_red`, and `cold_clay`.

**Step 2: Run and verify failure**

Run: `pnpm test -- --run src/content/act1/content.test.ts`

Expected: FAIL because content files do not exist.

**Step 3: Add the validated Chinese content**

Encode the approved opening, note, Miya conversation, three sensory choices, early-jar
fallback, optional inspection lines, and transition lines.

**Step 4: Add the map contract**

Store map size, spawn points, furniture rectangles, collision rectangles, interaction points,
and camera bounds in JSON. Keep rendering metadata separate from progression state.

**Step 5: Run tests and commit**

Run: `pnpm test -- --run`

```bash
git add game/src/content
git commit -m "feat(game): add act one Chinese content"
```

### Task 4: Produce apartment pixel assets

**Files:**
- Create: `assets/rpg_v2/previews/preview_apartment_gameplay_640x360.png`
- Create: `assets/rpg_v2/tilesets/tileset_apartment_256x256.png`
- Create: `assets/rpg_v2/maps/map_apartment_full_960x640.png`
- Create: `assets/rpg_v2/sprites/spr_mia_walk_96x192.png`
- Create: `assets/rpg_v2/objects/obj_cardboard_box_32x32.png`
- Create: `assets/rpg_v2/objects/obj_laojiu_jar_sealed_32x64.png`
- Create: `assets/rpg_v2/objects/obj_laojiu_jar_open_32x64.png`
- Create: `assets/rpg_v2/items/it_taipo_note_32x32.png`
- Create: `assets/rpg_v2/fx/fx_jar_memory_640x360.png`
- Modify: `assets/rpg_v2/manifest/assets.manifest.json`
- Modify: `assets/rpg_v2/README.md`

**Step 1: Generate or deterministically draw source assets**

Follow `assets/rpg_v2/prompts/style-anchors-v2.md`. Use the existing fixed 24-color palette,
the same top-down 3/4 projection, hard pixel clusters, and no anti-aliasing.

**Step 2: Repack assets to engine dimensions**

Quantize without dithering. Threshold sprite/object/item alpha to `0/255`.
Assemble the full map on the `30×20` grid.

**Step 3: Run asset checks**

Verify:

- exact dimensions;
- no engine asset exceeds 24 opaque RGB colors;
- alpha-bearing engine assets only use `0/255`;
- all object positions align to 32-pixel tiles;
- preview uses exact 2× nearest-neighbor blocks.

**Step 4: Visually inspect the gameplay preview, map, Miya sheet, and transition**

Reject any blurred, painterly, 3D, isometric, or non-grid result.

**Step 5: Commit**

```bash
git add assets/rpg_v2
git commit -m "assets: add act one apartment pixel set"
```

### Task 5: Implement the Phaser boot and apartment scenes

**Files:**
- Create: `game/src/game/config.ts`
- Create: `game/src/game/startGame.ts`
- Create: `game/src/game/scenes/BootScene.ts`
- Create: `game/src/game/scenes/ApartmentScene.ts`
- Create: `game/src/game/entities/Player.ts`
- Create: `game/src/game/render/ApartmentRenderer.ts`
- Test: `game/src/game/render/ApartmentRenderer.test.ts`

**Step 1: Write renderer contract tests**

Verify the renderer converts every collision rectangle and interaction tile into the expected
pixel coordinates and never emits fractional coordinates.

**Step 2: Implement boot loading**

Preload the apartment map, Yi sheet, Miya sheet, object sprites, item icon and transition
texture. Display a Chinese pixel error panel containing the failed asset key on load error.

**Step 3: Implement the apartment**

Render the full `960×640` background, invisible collision bodies, interaction zones, Yi,
and stage-dependent Miya. Configure camera bounds, integer follow, depth sorting and
keyboard input.

**Step 4: Run tests and build**

Run: `pnpm test -- --run && pnpm typecheck && pnpm build`

Expected: all pass.

**Step 5: Commit**

```bash
git add game/src/game
git commit -m "feat(game): render the playable apartment"
```

### Task 6: Implement interaction, dialogue, quest HUD, inventory, and choices

**Files:**
- Create: `game/src/game/systems/InteractionSystem.ts`
- Create: `game/src/game/systems/DialogueSystem.ts`
- Create: `game/src/game/ui/PixelHud.ts`
- Create: `game/src/game/ui/DialogueBox.ts`
- Create: `game/src/game/ui/InventoryPanel.ts`
- Create: `game/src/game/ui/ChoicePanel.ts`
- Test: `game/src/game/systems/InteractionSystem.test.ts`

**Step 1: Write failing interaction tests**

Cover facing direction, one-tile range, early-jar fallback, no duplicate note,
movement locking, dialogue completion, choice selection and hint timing.

**Step 2: Implement interactions**

Use `InteractionSystem.findTarget(playerTile, facing, state, interactables)`.
Dispatch pure domain events and let the scene render resulting effects.

**Step 3: Implement pixel UI**

Draw the quest strip, four-slot inventory, dialogue box, speaker name, interaction prompt,
three-choice panel, hold-to-open meter and keyboard hints inside Phaser.

**Step 4: Add save checkpoints**

Persist after note acquisition, note reading, choice completion and jar opening start.

**Step 5: Run tests and commit**

Run: `pnpm test -- --run && pnpm typecheck`

```bash
git add game/src/game
git commit -m "feat(game): add act one interactions and pixel UI"
```

### Task 7: Implement the jar transition and completion scene

**Files:**
- Create: `game/src/game/scenes/MemoryTransitionScene.ts`
- Create: `game/src/game/scenes/ActOneCompleteScene.ts`
- Create: `game/src/game/fx/JarMemoryEffect.ts`
- Test: `game/src/game/fx/JarMemoryEffect.test.ts`

**Step 1: Test choice-to-effect mapping**

Verify each choice maps to the approved tint, particle density and audio-filter preset.

**Step 2: Implement the reveal**

Play the final three dialogue lines, swap sealed jar to open jar, lock input, move the camera
one tile toward the jar, overlay hard-edged red particles and steam, then enter the
completion scene.

**Step 3: Implement the completion scene**

Show “冬酿记忆已解锁”, the selected sensory motif, a “重新体验” action and a disabled
“进入冬日酒坊” placeholder until Act Two is connected.

**Step 4: Run tests and commit**

Run: `pnpm test -- --run && pnpm typecheck && pnpm build`

```bash
git add game/src/game
git commit -m "feat(game): complete the open jar transition"
```

### Task 8: Add end-to-end coverage and developer handoff

**Files:**
- Create: `game/e2e/act1.spec.ts`
- Create: `game/README.md`
- Modify: `README.md`
- Modify: `assets/rpg_v2/manifest/assets.manifest.json`

**Step 1: Write the full Playwright path**

Cover start, movement, box, note, inventory, Miya, jar, one sensory choice, hold-to-open,
completion, refresh recovery, and a second sensory choice in a fresh save.

**Step 2: Run all checks**

Run:

```bash
pnpm test -- --run
pnpm typecheck
pnpm build
pnpm exec playwright test
```

Expected: all commands pass with zero failures.

**Step 3: Run the asset verifier**

Expected: dimensions, palette, alpha, tile alignment and manifest references all pass.

**Step 4: Update handoff documentation**

Document install, dev, build, controls, content editing, asset rules, save reset,
test commands and known P1 audio/mobile follow-ups.

**Step 5: Final visual inspection**

Inspect desktop screenshots at 640×360 logical pixels and 1920×1080 display scale.
Confirm no blur, clipping, fractional camera movement, blocked critical path or English
speaker names.

**Step 6: Commit**

```bash
git add game README.md assets/rpg_v2
git commit -m "test(game): verify the complete act one journey"
```
