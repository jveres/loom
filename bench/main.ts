import { batch, type State, state } from "loom";
import { classed, dispose, h, remove, text } from "loom/dom";

const adjectives = [
  "pretty",
  "large",
  "big",
  "small",
  "tall",
  "short",
  "long",
  "handsome",
  "plain",
  "quaint",
  "clean",
  "elegant",
  "easy",
  "angry",
  "crazy",
  "helpful",
  "mushy",
  "odd",
  "unsightly",
  "adorable",
  "important",
  "inexpensive",
  "cheap",
  "expensive",
  "fancy",
] as const;

const colors = [
  "red",
  "yellow",
  "blue",
  "green",
  "pink",
  "brown",
  "purple",
  "white",
  "black",
  "orange",
] as const;

const nouns = [
  "table",
  "chair",
  "house",
  "bbq",
  "desk",
  "car",
  "pony",
  "cookie",
  "sandwich",
  "burger",
  "pizza",
  "mouse",
  "keyboard",
] as const;

interface DataRow {
  id: number;
  label: string;
}

interface LoomRow {
  readonly id: number;
  readonly label: State<string>;
  readonly selected: State<boolean>;
}

interface VanillaRow {
  id: number;
  label: string;
  element?: HTMLTableRowElement;
  anchor?: HTMLAnchorElement;
}

interface BenchImplementation {
  readonly name: string;
  create(count: number): void;
  append(count: number): void;
  updateEvery10(): void;
  swap(): void;
  selectNth(index: number): void;
  removeNth(index: number): void;
  clear(): void;
}

interface Operation {
  readonly name: string;
  setup(implementation: BenchImplementation): void;
  action(implementation: BenchImplementation): void;
}

interface SplitTiming {
  readonly script: number;
  readonly layout: number;
  readonly total: number;
}

let seed = 1;
let nextId = 1;
let busy = false;

const tbody = getElement("tbody", HTMLTableSectionElement);
const runButton = getElement("run", HTMLButtonElement);
const profileButton = getElement("profile", HTMLButtonElement);
const statusNode = getElement("status", HTMLElement);
const implementationNode = getElement("impl", HTMLElement);
const create1kButton = getElement("c1k", HTMLButtonElement);
const create10kButton = getElement("c10k", HTMLButtonElement);
const updateButton = getElement("upd", HTMLButtonElement);
const swapButton = getElement("swp", HTMLButtonElement);
const clearButton = getElement("clr", HTMLButtonElement);
const resultsBody = getElement("res", HTMLTableSectionElement);
const referenceBody = getElement("refbody", HTMLTableSectionElement);
const noteNode = getElement("note", HTMLElement);

const operations: readonly Operation[] = [
  {
    name: "create 1k",
    setup: (implementation) => implementation.clear(),
    action: (implementation) => implementation.create(1_000),
  },
  {
    name: "create 10k",
    setup: (implementation) => implementation.clear(),
    action: (implementation) => implementation.create(10_000),
  },
  {
    name: "append 1k",
    setup: (implementation) => implementation.create(1_000),
    action: (implementation) => implementation.append(1_000),
  },
  {
    name: "update 10th",
    setup: (implementation) => implementation.create(1_000),
    action: (implementation) => implementation.updateEvery10(),
  },
  {
    name: "swap rows",
    setup: (implementation) => implementation.create(1_000),
    action: (implementation) => implementation.swap(),
  },
  {
    name: "select row",
    setup: (implementation) => implementation.create(1_000),
    action: (implementation) => implementation.selectNth(500),
  },
  {
    name: "remove row",
    setup: (implementation) => implementation.create(1_000),
    action: (implementation) => implementation.removeNth(500),
  },
  {
    name: "clear 1k",
    setup: (implementation) => implementation.create(1_000),
    action: (implementation) => implementation.clear(),
  },
];

let loomRows: LoomRow[] = [];
let loomSelected: LoomRow | undefined;
let loomNodes = new Map<number, HTMLTableRowElement>();

