import { type Read, state } from "../loom.js";

type Subscription = { stores: ReadonlySet<string>; notify: () => void };
const buses = new Map<string, NotificationBus>();

// Consumers may throw from a reactive listener. One listener must not prevent
// other connections from observing a committed write or affect its outcome.
function isolated(run: () => void): void {
  try {
    run();
  } catch {
    /* The observer owns its error; commit is already durable. */
  }
}

export class NotificationBus {
  readonly mode = state<"broadcast" | "manual">("manual");
  private channel: BroadcastChannel | undefined;
  private owners = 0;
  private listeners = new Set<Subscription>();
  private pending = new Set<string>();
  private all = false;
  private queued = false;
  private readonly sender = `${Date.now()}:${Math.random()}`;
  private readonly resume = () => this.invalidate();
  private readonly visible = () => {
    if (document.visibilityState === "visible") this.invalidate();
  };

  constructor(readonly name: string) {
    try {
      this.channel = new BroadcastChannel(`loom/db:${name}`);
      this.mode("broadcast");
      this.channel.onmessageerror = () => this.disable();
      this.channel.onmessage = (event) => {
        const data: unknown = event.data;
        if (!data || typeof data !== "object") return;
        const message = data as Record<string, unknown>;
        if (
          message["protocol"] !== 1 ||
          message["database"] !== name ||
          message["sender"] === this.sender ||
          typeof message["sender"] !== "string" ||
          typeof message["version"] !== "number" ||
          !Array.isArray(message["stores"]) ||
          !message["stores"].every((value) => typeof value === "string")
        )
          return;
        // Native versionchange handles schema recovery. Even a delayed message
        // from an older connection remains a valid reread hint.
        this.invalidate(message["stores"]);
      };
    } catch {
      this.disable();
    }
    if (typeof window !== "undefined") {
      window.addEventListener("pageshow", this.resume);
      window.addEventListener("focus", this.resume);
      document.addEventListener("visibilitychange", this.visible);
    }
  }

  retain(): () => void {
    this.owners++;
    let live = true;
    return () => {
      if (!live) return;
      live = false;
      if (--this.owners !== 0) return;
      this.closeChannel();
      if (typeof window !== "undefined") {
        window.removeEventListener("pageshow", this.resume);
        window.removeEventListener("focus", this.resume);
        document.removeEventListener("visibilitychange", this.visible);
      }
      this.listeners.clear();
      buses.delete(this.name);
    };
  }

  subscribe(stores: ReadonlySet<string>, notify: () => void): () => void {
    const listener = { stores, notify };
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  invalidate(stores?: readonly string[]): void {
    if (stores === undefined) this.all = true;
    else for (const name of stores) this.pending.add(name);
    if (this.queued) return;
    this.queued = true;
    queueMicrotask(() => {
      this.queued = false;
      const all = this.all;
      const changed = this.pending;
      this.all = false;
      this.pending = new Set();
      for (const listener of [...this.listeners]) {
        if (
          this.listeners.has(listener) &&
          (all || [...listener.stores].some((name) => changed.has(name)))
        )
          isolated(listener.notify);
      }
    });
  }

  commit(version: number, stores: readonly string[]): void {
    this.invalidate(stores);
    try {
      this.channel?.postMessage({
        protocol: 1,
        database: this.name,
        version,
        sender: this.sender,
        stores,
      });
    } catch {
      this.disable();
    }
  }

  private closeChannel(): void {
    try {
      this.channel?.close();
    } catch {
      /* Failed transport is already unusable. */
    }
    this.channel = undefined;
  }

  private disable(): void {
    this.closeChannel();
    isolated(() => this.mode("manual"));
  }
}

export function notifications(name: string): NotificationBus {
  let bus = buses.get(name);
  if (!bus) {
    bus = new NotificationBus(name);
    buses.set(name, bus);
  }
  return bus;
}

export function modeRead(bus: NotificationBus): Read<"broadcast" | "manual"> {
  return () => bus.mode();
}
