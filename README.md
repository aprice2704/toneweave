# Toneweave

A small kinetic musical construction toy.

Balls move through visible links at constant speed, so **link length is delay**.
Nodes emit, transform, redirect, or sonify the balls.

The working design law is:

> Anything that changes the music should preferably have a visible physical analogue in the network.

## Run

Requires Go 1.23+.

```bash
go run .
```

Then open:

```text
http://localhost:8080
```

The web UI is embedded into the Go binary, so there is no separate runtime dependency
and no Python server lurking under the floorboards.

## Current nodes

- **Source** — slowly emits coloured balls.
- **Bell** — plays a soft pitched bell when struck.
- **Painter** — changes ball colour.
- **Rack** — contains a visible short sequence and emits it when triggered.

## Next node: Ostinato

An **ostinato** node should contain a visible bead sequence like the rack, but repeat it.

Questions to settle in the implementation:

- trigger once → repeat indefinitely, or repeat N times?
- re-trigger → restart, layer, or toggle?
- how does it stop?
- does physical bead spacing encode intra-pattern timing?
- can the incoming ball's colour transpose / recolour / select a stored pattern?

The most Toneweave-like answer will be the one where those controls remain spatial and visible.

## Controls

- Click **Enable sound** once to unlock Web Audio.
- Drag blocks to change link length and therefore travel time.
- Click one block, then another, to create a directed link.
- Arrow keys move a focused block; Shift + arrow moves farther.
- Click **Pause** to freeze the sculpture.

## Near-term experiments

1. Editable rack contents.
2. Ostinato node.
3. Delete/select tools.
4. Splitter / alternator node.
5. Sink node.
6. Save/load graph as JSON.
7. Better bell / bowl voices.
8. Visible node pulse on activation.
9. Link direction affordance without visual clutter.
