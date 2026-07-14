// each() reconciles by key: reorders MOVE nodes (focus, caret and input
// state survive), and a row's own signals patch just their text — type into
// a row, then shuffle. mutate() notifies dependents after in-place surgery.
import { mutate, type State, state } from "loom";
import { each } from "loom/dom";

interface Todo {
  readonly id: number;
  readonly title: State<string>;
  readonly done: State<boolean>;
}

let nextId = 1;
const make = (title: string): Todo => ({
  id: nextId++,
  title: state(title),
  done: state(false),
});

const todos = state<Todo[]>([
  make("Spin up the playground"),
  make("Exercise every sample"),
  make("Ship it"),
]);

const shuffle = () =>
  mutate(todos, (rows) => {
    for (let i = rows.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const a = rows[i];
      const b = rows[j];
      if (a && b) {
        rows[i] = b;
        rows[j] = a;
      }
    }
  });

export default (
  <div class="col">
    <div class="row">
      <button
        type="button"
        onclick={() =>
          mutate(todos, (rows) => {
            rows.unshift(make(`Task ${nextId}`));
          })
        }
      >
        add
      </button>
      <button type="button" onclick={shuffle}>
        shuffle
      </button>
      <button
        type="button"
        onclick={() =>
          mutate(todos, (rows) => {
            rows.pop();
          })
        }
      >
        drop last
      </button>
    </div>
    <ul class="col">
      {each(
        todos,
        (row) => (
          <li class={{ row: true, done: row.done }}>
            <input
              type="checkbox"
              onchange={(event) => row.done(event.currentTarget.checked)}
            />
            <input
              value={row.title}
              oninput={(event) => row.title(event.currentTarget.value)}
            />
            <span class="muted mono">#{row.id}</span>
          </li>
        ),
        (row) => row.id,
      )}
    </ul>
  </div>
);
