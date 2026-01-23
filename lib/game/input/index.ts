// Types
export type {
    InputContext,
    MenuAction,
    GameAction,
    ResultsAction,
    ActionForContext,
    AnyAction,
    ActionsFor,
    BindingsFor,
} from './config';

// Config
export { INPUT_CONFIG, normalizeKey } from './config';

// Classes
export { InputHandler } from './InputHandler';
export { InputManager, getInputManager } from './InputManager';

// Hooks
export {
    useInputInit,
    useInputManager,
    useInputHandler,
    useSetInputContext,
    useInputAction,
    useInputActionSingle,
    useKeyPressed,
    usePressedKeys,
    useInputContext,
} from './useInput';
