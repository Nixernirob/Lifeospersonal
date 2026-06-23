import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light";

const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: "dark",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem("lifeos-theme") as Theme) || "dark";
  });

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("lifeos-theme", t);
  };

  useEffect(() => {
    const html = document.documentElement;
    if (theme === "light") {
      html.classList.add("light-theme");
      html.classList.remove("dark");
    } else {
      html.classList.remove("light-theme");
      html.classList.add("dark");
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
