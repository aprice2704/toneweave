# Toneweave

**Repository:** `github.com/aprice2704/toneweave`

Toneweave is a 2D kinetic musical construction toy.

It is not primarily a game, sequencer, DAW, or conventional modular synthesizer. The user constructs visible networks in which coloured beads move between nodes. The geometry and physical behaviour of the network directly create the music.

The intended experience is closer to a **kinetic musical sculpture** or **Zen musical garden** than to an instrument control panel.

The default result should tend toward sparse, soothing, contemplative sound rather than frenetic output.

---

## 1. Central Design Law

> **Anything that changes the music should preferably have a visible physical analogue in the network.**

This is the main filter for new features.

Examples:

- link length changes timing because beads physically take longer to travel;
- bead colour determines pitch;
- bead radius determines strike strength / volume;
- beads visibly touch nodes when triggering them;
- racks visibly contain their musical sequence;
- an ostinato should visibly circulate while active rather than merely having a hidden `repeat=true` property.

Prefer visible spatial mechanisms over hidden numerical configuration.

---

## 2. Basic Musical Model

### Beads

A bead is a moving musical event.

Current properties:

- **colour = pitch**
- **radius = strike strength / volume**
- constant movement speed

A larger bead therefore:

1. is visibly larger;
2. collides with a destination slightly earlier because its edge reaches the node sooner;
3. strikes the target more strongly;
4. sounds louder.

This accidental physical coherence is desirable.

### Links

Links are directed.

Beads travel along links at a **constant world-space speed**.

Therefore:

> **link length = delay**

Moving two nodes farther apart increases the musical delay between them.

There is deliberately no abstract delay parameter for ordinary links.

### Automatic broadcast

When a node emits an event, it sends a bead down **every outgoing link**.

This has proved intuitive and should remain the default law.

Branching music is created simply by drawing additional outgoing links.

Special nodes may later provide selective or alternating routing, but ordinary nodes broadcast.

---

## 3. Graph Rules

The graph may contain loops because larger feedback structures are musically useful.

However:

- self-link `A → A` is forbidden;
- immediate reciprocal loops `A → B → A` are forbidden;
- loops through one or more intermediate nodes are allowed, e.g. `A → B → C → A`.

The forbidden two-node loop was discovered experimentally because it creates a trivial ping-pong oscillator with little musical value and potentially explosive traffic.

---

## 4. Current Node Types

### Source

Autonomously emits beads at an interval.

Current default properties include:

- colour;
- radius;
- emission period.

Future inspector controls should expose these visually and sparingly.

### Bell

Produces sound when struck.

The bead supplies:

- pitch through colour;
- volume / strike strength through radius.

The Bell supplies:

- **voice / instrument character**.

Current planned/implemented calm voice set:

- Temple Bell
- Singing Bowl
- Glass Chime
- Wood
- Soft Pluck

Colour and instrument voice must remain orthogonal.

For example, a blue bead may strike either a bowl, glass chime, wooden block, etc.

### Painter

Changes bead colour while preserving the rest of the event.

Because colour is pitch, this is effectively a visible pitch-transform node.

### Rack

Contains a visible sequence of coloured beads.

When triggered, it emits that stored sequence once.

The rack is intended eventually to support direct editing of:

- bead colours;
- bead radii;
- bead order;
- possibly physical bead spacing.

The rack should remain visibly recognisable as a container holding its sequence.

---

## 5. Near-Term Node: Ostinato

An **ostinato** is distinct from a Rack.

### Rack

`trigger → emit stored pattern once`

### Ostinato

`trigger → activate repeating stored pattern`

The visual form should make repetition physically legible.

Preferred concept:

- stored beads visibly circulate inside the node while active;
- emitted notes correspond to that circulation;
- stopping the ostinato visibly stops the internal motion.

Questions still open:

- Does another trigger restart it?
- Toggle it?
- Layer another copy?
- Can another event explicitly stop it?
- Can incoming colour transpose or transform the stored pattern?
- Should ostinato bead spacing determine rhythm?

Avoid solving these with invisible mode flags if a visible mechanism can express them.

---

## 6. Rack Presets

The next desired feature is **pre-canned rack patterns**.

The goal is not a large musical library. It is to give users immediately pleasant material they can drop into a network and modify.

Presets should favour short motifs that remain attractive under repetition.

Potential initial set:

- **Three Stones** — simple three-note rising/falling motif
- **Temple Steps** — slow ascending pattern
- **Glass Drops** — sparse high-register motif
- **Pendulum** — alternating two-note figure
- **Five Pebbles** — five-note symmetric pattern
- **Phase Seed** — short motif designed to work well in loops
- **Quiet Arpeggio** — restrained four-note broken chord
- **Pulse** — repeated note with varying bead radii

Names should evoke the Toneweave aesthetic rather than music-theory terminology where possible.

Presets should simply initialise ordinary rack contents. They must not become special runtime entities.

The user should be able to choose a preset and then edit its beads normally.

---

## 7. Sound Aesthetic

Default sound should lean toward:

- Buddhist / temple bells;
- singing bowls;
- glass;
- wood;
- soft plucked strings;
- subdued resonances;
- long but controlled decay.

Avoid by default:

- harsh synthesizer timbres;
- loud attacks;
- excessive percussion;
- dense event rates;
- casino-style audio feedback.

The system should make it easier to produce something pleasant than something obnoxious.

This is a default bias, not a hard restriction.

---

## 8. Interaction Model

### Node dragging

Nodes are draggable.

Dragging changes link geometry in real time and therefore changes musical timing.

This is already one of the strongest interactions in the prototype.

### Node strike

