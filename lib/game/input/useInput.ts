'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getInputManager, InputManager } from './InputManager';
import { InputHandler } from './InputHandler';
import type { InputContext, ActionForContext } from './config';

/**
 * Initialize the InputManager. Call this once at the app root level.
 * Returns the InputManager instance.
 */
export function useInputInit(): InputManager {
    const manager = getInputManager();

    useEffect(() => {
        manager.init();
        // Don't dispose - singleton should persist
    }, [manager]);

    return manager;
}

/**
 * Get the InputManager instance.
 */
export function useInputManager(): InputManager {
    return getInputManager();
}

/**
 * Get a handler for a specific context.
 */
export function useInputHandler<C extends InputContext>(context: C): InputHandler<C> {
    const manager = getInputManager();
    return manager.getHandler(context);
}

/**
 * Set the active input context when the component mounts.
 */
export function useSetInputContext(context: InputContext): void {
    const manager = getInputManager();

    useEffect(() => {
        manager.setContext(context);
    }, [manager, context]);
}

/**
 * Subscribe to input actions for a specific context.
 * Automatically handles cleanup on unmount.
 *
 * @example
 * useInputAction('menu', {
 *   'nav-up': (pressed) => pressed && moveSelection(-1),
 *   'nav-down': (pressed) => pressed && moveSelection(1),
 *   'select': (pressed) => pressed && confirmSelection(),
 *   'back': (pressed) => pressed && router.back(),
 * });
 */
export function useInputAction<C extends InputContext>(
    context: C,
    handlers: Partial<Record<ActionForContext<C>, (pressed: boolean, event: KeyboardEvent) => void>>
): void {
    const manager = getInputManager();
    const handlersRef = useRef(handlers);

    useEffect(() => {
        handlersRef.current = handlers;
    }, [handlers]);

    // Store action keys to avoid re-subscribing when handlers object changes
    const actionsRef = useRef(Object.keys(handlers) as ActionForContext<C>[]);

    useEffect(() => {
        const handler = manager.getHandler(context);

        // Create wrapper handlers that read from ref at call time
        // This ensures we always call the latest handler (with fresh closures)
        const wrappedHandlers = {} as typeof handlers;
        for (const action of actionsRef.current) {
            wrappedHandlers[action] = (pressed, event) => {
                handlersRef.current[action]?.(pressed, event);
            };
        }

        const unsubscribe = handler.onActions(wrappedHandlers);

        return unsubscribe;
    }, [manager, context]);
}

/**
 * Subscribe to a single input action.
 */
export function useInputActionSingle<C extends InputContext>(
    context: C,
    action: ActionForContext<C>,
    callback: (pressed: boolean, event: KeyboardEvent) => void
): void {
    const manager = getInputManager();
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        const handler = manager.getHandler(context);
        const unsubscribe = handler.onAction(action, (_, pressed, event) => {
            callbackRef.current(pressed, event);
        });

        return unsubscribe;
    }, [manager, context, action]);
}

/**
 * Get a function to check if a key is pressed (non-reactive).
 */
export function useKeyPressed(): (key: string) => boolean {
    const manager = getInputManager();
    return useCallback((key: string) => manager.isKeyPressed(key), [manager]);
}

/**
 * Get all currently pressed keys reactively.
 * Use sparingly as it causes re-renders on key state changes.
 */
export function usePressedKeys(): string[] {
    const manager = getInputManager();
    const [keys, setKeys] = useState<string[]>([]);

    useEffect(() => {
        const unsubscribe = manager.onKeyStateChange((pressedSet) => {
            setKeys(Array.from(pressedSet));
        });

        return unsubscribe;
    }, [manager]);

    return keys;
}

/**
 * Combined hook for setting context and subscribing to actions.
 *
 * @example
 * useInputContext('menu', {
 *   'nav-up': (pressed) => pressed && moveSelection(-1),
 *   'nav-down': (pressed) => pressed && moveSelection(1),
 *   'select': (pressed) => pressed && confirmSelection(),
 * });
 */
export function useInputContext<C extends InputContext>(
    context: C,
    handlers: Partial<Record<ActionForContext<C>, (pressed: boolean, event: KeyboardEvent) => void>>
): void {
    useSetInputContext(context);
    useInputAction(context, handlers);
}
