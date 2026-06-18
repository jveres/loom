import {
  effect as alienEffect,
  signal as alienSignal,
  endBatch,
  startBatch,
} from "alien-signals";
import { bench, describe } from "vitest";
import {
  batch,
  effect,
  type Fields,
  fields,
  type Stop,
  state,
} from "../src/loom.js";

type Tone = 0 | 1 | 2 | 3 | 4;
type Cell<T> = {
  (): T;
  (value: T): void;
};

interface CardModel {
  id: number;
  headline: number;
  tone: Tone;
  likes: number;
  views: number;
  readers: number;
  trend: number;
  hot: boolean;
  liked: boolean;
  pending: number;
}

type LoomCard = Fields<CardModel>;
type AlienCard = { readonly [K in keyof CardModel]: Cell<CardModel[K]> };

interface CardRef<T> {
  readonly model: T;
  dispose(): void;
}

interface TrafficOp {
  readonly card: number;
  readonly kind: 0 | 1 | 2 | 3;
  readonly amount: number;
  readonly dir: 1 | -1;
}

interface AiOp {
  readonly card: number;
  readonly kind: 0 | 1 | 2 | 3;
  readonly headline: number;
}

const FRAME_COUNT = 120;
const TRAFFIC_WRITES_PER_FRAME = 1_000;
const INITIAL_CARDS = 12;
const MAX_CARDS = 80;
const EDIT_RATE = 180;
const DT = 1 / 60;
const TRAFFIC = makeTrafficPlan();
const AI = makeAiPlan();

let sink = 0;

function consume(value: number): void {
  sink = (sink + value) | 0;
}

describe("loom vs alien-signals", () => {
  bench("loom: full chaos core", () => {
    runLoomChaos();
  });

  bench("loom manual: full chaos core", () => {
    runLoomManualChaos();
  });

  bench("alien native: full chaos core", () => {
    runAlienChaos();
  });
});

function runLoomChaos(): void {
  let nextId = INITIAL_CARDS;
  let cards = Array.from({ length: INITIAL_CARDS }, (_, id) =>
    makeLoomCard(baseCard(id)),
  );
  const structure = state(0);
  const structureView = effect(() => {
    structure();
    consume(cards.length);
  });
  for (let frame = 0; frame < FRAME_COUNT; frame++) {
    batch(() => {
      for (const op of TRAFFIC[frame] as readonly TrafficOp[]) {
        applyLoomTraffic(
          cards[op.card % cards.length] as CardRef<LoomCard>,
          op,
        );
      }
      for (const op of AI[frame] as readonly AiOp[]) {
        if (op.kind === 0) {
          const card = cards[op.card % cards.length] as CardRef<LoomCard>;
          card.model.headline(op.headline);
          card.model.tone(nextTone(card.model.tone()));
        } else if (op.kind === 1) {
          cards = [makeLoomCard(baseCard(nextId++)), ...cards];
          if (cards.length > MAX_CARDS) cards.pop()?.dispose();
          structure(structure() + 1);
        } else if (op.kind === 2) {
          cards = shuffled(cards, op.card);
          structure(structure() + 1);
        } else {
          const card = cards[op.card % cards.length] as CardRef<LoomCard>;
          card.model.hot(!card.model.hot());
        }
      }
    });
  }
  structureView();
  for (const card of cards) card.dispose();
}