A bead triggers a node when the **edge of the bead physically touches the node boundary**, not when its centre reaches the node centre.

This applies geometrically along the incoming trajectory.

Nodes visibly pulse when struck.

### Selection

Nodes can be selected.

A selected node may expose relevant controls in the inspector.

Links can also be selected.

### Deletion

Both nodes and links can be deleted.

Deleting a node also removes:

- incident links;
- beads travelling on those links.

### Bell voice selection

The Bell inspector should use directly visible voice choices rather than a fragile native dropdown.

Current desired choices:

- Temple Bell
- Singing Bowl
- Glass Chime
- Wood
- Soft Pluck

---

## 9. UI Stability Law

The simulation redraws frequently.

Persistent interface controls must **not** be recreated on every animation frame.

Earlier bugs occurred because:

- dragged SVG elements were destroyed during pointer capture;
- links disappeared between pointer-down and click;
- inspector dropdowns were destroyed while being opened.

The general lesson:

> **High-frequency simulation rendering must not destroy active interaction state.**

Where practical, simulation graphics and ordinary UI should have separate update lifetimes.

---

## 10. UI Layout QoL

Current issue:

When a node is selected and its inspector grows, the right-hand UI changes height and nearby panels jump.

Desired fix:

- reserve a stable inspector region;
- selecting different node types should not shift the surrounding layout dramatically;
- controls may change within the reserved region.

Toneweave should feel physically calm even at the UI level.

---

## 11. Safety / Runaway Protection

Musical loops are allowed, so the runtime must tolerate pathological graphs.

Current safety concepts:

- maximum number of moving beads;
- maximum strikes per node per second;
- maximum number of pending scheduled events.

When a limit is reached:

- do not crash;
- do not invalidate the whole network;
- drop excess work;
- display a concise status message.

This is deliberately **fail-soft**.

A musical sculpture should degrade gracefully rather than melt the browser.

---

## 12. Current Technical Architecture

Toneweave deliberately begins with minimal machinery.

### Server

Go HTTP server.

Static frontend files are embedded into the Go binary with `embed`.

Run approximately as:

```bash
go run . -port 8097
```

The port is configurable with `-port`.

### Frontend

Plain browser technologies:

- HTML
- CSS
- JavaScript modules
- SVG for the graph
- Web Audio API for sound

No framework is currently justified.

### Current frontend modules

Approximate responsibility split:

```text
web/
    index.html
    style.css
    main.js
    audio.js
    sounds.js
    inspector.js
```

Responsibilities:

- `main.js` — graph state, simulation and interaction
- `audio.js` — Web Audio synthesis
- `sounds.js` — voice definitions
- `inspector.js` — selected-node property UI
- `style.css` — presentation
- `index.html` — shell/layout

Further decomposition is expected as behaviour grows.

---

## 13. File Discipline

Repository changes are applied through Appy.

Toneweave follows the same whole-file patch discipline:

- no partial/fuzzy replacement patches;
- create / overwrite / delete whole files;
- files should remain **under 250 lines**;
- if a file approaches that size, split by responsibility;
- avoid giant multifunction frontend files.

This is both an Appy requirement and a deliberate Toneweave engineering habit.

---

## 14. Development Workflow

Repository root is used as the Appy workspace.

Typical cycle:

1. receive armored Appy patch;
2. copy patch;
3. click Toneweave in the Appy extension;
4. inspect/run;
5. commit when appropriate.

GitHub repository:

```text
github.com/aprice2704/toneweave
```

Git uses SSH.

---

## 15. Live Development

Air is used to rebuild/restart the Go server.

Because Toneweave embeds `web/*` into the binary, **changes to JavaScript/CSS/HTML require a Go rebuild** before they appear.

Air therefore needs to watch frontend extensions in addition to `.go`.

A repository `.air.toml` should explicitly include:

```text
go, html, js, css
```

Air also supports a development proxy which can reload the browser after successful rebuilds.

This should be configured as development convenience rather than adding live-reload behaviour to the Toneweave production server.

---

## 16. Current Known Issues / Next QoL

### Air

Current observation:

Air appears not to rebuild for every frontend edit and sometimes has to be manually bounced.

Likely cause is incomplete watch configuration for embedded `js/css/html` assets.

Add a repository `.air.toml`.

### Inspector layout jump

Selecting a Bell causes the inspector contents to grow and shifts the sidebar.

Reserve stable space for the inspector.

### Rack presets

Add a small set of pleasant preset motifs.

Preset selection should populate normal editable rack data.

---

## 17. Immediate Development Order

Recommended next steps:

1. **Fix Air configuration**
   - watch Go + embedded web assets;
   - optionally enable Air browser-reload proxy.

2. **Stabilise inspector layout**
   - reserve enough space so Bell controls do not jump the sidebar.

3. **Rack presets**
   - several calm short patterns;
   - preset choice in Rack inspector;
   - selected preset simply replaces rack bead data.

4. **Editable rack**
   - colour;
   - bead order;
   - radius;
   - eventually spacing.

5. **Source inspector**
   - colour;
   - radius;
   - emission cadence.

6. **Ostinato node**

7. **Save/load network JSON**

Do not prematurely expand the node taxonomy.

Toneweave is already fun with very few primitives. New primitives should earn their place.

---

## 18. Product Character

Toneweave should feel:

- exploratory;
- gentle;
- tactile;
- legible;
- slightly toy-like;
- capable of surprisingly sophisticated musical structures.

There is no score.

There is no win condition.

The reward is:

> “What happens if I connect this to that?”

A successful Toneweave network is something the user may simply leave running because it is pleasant to watch and hear.

The network itself is the score.