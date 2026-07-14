// props() splits a plain object into one signal per key — fine-grained
// updates for a record. The card below also churns its DOM four times a
// second, which is exactly when iOS Safari drops synthesized clicks: the
// like button uses ontap, built from raw pointer events, so it still fires.
import { poll, props, update } from "loom";

const post = props(
  {
    title: "Fine-grained by key",
    likes: 0,
    views: 128,
  },
  { label: "post" },
);

const churn = poll(() => new Date().toLocaleTimeString(), 250);

export default (
  <div class="col">
    <div class="scroller" style="padding: 12px 16px; width: 300px">
      <h3 style="margin: 0 0 4px">{post.title}</h3>
      <p class="muted mono">DOM churn: {churn}</p>
      <p class="mono">
        {() => `${post.likes()} likes · ${post.views()} views`}
      </p>
      <button type="button" ontap={() => update(post.likes, (n) => n + 1)}>
        like (ontap)
      </button>
    </div>
    <label class="row">
      Title
      <input
        value={post.title}
        oninput={(event) => post.title(event.currentTarget.value)}
      />
    </label>
    <p class="muted">
      Each key is its own signal — editing the title never touches the likes
      binding.
    </p>
  </div>
);