function runAlienChaos(): void {
  let nextId = INITIAL_CARDS;
  let cards = Array.from({ length: INITIAL_CARDS }, (_, id) =>
    makeAlienCard(baseCard(id)),
  );
  const structure = alienSignal(0);
  const stopStructure = alienEffect(() => {
    structure();
    consume(cards.length);
  });
  for (let frame = 0; frame < FRAME_COUNT; frame++) {
    startBatch();
    for (const op of TRAFFIC[frame] as readonly TrafficOp[]) {
      applyAlienTraffic(
        cards[op.card % cards.length] as CardRef<AlienCard>,
        op,
      );
    }
    for (const op of AI[frame] as readonly AiOp[]) {
      if (op.kind === 0) {
        const card = cards[op.card % cards.length] as CardRef<AlienCard>;
        card.model.headline(op.headline);
        card.model.tone(nextTone(card.model.tone()));
      } else if (op.kind === 1) {
        cards = [makeAlienCard(baseCard(nextId++)), ...cards];
        if (cards.length > MAX_CARDS) cards.pop()?.dispose();
        structure(structure() + 1);
      } else if (op.kind === 2) {
        cards = shuffled(cards, op.card);
        structure(structure() + 1);
      } else {
        const card = cards[op.card % cards.length] as CardRef<AlienCard>;
        card.model.hot(!card.model.hot());
      }
    }
    endBatch();
  }
  stopStructure();
  for (const card of cards) card.dispose();
}

function runLoomManualChaos(): void {
  let nextId = INITIAL_CARDS;
  let cards = Array.from({ length: INITIAL_CARDS }, (_, id) =>
    makeLoomManualCard(baseCard(id)),
  );
  const structure = state(0);
  const structureView = effect(() => {
    structure();
    consume(cards.length);
  });
  for (let frame = 0; frame < FRAME_COUNT; frame++) {
    batch(() => {
      for (const op of TRAFFIC[frame] as readonly TrafficOp[]) {
        applyLoomTraffic(
          cards[op.card % cards.length] as CardRef<LoomCard>,
          op,
        );
      }
      for (const op of AI[frame] as readonly AiOp[]) {
        if (op.kind === 0) {
          const card = cards[op.card % cards.length] as CardRef<LoomCard>;
          card.model.headline(op.headline);
          card.model.tone(nextTone(card.model.tone()));
        } else if (op.kind === 1) {
          cards = [makeLoomManualCard(baseCard(nextId++)), ...cards];
          if (cards.length > MAX_CARDS) cards.pop()?.dispose();
          structure(structure() + 1);
        } else if (op.kind === 2) {
          cards = shuffled(cards, op.card);
          structure(structure() + 1);
        } else {
          const card = cards[op.card % cards.length] as CardRef<LoomCard>;
          card.model.hot(!card.model.hot());
        }
      }
    });
  }
  structureView();
  for (const card of cards) card.dispose();
}

function makeLoomCard(initial: CardModel): CardRef<LoomCard> {
  const model = fields(initial);
  const views = bindLoomCardViews(model);
  return {
    model,
    dispose() {
      for (const view of views) view();
    },
  };
}

function makeLoomManualCard(initial: CardModel): CardRef<LoomCard> {
  const model: LoomCard = {
    id: state(initial.id),
    headline: state(initial.headline),
    tone: state(initial.tone),
    likes: state(initial.likes),
    views: state(initial.views),
    readers: state(initial.readers),
    trend: state(initial.trend),
    hot: state(initial.hot),
    liked: state(initial.liked),
    pending: state(initial.pending),
  };
  const views = bindLoomCardViews(model);
  return {
    model,
    dispose() {
      for (const view of views) view();
    },
  };
}

function makeAlienCard(initial: CardModel): CardRef<AlienCard> {
  const model: AlienCard = {
    id: alienSignal(initial.id),
    headline: alienSignal(initial.headline),
    tone: alienSignal(initial.tone),
    likes: alienSignal(initial.likes),
    views: alienSignal(initial.views),
    readers: alienSignal(initial.readers),
    trend: alienSignal(initial.trend),
    hot: alienSignal(initial.hot),
    liked: alienSignal(initial.liked),
    pending: alienSignal(initial.pending),
  };
  const stops = bindAlienCardViews(model);
  return {
    model,
    dispose() {
      for (const stop of stops) stop();
    },
  };
}

