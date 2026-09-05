import { lifetime } from "../core/lifetime.js";
import { onUnmount } from "./ownership-base.js";

/** An installation ends on manual stop, abort, or Loom disposal of its owner. */
export function nodeLifetime(owner: Node, signal?: AbortSignal) {
  const life = lifetime(signal);
  if (life.active) life.add(onUnmount(owner, life.stop));
  return life;
}
