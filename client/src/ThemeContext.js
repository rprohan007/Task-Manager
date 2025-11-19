import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // 1. Get theme from localStorage, or default to 'light'
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'light'
  );

  // 2. This effect runs when 'theme' changes
  useEffect(() => {
    // 3. Set the 'data-theme' attribute on the <body> tag
    document.body.setAttribute('data-theme', theme);
    // 4. Save the choice to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 5. The function to toggle the theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // 6. Provide the theme and toggle function to all child components
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};