const loomImplementation: BenchImplementation = {
  name: "Loom",
  create(count) {
    clearLoomRows();
    loomRows = buildData(count).map(makeLoomRow);
    loomSelected = undefined;
    mountLoomRows(loomRows);
  },
  append(count) {
    const added = buildData(count).map(makeLoomRow);
    loomRows = [...loomRows, ...added];
    appendLoomRows(added);
  },
  updateEvery10() {
    batch(() => {
      for (let index = 0; index < loomRows.length; index += 10) {
        const row = loomRows[index];
        if (row) row.label(`${row.label()} !!!`);
      }
    });
  },
  swap() {
    const left = loomRows[1];
    const right = loomRows[998];
    const leftNode = left ? loomNodes.get(left.id) : undefined;
    const rightNode = right ? loomNodes.get(right.id) : undefined;
    if (!left || !right || !leftNode || !rightNode) return;

    const afterLeft = leftNode.nextSibling;
    tbody.insertBefore(leftNode, rightNode);
    tbody.insertBefore(rightNode, afterLeft);
    loomRows[1] = right;
    loomRows[998] = left;
  },
  selectNth(index) {
    const row = loomRows[index];
    if (row) selectLoomRow(row);
  },
  removeNth(index) {
    const row = loomRows[index];
    if (!row) return;

    const node = loomNodes.get(row.id);
    if (loomSelected === row) loomSelected = undefined;
    if (node) remove(node);
    loomNodes.delete(row.id);
    loomRows.splice(index, 1);
  },
  clear() {
    clearLoomRows();
  },
};

let vanillaRows: VanillaRow[] = [];
let vanillaSelected: VanillaRow | undefined;

const vanillaImplementation: BenchImplementation = {
  name: "Vanilla",
  create(count) {
    vanillaRows = buildData(count).map(makeVanillaRow);
    vanillaSelected = undefined;
    mountVanillaRows();
  },
  append(count) {
    const added = buildData(count).map(makeVanillaRow);
    const fragment = document.createDocumentFragment();
    for (const row of added) fragment.append(renderVanillaRow(row));
    vanillaRows = [...vanillaRows, ...added];
    tbody.append(fragment);
  },
  updateEvery10() {
    for (let index = 0; index < vanillaRows.length; index += 10) {
      const row = vanillaRows[index];
      if (!row) continue;
      row.label = `${row.label} !!!`;
      if (row.anchor) row.anchor.textContent = row.label;
    }
  },
  swap() {
    const left = vanillaRows[1];
    const right = vanillaRows[998];
    const leftElement = left?.element;
    const rightElement = right?.element;
    if (!left || !right || !leftElement || !rightElement) return;

    const afterLeft = leftElement.nextSibling;
    tbody.insertBefore(leftElement, rightElement);
    tbody.insertBefore(rightElement, afterLeft);
    vanillaRows[1] = right;
    vanillaRows[998] = left;
  },
  selectNth(index) {
    const row = vanillaRows[index];
    if (row) selectVanillaRow(row);
  },
  removeNth(index) {
    const row = vanillaRows[index];
    if (!row) return;

    row.element?.remove();
    vanillaRows = vanillaRows.filter((item) => item !== row);
    if (vanillaSelected === row) vanillaSelected = undefined;
  },
  clear() {
    tbody.textContent = "";
    vanillaRows = [];
    vanillaSelected = undefined;
  },
};

runButton.addEventListener("click", () => void runBenchmark());
profileButton.addEventListener("click", () => void profilePatchLayout());
create1kButton.addEventListener("click", () =>
  loomImplementation.create(1_000),
);
create10kButton.addEventListener("click", () =>
  loomImplementation.create(10_000),
);
updateButton.addEventListener("click", () =>
  loomImplementation.updateEvery10(),
);
swapButton.addEventListener("click", () => loomImplementation.swap());
clearButton.addEventListener("click", () => loomImplementation.clear());
implementationNode.textContent = "Loom (manual)";

