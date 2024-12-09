import { create } from "zustand"; 

export const useThemeStore = create((set) => ({

  theme: localStorage.getItem("chat-theme") || "coffee",
  // `theme` state is initialized by retrieving the value from `localStorage` if it exists; 
  // otherwise, it sets as "coffee".

  setTheme: (theme) => {
    // Method to update the theme state and store it to `localStorage`.

    localStorage.setItem("chat-theme", theme);
    // store new theme to `localStorage` so it persists across sessions.

    set({ theme });
    // Update the `theme` state in the store.
  },
}));
