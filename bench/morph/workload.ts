// Streaming-markdown workload for the morph bench: a document that grows block
// by block, with the tail block growing word by word and occasionally "healing"
// (a partial fence re-parsing into a different block type) — the update pattern
// markdown-viewer produces per chunk. Deterministic so every engine morphs the
// exact same sequence of HTML states.

const WORDS =
  "signals propagate through the graph while effects settle and bindings patch only what changed".split(
    " ",
  );

let seed = 7;
function rand(max: number): number {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed % max;
}

function sentence(words: number): string {
  const parts: string[] = [];
  for (let i = 0; i < words; i++) {
    const word = WORDS[rand(WORDS.length)] as string;
    parts.push(
      rand(7) === 0
        ? `<strong>${word}</strong>`
        : rand(7) === 1
          ? `<code>${word}</code>`
          : word,
    );
  }
  return parts.join(" ");
}

// hljs-style span-heavy code block: the expensive tree shape in real renders.
function codeBlock(lines: number): string {
  let out = `<pre><code class="language-ts">`;
  for (let i = 0; i < lines; i++) {
    out += `<span class="line"><span class="kw">const</span> <span class="id">v${i}</span> <span class="op">=</span> <span class="num">${rand(1000)}</span>;</span>\n`;
  }
  return `${out}</code></pre>`;
}

function block(index: number, partial: number): string {
  // partial: 0..2 — how much of the block has streamed in (2 = complete)
  switch (index % 5) {
    case 0:
      return `<h2>Section ${index}</h2>`;
    case 1:
      return `<p>${sentence(8 + partial * 8)}</p>`;
    case 2:
      // the "healing" shape: streams as a paragraph, completes as a code block
      return partial < 2
        ? `<p><code>const v0 = ${partial}</code></p>`
        : codeBlock(6);
    case 3: {
      let items = "";
      for (let i = 0; i <= partial * 2; i++) items += `<li>${sentence(4)}</li>`;
      return `<ul>${items}</ul>`;
    }
    default:
      return `<blockquote><p>${sentence(6 + partial * 4)}</p></blockquote>`;
  }
}

// The chunk sequence: for each of BLOCKS blocks, the document is re-rendered
// with all previous blocks complete and the tail block in 3 growth states.
export function buildChunkStates(blocks: number): string[] {
  seed = 7;
  const complete: string[] = [];
  const states: string[] = [];
  for (let index = 0; index < blocks; index++) {
    const prefix = complete.join("");
    const savedSeed = seed;
    let finalBlock = "";
    for (let partial = 0; partial < 3; partial++) {
      seed = savedSeed; // same tail content across partials, growing prefix-stably
      finalBlock = block(index, partial);
      states.push(prefix + finalBlock);
    }
    complete.push(finalBlock); // byte-identical to the last streamed state
  }
  return states;
}