function makeLoomRow(row: DataRow): LoomRow {
  return {
    id: row.id,
    label: state(row.label),
    selected: state(false),
  };
}

function makeVanillaRow(row: DataRow): VanillaRow {
  return { id: row.id, label: row.label };
}

function renderLoomRow(row: LoomRow): HTMLTableRowElement {
  const tableRow = h("tr", {
    class: classed("danger", row.selected),
  });
  tableRow.setAttribute("data-loom-key", String(row.id));
  loomNodes.set(row.id, tableRow);

  const idCell = h("td", { class: "col-md-1" }, String(row.id));
  const labelCell = h("td", { class: "col-md-4" });
  const labelLink = h("a");
  labelLink.append(text(row.label));
  labelCell.append(labelLink);

  const removeCell = h("td", { class: "col-md-1" });
  const removeLink = h("a", { class: "remove" }, "x");
  removeCell.append(removeLink);
  const padCell = h("td", { class: "col-md-6" });

  tableRow.append(idCell, labelCell, removeCell, padCell);
  labelLink.addEventListener("click", () => selectLoomRow(row));
  removeLink.addEventListener("click", () =>
    loomImplementation.removeNth(loomRows.indexOf(row)),
  );
  return tableRow;
}

function renderVanillaRow(row: VanillaRow): HTMLTableRowElement {
  const tableRow = document.createElement("tr");
  tableRow.setAttribute("data-id", String(row.id));
  row.element = tableRow;

  const idCell = document.createElement("td");
  idCell.className = "col-md-1";
  idCell.textContent = String(row.id);

  const labelCell = document.createElement("td");
  labelCell.className = "col-md-4";
  const labelLink = document.createElement("a");
  labelLink.textContent = row.label;
  row.anchor = labelLink;
  labelCell.append(labelLink);

  const removeCell = document.createElement("td");
  removeCell.className = "col-md-1";
  const removeLink = document.createElement("a");
  removeLink.className = "remove";
  removeLink.textContent = "x";
  removeCell.append(removeLink);

  const padCell = document.createElement("td");
  padCell.className = "col-md-6";

  tableRow.append(idCell, labelCell, removeCell, padCell);
  labelLink.addEventListener("click", () => selectVanillaRow(row));
  removeLink.addEventListener("click", () =>
    vanillaImplementation.removeNth(vanillaRows.indexOf(row)),
  );
  return tableRow;
}

function selectLoomRow(row: LoomRow): void {
  if (loomSelected === row) return;
  batch(() => {
    loomSelected?.selected(false);
    row.selected(true);
  });
  loomSelected = row;
}

function selectVanillaRow(row: VanillaRow): void {
  vanillaSelected?.element?.classList.remove("danger");
  row.element?.classList.add("danger");
  vanillaSelected = row;
}

function mountVanillaRows(): void {
  tbody.textContent = "";
  const fragment = document.createDocumentFragment();
  for (const row of vanillaRows) fragment.append(renderVanillaRow(row));
  tbody.append(fragment);
}

function mountLoomRows(rows: readonly LoomRow[]): void {
  tbody.textContent = "";
  loomNodes = new Map();
  appendLoomRows(rows);
}

function appendLoomRows(rows: readonly LoomRow[]): void {
  const fragment = document.createDocumentFragment();
  for (const row of rows) fragment.append(renderLoomRow(row));
  tbody.append(fragment);
}

function clearLoomRows(): void {
  dispose(tbody);
  tbody.textContent = "";
  loomRows = [];
  loomSelected = undefined;
  loomNodes = new Map();
}

function buildData(count: number): DataRow[] {
  const rows: DataRow[] = new Array<DataRow>(count);
  for (let index = 0; index < count; index++) {
    rows[index] = {
      id: nextId++,
      label: `${pick(adjectives)} ${pick(colors)} ${pick(nouns)}`,
    };
  }
  return rows;
}

