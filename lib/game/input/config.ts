export type MenuAction = "nav-up" | "nav-down" | "select" | "back";
// TODO: Implement support for up to 7 keys
export type GameAction = "key-1" | "key-2" | "key-3" | "key-4" | "key-5" | "key-6" | "key-7" | "pause" | "retry" | "exit";
export type ResultsAction = "retry" | "back";

export type InputContext = "menu" | "game" | "results";

// Union of all action types
export type AnyAction = MenuAction | GameAction | ResultsAction;

// Type mapping context to action type
export type ActionForContext<C extends InputContext> =
    C extends "menu" ? MenuAction :
    C extends "game" ? GameAction :
    C extends "results" ? ResultsAction : never;

// Normalize key for consistent comparison (lowercase)
export function normalizeKey(key: string): string {
    return key.toLowerCase();
}

interface InputConfig<T extends string> {
    actions: T[];
    defaultBindings: Record<string, T>;
}

// Define default input configuration for each context
export const INPUT_CONFIG: Record<InputContext, InputConfig<string>> = {
    menu: {
        actions: ["nav-up", "nav-down", "select", "back"],
        defaultBindings: {
            arrowup: "nav-up",
            arrowdown: "nav-down",
            enter: "select",
            escape: "back",
        },
    },
    game: {
        actions: ["key-1", "key-2", "key-3", "key-4", "key-5", "key-6", "key-7", "pause", "retry", "exit"],
        defaultBindings: {
            // TODO: Add support for more keys
            d: "key-1",
            f: "key-2",
            j: "key-3",
            k: "key-4",
            arrowup: "pause",
            r: "retry",
            escape: "exit",
        }
    },
    results: {
        actions: ["retry", "back"],
        defaultBindings: {
            r: "retry",
            escape: "back",
        }
    },
} as const;

export type ActionsFor<C extends InputContext> = (typeof INPUT_CONFIG)[C]["actions"][number];
export type BindingsFor<C extends InputContext> = Record<string, ActionForContext<C>>;
