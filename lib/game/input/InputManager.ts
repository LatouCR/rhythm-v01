import { InputHandler } from "./InputHandler";
import {
  type InputContext,
  type MenuAction,
  type GameAction,
  type ResultsAction,
  INPUT_CONFIG,
  normalizeKey,
  BindingsFor,
} from "./config";

const STORAGE_KEY = "rhythm-v01-input-bindings";

type KeyStateCallback = (pressedKeys: Set<string>) => void;

interface KeyRepeatSettings {
  enabled: boolean;
  initialDelay: number;
  repeatRate: number;
}

type Handlers = {
  menu: InputHandler<"menu">;
  game: InputHandler<"game">;
  results: InputHandler<"results">;
};

/**
 * Singleton manager for all input handling.
 * Creates and manages context-specific handlers.
 */
export class InputManager {
  private static instance: InputManager | null = null;

  private handlers: Handlers;
  private activeContext: InputContext = "menu";
  private pressedKeys: Set<string> = new Set();
  private keyStateListeners: Set<KeyStateCallback> = new Set();

  private keyRepeat: KeyRepeatSettings = {
    enabled: true,
    initialDelay: 400,
    repeatRate: 50,
  };

  private repeatTimers: Map<
    string,
    {
      initialTimer: ReturnType<typeof setTimeout> | null;
      repeatTimer: ReturnType<typeof setInterval> | null;
    }
  > = new Map();

  private boundHandleKeyDown: (e: KeyboardEvent) => void;
  private boundHandleKeyUp: (e: KeyboardEvent) => void;
  private boundHandleBlur: () => void;
  private boundHandleVisibility: () => void;
  private initialized = false;

  private constructor() {
    // Create handlers for all contexts (factory built-in)
    this.handlers = {
      menu: new InputHandler("menu", {
        ...INPUT_CONFIG.menu.defaultBindings,
      } as Record<string, MenuAction>),
      game: new InputHandler("game", {
        ...INPUT_CONFIG.game.defaultBindings,
      } as Record<string, GameAction>),
      results: new InputHandler("results", {
        ...INPUT_CONFIG.results.defaultBindings,
      } as Record<string, ResultsAction>),
    };

    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    this.boundHandleKeyUp = this.handleKeyUp.bind(this);
    this.boundHandleBlur = this.handleBlur.bind(this);
    this.boundHandleVisibility = this.handleVisibilityChange.bind(this);
  }

