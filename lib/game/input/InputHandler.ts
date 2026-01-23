import type { InputContext, ActionForContext } from "./config";
import { normalizeKey } from "./config";

type ActionCallback<T extends string = string> = (
  action: T,
  pressed: boolean,
  event: KeyboardEvent,
) => void;

/**
 * Context-specific input handler.
 * Manages action listeners and bindings for a single context.
 */
export class InputHandler<C extends InputContext> {
  readonly context: C;
  private bindings: Record<string, ActionForContext<C>>;
  private actionListeners: Map<
    ActionForContext<C>,
    Set<ActionCallback<ActionForContext<C>>>
  > = new Map();
  private enabled = false;

  constructor(
    context: C,
    defaultBindings: Record<string, ActionForContext<C>>,
  ) {
    this.context = context;
    this.bindings = { ...defaultBindings };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Enable/Disable
  // ─────────────────────────────────────────────────────────────────────────

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Key Processing
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Process a key press. Returns the action if found, null otherwise.
   */
  processKeyDown(
    key: string,
    event: KeyboardEvent,
  ): ActionForContext<C> | null {
    if (!this.enabled) return null;

    const normalizedKey = normalizeKey(key);
    const action = this.bindings[normalizedKey];

    if (action) {
      this.emitAction(action, true, event);
      return action;
    }

    return null;
  }

  processKeyUp(key: string, event: KeyboardEvent): ActionForContext<C> | null {
    if (!this.enabled) return null;

    const normalizedKey = normalizeKey(key);
    const action = this.bindings[normalizedKey];

    if (action) {
      // Emit 'false' for pressed
      this.emitAction(action, false, event);
      return action;
    }

    return null;
  }

  /**
   * Get the action bound to a key (if any).
   */
  getActionForKey(key: string): ActionForContext<C> | null {
    const normalizedKey = normalizeKey(key);
    return this.bindings[normalizedKey] ?? null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Action Subscriptions
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Subscribe to an action. Returns unsubscribe function.
   */
  onAction(
    action: ActionForContext<C>,
    callback: ActionCallback<ActionForContext<C>>,
  ): () => void {
    if (!this.actionListeners.has(action)) {
      this.actionListeners.set(action, new Set());
    }
    this.actionListeners.get(action)!.add(callback);

    return () => {
      this.actionListeners.get(action)?.delete(callback);
    };
  }

  /**
   * Subscribe to multiple actions at once. Returns unsubscribe function.
   */
  onActions(
    handlers: Partial<
      Record<
        ActionForContext<C>,
        (pressed: boolean, event: KeyboardEvent) => void
      >
    >,
  ): () => void {
    const unsubscribes: (() => void)[] = [];

    for (const action of Object.keys(handlers) as ActionForContext<C>[]) {
      const handler = handlers[action];
      if (handler) {
        // Connect the internal callback to the listener's handler
        const unsub = this.onAction(action, (_, pressed, event) =>
          handler(pressed, event),
        );
        unsubscribes.push(unsub);
      }
    }

    return () => unsubscribes.forEach((unsub) => unsub());
  }

  /**
   * Emit an action to all listeners.
   * Public to allow InputManager to emit directly for key repeat.
   */
  emitAction(
    action: ActionForContext<C>,
    pressed: boolean,
    event: KeyboardEvent,
  ): void {
    const listeners = this.actionListeners.get(action);
    if (listeners) {
      listeners.forEach((callback) => callback(action, pressed, event));
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Bindings Management
  // ─────────────────────────────────────────────────────────────────────────

  getBindings(): Record<string, ActionForContext<C>> {
    return { ...this.bindings };
  }

  setBindings(bindings: Record<string, ActionForContext<C>>): void {
    this.bindings = { ...bindings };
  }

  setBinding(key: string, action: ActionForContext<C>): void {
    const normalizedKey = normalizeKey(key);
    this.bindings[normalizedKey] = action;
  }

  removeBinding(key: string): void {
    const normalizedKey = normalizeKey(key);
    delete this.bindings[normalizedKey];
  }

  resetBindings(defaultBindings: Record<string, ActionForContext<C>>): void {
    this.bindings = { ...defaultBindings };
  }

  /**
   * Clear all action listeners.
   */
  clearListeners(): void {
    this.actionListeners.clear();
  }
}
