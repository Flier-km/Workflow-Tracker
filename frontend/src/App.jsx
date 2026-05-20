import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ApplicationList from "./pages/ApplicationList";
import ApplicationForm from "./pages/ApplicationForm";
import ApplicationDetail from "./pages/ApplicationDetail";

const STORAGE_KEY = "workflow-tracker-theme";

function getInitialTheme() {
  if (typeof window === "undefined") {
    return "dark";
  }

  const savedTheme = window.localStorage.getItem(STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  const themeIcon = theme === "dark" ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12.8A8.5 8.5 0 0 1 11.2 3 8.7 8.7 0 1 0 21 12.8Z" fill="currentColor" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 17.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11Zm0-14a.8.8 0 0 1 .8.8V5a.8.8 0 1 1-1.6 0V4.3a.8.8 0 0 1 .8-.8Zm0 18a.8.8 0 0 1 .8.8V21a.8.8 0 1 1-1.6 0v-.7a.8.8 0 0 1 .8-.8Zm9-9a.8.8 0 0 1-.8.8H19a.8.8 0 1 1 0-1.6h1.2a.8.8 0 0 1 .8.8Zm-18 0a.8.8 0 0 1 .8-.8H5a.8.8 0 1 1 0 1.6H3.8a.8.8 0 0 1-.8-.8Zm15.4-6.4a.8.8 0 0 1 0 1.1l-.9.9a.8.8 0 1 1-1.1-1.1l.9-.9a.8.8 0 0 1 1.1 0ZM6.6 17.4a.8.8 0 0 1 0 1.1l-.9.9a.8.8 0 0 1-1.1-1.1l.9-.9a.8.8 0 0 1 1.1 0Zm12.3 1.1a.8.8 0 0 1-1.1 0l-.9-.9a.8.8 0 1 1 1.1-1.1l.9.9a.8.8 0 0 1 0 1.1ZM6.6 6.6a.8.8 0 0 1-1.1 0l-.9-.9a.8.8 0 1 1 1.1-1.1l.9.9a.8.8 0 0 1 0 1.1Z" fill="currentColor" />
    </svg>
  );

  return (
    <BrowserRouter>
      <div className="layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-toolbar">
            <div>
              {/* <div className="page-toolbar-kicker">Workflow Tracker</div> */}
              <div className="page-toolbar-title">Application management</div>
            </div>
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {themeIcon}
              <span>{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
          </div>
          <Routes>
            <Route path="/" element={<ApplicationList />} />
            <Route path="/applications/new" element={<ApplicationForm />} />
            <Route path="/applications/:id" element={<ApplicationDetail />} />
            <Route path="/applications/:id/edit" element={<ApplicationForm />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
