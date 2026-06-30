import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Global view mode shared by every thread: the structured GUI chat, or the
 * immersive terminal that runs the real `claude` CLI resumed on the same session.
 * One choice for the whole app -- flipping to terminal puts every chat in terminal
 * mode (and vice versa). Persisted so the app reopens in the mode you left it.
 */
export type ThreadViewMode = "gui" | "terminal";

interface ThreadViewModeState {
  readonly mode: ThreadViewMode;
  readonly setMode: (mode: ThreadViewMode) => void;
}

export const useThreadViewModeStore = create<ThreadViewModeState>()(
  persist(
    (set) => ({
      mode: "gui",
      setMode: (mode) => set({ mode }),
    }),
    // version 1: migrated away from the old per-thread `{ modes: Record<key, mode> }`
    // shape. Old persisted state is discarded (falls back to the "gui" default).
    { name: "t3code:thread-view-mode", version: 1 },
  ),
);

export function threadViewMode(): ThreadViewMode {
  return useThreadViewModeStore.getState().mode;
}