function pick(values: readonly string[]): string {
  return values[random(values.length)] ?? values[0] ?? "";
}

function random(max: number): number {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed % max;
}

async function runBenchmark(): Promise<void> {
  if (busy) return;
  busy = true;
  setButtonsDisabled(true);
  loomImplementation.clear();
  vanillaImplementation.clear();
  await afterPaint();

  const loom = await runSuite(loomImplementation, setStatus);
  loomImplementation.clear();
  await afterPaint();

  const vanilla = await runSuite(vanillaImplementation, setStatus);
  vanillaImplementation.clear();
  renderResults(loom, vanilla);
  setStatus("done");
  setButtonsDisabled(false);
  busy = false;
}

async function profilePatchLayout(): Promise<void> {
  if (busy) return;
  busy = true;
  setButtonsDisabled(true);
  loomImplementation.clear();
  await afterPaint();

  const split = await runSplitSuite(setStatus);
  loomImplementation.clear();
  renderSplitResults(split);
  setStatus("profile done");
  setButtonsDisabled(false);
  busy = false;
}

async function runSuite(
  implementation: BenchImplementation,
  status: (message: string) => void,
): Promise<Map<string, number>> {
  const results = new Map<string, number>();
  for (const operation of operations) {
    status(`${implementation.name} - ${operation.name}`);
    results.set(
      operation.name,
      await timeOperation(
        () => operation.setup(implementation),
        () => operation.action(implementation),
      ),
    );
  }
  implementation.clear();
  await afterPaint();
  return results;
}

async function runSplitSuite(
  status: (message: string) => void,
): Promise<Map<string, SplitTiming>> {
  const results = new Map<string, SplitTiming>();
  for (const operation of operations) {
    status(`Loom split - ${operation.name}`);
    results.set(
      operation.name,
      await timeSplit(
        () => operation.setup(loomImplementation),
        () => operation.action(loomImplementation),
      ),
    );
  }
  loomImplementation.clear();
  await afterPaint();
  return results;
}

async function timeOperation(
  setup: () => void,
  action: () => void,
  runs = 5,
): Promise<number> {
  const times: number[] = [];
  for (let index = 0; index < runs + 1; index++) {
    setup();
    await afterPaint();
    const start = performance.now();
    action();
    await afterPaint();
    if (index > 0) times.push(performance.now() - start);
  }
  return median(times);
}

async function timeSplit(
  setup: () => void,
  action: () => void,
  runs = 7,
): Promise<SplitTiming> {
  const script: number[] = [];
  const layout: number[] = [];
  for (let index = 0; index < runs + 1; index++) {
    setup();
    await afterPaint();

    const scriptStart = performance.now();
    action();
    const scriptEnd = performance.now();
    void tbody.offsetHeight;
    const layoutEnd = performance.now();
    await afterPaint();

    if (index > 0) {
      script.push(scriptEnd - scriptStart);
      layout.push(layoutEnd - scriptEnd);
    }
  }

  const scriptMedian = median(script);
  const layoutMedian = median(layout);
  return {
    script: scriptMedian,
    layout: layoutMedian,
    total: scriptMedian + layoutMedian,
  };
}