function bindLoomCardViews(model: LoomCard): Stop[] {
  return [
    effect(() => {
      consume(model.likes() + model.pending());
    }),
    effect(() => {
      consume(model.views());
    }),
    effect(() => {
      consume(model.readers());
    }),
    effect(() => {
      consume(model.trend());
    }),
    effect(() => {
      consume(model.hot() ? 1 : 0);
    }),
    effect(() => {
      consume(model.headline() + model.tone());
    }),
  ];
}

function bindAlienCardViews(model: AlienCard): Array<() => void> {
  return [
    alienEffect(() => {
      consume(model.likes() + model.pending());
    }),
    alienEffect(() => {
      consume(model.views());
    }),
    alienEffect(() => {
      consume(model.readers());
    }),
    alienEffect(() => {
      consume(model.trend());
    }),
    alienEffect(() => {
      consume(model.hot() ? 1 : 0);
    }),
    alienEffect(() => {
      consume(model.headline() + model.tone());
    }),
  ];
}

function applyLoomTraffic(card: CardRef<LoomCard>, op: TrafficOp): void {
  const model = card.model;
  if (op.kind === 0) model.likes(model.likes() + op.amount);
  else if (op.kind === 1) model.views(model.views() + op.amount);
  else if (op.kind === 2)
    model.readers(Math.max(0, model.readers() + op.dir * op.amount));
  else if (model.hot()) model.trend(model.trend() + op.amount);
}

function applyAlienTraffic(card: CardRef<AlienCard>, op: TrafficOp): void {
  const model = card.model;
  if (op.kind === 0) model.likes(model.likes() + op.amount);
  else if (op.kind === 1) model.views(model.views() + op.amount);
  else if (op.kind === 2)
    model.readers(Math.max(0, model.readers() + op.dir * op.amount));
  else if (model.hot()) model.trend(model.trend() + op.amount);
}

function baseCard(id: number): CardModel {
  return {
    id,
    headline: id % 6,
    tone: (id % 5) as Tone,
    likes: 20 + id * 3,
    views: 500 + id * 11,
    readers: id % 40,
    trend: id % 60,
    hot: id % 4 === 0,
    liked: false,
    pending: 0,
  };
}

function nextTone(tone: Tone): Tone {
  return ((tone + 1) % 5) as Tone;
}

function shuffled<T>(items: readonly T[], seed: number): T[] {
  const next = items.slice();
  let value = seed || 1;
  for (let index = next.length - 1; index > 0; index--) {
    value = (value * 1664525 + 1013904223) >>> 0;
    const swap = value % (index + 1);
    const current = next[index] as T;
    next[index] = next[swap] as T;
    next[swap] = current;
  }
  return next;
}

function makeTrafficPlan(): readonly TrafficOp[][] {
  const random = prng(0x1eed);
  return Array.from({ length: FRAME_COUNT }, () =>
    Array.from({ length: TRAFFIC_WRITES_PER_FRAME }, () => {
      const roll = random();
      return {
        card: Math.floor(random() * 10_000),
        kind: roll < 0.5 ? 0 : roll < 0.82 ? 1 : roll < 0.94 ? 2 : 3,
        amount: 1 + Math.floor(random() * 4),
        dir: random() < 0.5 ? 1 : -1,
      };
    }),
  );
}

function makeAiPlan(): readonly AiOp[][] {
  const random = prng(0xa11e);
  let budget = 0;
  return Array.from({ length: FRAME_COUNT }, () => {
    const ops: AiOp[] = [];
    budget += EDIT_RATE * DT;
    while (budget >= 1) {
      budget--;
      const roll = random();
      ops.push({
        card: Math.floor(random() * 10_000),
        kind: roll < 0.55 ? 0 : roll < 0.72 ? 1 : roll < 0.88 ? 2 : 3,
        headline: Math.floor(random() * 6),
      });
    }
    return ops;
  });
}

function prng(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 0x1_0000_0000;
  };
}
