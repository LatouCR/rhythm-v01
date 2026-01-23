'use client';

import { useState, useEffect, useCallback } from 'react';
import { InputManager } from '@/lib';
import { INPUT_CONFIG, InputContext, ActionForContext } from '@/lib/game/input';

export default function InputSettings({ context = 'menu' }: { context: InputContext }) {
  const manager = InputManager.getInstance();

  // Compute bindings from manager
  const getBindingsMap = useCallback(() => {
    const handler = manager.getHandler(context);
    const current = handler.getBindings();
    // Invert the Record<Key, Action> to Record<Action, Key> for easier list rendering
    const displayMap: Record<string, string> = {};
    Object.entries(current).forEach(([key, action]) => {
      displayMap[action] = key;
    });
    return displayMap;
  }, [context, manager]);

  const [bindings, setBindings] = useState<Record<string, string>>(() => getBindingsMap());
  const [rebindingAction, setRebindingAction] = useState<string | null>(null);

  // Refresh bindings when context changes
  const refreshBindings = useCallback(() => {
    setBindings(getBindingsMap());
  }, [getBindingsMap]);

  // The Capture Logic
  useEffect(() => {
    if (!rebindingAction) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === 'Escape') {
        setRebindingAction(null);
        return;
      }

      const handler = manager.getHandler(context);
      // 1. Remove the key if it's already used elsewhere (prevent double-binding)
      handler.removeBinding(e.key);
      // 2. Set the new binding
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handler.setBinding(e.key, rebindingAction as ActionForContext<any>);
      // 3. Persist
      manager.saveUserBindings();
      
      setRebindingAction(null);
      refreshBindings();
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [rebindingAction, context, manager, refreshBindings]);

  const handleReset = () => {
    manager.resetToDefaults(context);
    refreshBindings();
  };

  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl shadow-2xl max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold uppercase tracking-widest">Input Settings: {context}</h2>
        <button 
          onClick={handleReset}
          className="px-3 py-1 text-xs bg-red-500/20 hover:bg-red-500 border border-red-500 rounded transition-colors"
        >
          Reset to Defaults
        </button>
      </div>

      <div className="space-y-2">
        {INPUT_CONFIG[context].actions.map((action) => (
          <div 
            key={action} 
            className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors"
          >
            <span className="text-slate-400 font-medium">{action}</span>
            
            <button
              onClick={() => setRebindingAction(action)}
              className={`min-w-30 px-4 py-2 rounded font-mono text-sm border-2 transition-all ${
                rebindingAction === action 
                  ? 'bg-blue-600 border-blue-400 animate-pulse' 
                  : 'bg-slate-700 border-transparent hover:bg-slate-600'
              }`}
            >
              {rebindingAction === action ? '???' : (bindings[action] || 'Unbound')}
            </button>
          </div>
        ))}
      </div>

      {rebindingAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 p-8 rounded-2xl border border-blue-500 text-center shadow-2xl">
            <p className="text-xl mb-2">Rebinding <span className="text-blue-400 font-bold">{rebindingAction}</span></p>
            <p className="text-slate-400 animate-bounce">Press any key to bind...</p>
            <p className="mt-6 text-xs text-slate-500 italic">Press ESC to cancel</p>
          </div>
        </div>
      )}
    </div>
  );
}