function renderResults(
  loom: ReadonlyMap<string, number>,
  vanilla: ReadonlyMap<string, number>,
): void {
  const rows = operations.map((operation) => {
    const loomTime = requiredResult(loom, operation.name);
    const vanillaTime = requiredResult(vanilla, operation.name);
    const ratio = loomTime / vanillaTime;
    return `<tr><td>${operation.name}</td><td>${format(loomTime)}</td><td>${format(
      vanillaTime,
    )}</td><td class="ratio ${ratioClass(ratio)}">${ratio.toFixed(
      2,
    )}x</td></tr>`;
  });
  const meanRatio = Math.exp(
    operations.reduce((sum, operation) => {
      const loomTime = requiredResult(loom, operation.name);
      const vanillaTime = requiredResult(vanilla, operation.name);
      return sum + Math.log(loomTime / vanillaTime);
    }, 0) / operations.length,
  );

  resultsBody.innerHTML = `<tr><th>operation</th><th>Loom</th><th>Vanilla</th><th>Loom/van</th></tr>${rows.join(
    "",
  )}<tr><td><b>geo-mean ratio</b></td><td></td><td></td><td class="ratio ${ratioClass(
    meanRatio,
  )}"><b>${meanRatio.toFixed(2)}x</b></td></tr>`;
  referenceBody.innerHTML =
    "<tr><th>published slowdown vs vanilla</th><th></th></tr>" +
    "<tr><td>Solid</td><td>~1.05-1.15x</td></tr>" +
    "<tr><td>Svelte / Vue</td><td>~1.1-1.4x</td></tr>" +
    "<tr><td>Preact / Angular</td><td>~1.4-1.6x</td></tr>" +
    "<tr><td>React</td><td>~1.6-2.0x</td></tr>";
  noteNode.innerHTML =
    "Loom vs a hand-written vanilla keyed baseline on this machine. " +
    "The published rows are indicative ranges from js-framework-benchmark; " +
    "compare ratios, not absolute milliseconds.";
}

function renderSplitResults(split: ReadonlyMap<string, SplitTiming>): void {
  const rows = operations.map((operation) => {
    const timing = requiredSplit(split, operation.name);
    const total = timing.total || 1;
    const scriptPercent = (timing.script / total) * 100;
    const layoutPercent = (timing.layout / total) * 100;
    return `<tr><td>${operation.name}</td><td>${format(
      timing.script,
    )}</td><td>${format(timing.layout)}</td><td>${format(
      timing.total,
    )}</td><td>${scriptPercent.toFixed(0)}% / ${layoutPercent.toFixed(
      0,
    )}%</td></tr>`;
  });

  resultsBody.innerHTML = `<tr><th>operation</th><th>Loom script</th><th>forced layout</th><th>total</th><th>script/layout</th></tr>${rows.join(
    "",
  )}`;
  referenceBody.innerHTML = "";
  noteNode.innerHTML =
    "Patch/layout mode times Loom synchronous work, then reads tbody.offsetHeight " +
    "to force style and layout. If Loom script dominates, reconciliation is the " +
    "bottleneck. If forced layout dominates, browser layout is.";
}

function requiredResult(
  results: ReadonlyMap<string, number>,
  name: string,
): number {
  const value = results.get(name);
  if (value === undefined) throw new Error(`Missing result for ${name}.`);
  return value;
}

function requiredSplit(
  results: ReadonlyMap<string, SplitTiming>,
  name: string,
): SplitTiming {
  const value = results.get(name);
  if (value === undefined) throw new Error(`Missing split result for ${name}.`);
  return value;
}

function ratioClass(value: number): string {
  if (value <= 1.3) return "good";
  if (value <= 2) return "ok";
  return "bad";
}

function format(value: number): string {
  return value.toFixed(1);
}

function median(values: number[]): number {
  values.sort((left, right) => left - right);
  return values[Math.floor(values.length / 2)] ?? 0;
}

function afterPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      const channel = new MessageChannel();
      channel.port1.onmessage = () => {
        channel.port1.close();
        channel.port2.close();
        resolve();
      };
      channel.port2.postMessage(undefined);
    });
  });
}

function setStatus(message: string): void {
  statusNode.textContent = message;
}

function setButtonsDisabled(disabled: boolean): void {
  runButton.disabled = disabled;
  profileButton.disabled = disabled;
}

function getElement<T extends HTMLElement>(id: string, ctor: { new (): T }): T {
  const element = document.getElementById(id);
  if (!(element instanceof ctor)) {
    throw new Error(`Missing #${id}.`);
  }
  return element;
}