  static getInstance(): InputManager {
    if (!InputManager.instance) {
      InputManager.instance = new InputManager();
    }
    return InputManager.instance;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Initialize the input manager and attach event listeners.
   * Call this once when the app starts.
   */
  init(): void {
    if (this.initialized || typeof window === "undefined") return;

    this.loadUserBindings();

    window.addEventListener("keydown", this.boundHandleKeyDown);
    window.addEventListener("keyup", this.boundHandleKeyUp);
    window.addEventListener("blur", this.boundHandleBlur);
    document.addEventListener("visibilitychange", this.boundHandleVisibility);

    // Enable the initial context
    this.handlers[this.activeContext].enable();

    this.initialized = true;
  }

  /**
   * Cleanup event listeners.
   */
  dispose(): void {
    if (!this.initialized || typeof window === "undefined") return;

    window.removeEventListener("keydown", this.boundHandleKeyDown);
    window.removeEventListener("keyup", this.boundHandleKeyUp);
    window.removeEventListener("blur", this.boundHandleBlur);
    document.removeEventListener(
      "visibilitychange",
      this.boundHandleVisibility,
    );

    this.stopAllKeyRepeats();
    this.pressedKeys.clear();
    this.initialized = false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Handler Access
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get a handler for a specific context.
   */
  getHandler<C extends InputContext>(context: C): InputHandler<C> {
    return this.handlers[context] as InputHandler<C>;
  }

  /**
   * Get the currently active handler.
   */
  getActiveHandler(): InputHandler<InputContext> {
    return this.handlers[this.activeContext];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Context Management
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Switch to a different input context.
   * Disables the previous handler and enables the new one.
   */
  setContext(context: InputContext): void {
    if (context === this.activeContext) return;

    // Disable current handler
    this.handlers[this.activeContext].disable();

    // Clear state
    this.stopAllKeyRepeats();
    this.pressedKeys.clear();
    this.notifyKeyStateListeners();

    // Enable new handler
    this.activeContext = context;
    this.handlers[context].enable();
  }

  getContext(): InputContext {
    return this.activeContext;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Key State
  // ─────────────────────────────────────────────────────────────────────────

  isKeyPressed(key: string): boolean {
    return this.pressedKeys.has(normalizeKey(key));
  }

  getPressedKeys(): string[] {
    return Array.from(this.pressedKeys);
  }

  /**
   * Subscribe to key state changes (for UI like settings overlay).
   * Returns unsubscribe function.
   */
  onKeyStateChange(callback: KeyStateCallback): () => void {
    this.keyStateListeners.add(callback);
    return () => {
      this.keyStateListeners.delete(callback);
    };
  }

  private notifyKeyStateListeners(): void {
    this.keyStateListeners.forEach((cb) => cb(new Set(this.pressedKeys)));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Bindings Persistence
  // ─────────────────────────────────────────────────────────────────────────

  loadUserBindings(): void {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.menu) this.handlers.menu.setBindings(parsed.menu);
        if (parsed.game) this.handlers.game.setBindings(parsed.game);
        if (parsed.results) this.handlers.results.setBindings(parsed.results);
      } catch (e) {
        console.warn("Failed to load user bindings:", e);
      }
    }
  }

  saveUserBindings(): void {
    if (typeof window === "undefined") return;

    const bindings = {
      menu: this.handlers.menu.getBindings(),
      game: this.handlers.game.getBindings(),
      results: this.handlers.results.getBindings(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bindings));
  }

  // Helper method to maintain the link between Context and Action
  private resetContext<C extends InputContext>(ctx: C): void {
    const defaults = INPUT_CONFIG[ctx].defaultBindings;
    // Cast handler to InputHandler<C> to allow type-safe resetBindings call
    const handler = this.handlers[ctx] as InputHandler<C>;
    handler.resetBindings(defaults as BindingsFor<C>);
  }

  resetToDefaults(context?: InputContext): void {
    if (context) {
      this.resetContext(context);
    } else {
      // Cast keys to InputContext[] to iterate
      (Object.keys(INPUT_CONFIG) as InputContext[]).forEach((ctx) => {
        this.resetContext(ctx);
      });
    }
    this.saveUserBindings();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Key Repeat
  // ─────────────────────────────────────────────────────────────────────────

  setKeyRepeat(settings: Partial<KeyRepeatSettings>): void {
    this.keyRepeat = { ...this.keyRepeat, ...settings };
  }

  private startKeyRepeat(
    key: string,
    handler: InputHandler<InputContext>,
    action: string,
    event: KeyboardEvent,
  ): void {
    this.stopKeyRepeat(key);

    const timers: {
      initialTimer: ReturnType<typeof setTimeout> | null;
      repeatTimer: ReturnType<typeof setInterval> | null;
    } = {
      initialTimer: setTimeout(() => {
        timers.repeatTimer = setInterval(() => {
          // Emit action directly - skip binding lookup since we already know the action
          handler.emitAction(action as MenuAction, true, event);
        }, this.keyRepeat.repeatRate);
      }, this.keyRepeat.initialDelay),
      repeatTimer: null,
    };

    this.repeatTimers.set(key, timers);
  }

  private stopKeyRepeat(key: string): void {
    const timers = this.repeatTimers.get(key);
    if (timers) {
      if (timers.initialTimer) clearTimeout(timers.initialTimer);
      if (timers.repeatTimer) clearInterval(timers.repeatTimer);
      this.repeatTimers.delete(key);
    }
  }

  private stopAllKeyRepeats(): void {
    this.repeatTimers.forEach((_, key) => this.stopKeyRepeat(key));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Event Handlers
  // ─────────────────────────────────────────────────────────────────────────

  private handleKeyDown(event: KeyboardEvent): void {
    // Ignore if focus is in an input/textarea
    const target = event.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      return;
    }

    const normalizedKey = normalizeKey(event.key);

    // Skip if already pressed (browser key repeat)
    if (this.pressedKeys.has(normalizedKey)) return;

    this.pressedKeys.add(normalizedKey);
    this.notifyKeyStateListeners();

    // Delegate to active handler
    const handler = this.handlers[this.activeContext];
    const action = handler.processKeyDown(event.key, event);

    if (action) {
      event.preventDefault();

      // Start key repeat for menu context only
      if (this.activeContext === "menu" && this.keyRepeat.enabled) {
        this.startKeyRepeat(normalizedKey, handler, action, event);
      }
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    const normalizedKey = normalizeKey(event.key);

    this.stopKeyRepeat(normalizedKey);
    this.pressedKeys.delete(normalizedKey);
    this.notifyKeyStateListeners();

    const handler = this.handlers[this.activeContext];
    handler.processKeyUp(event.key, event);
  }

  private handleBlur(): void {
    this.stopAllKeyRepeats();
    this.pressedKeys.clear();
    this.notifyKeyStateListeners();
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.stopAllKeyRepeats();
      this.pressedKeys.clear();
      this.notifyKeyStateListeners();
    }
  }
}

// Singleton accessor
export const getInputManager = (): InputManager => InputManager.getInstance();
