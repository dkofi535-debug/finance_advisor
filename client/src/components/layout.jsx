import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const Layout = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");

  // Load saved theme when the app starts
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";

    setTheme(savedTheme);

    document.documentElement.classList.toggle(
      "dark",
      savedTheme === "dark"
    );
  }, []);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);

    document.documentElement.classList.toggle(
      "dark",
      nextTheme === "dark"
    );
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Transactions", path: "/transactions" },
    { name: "Budgets", path: "/budgets" },
    { name: "Savings", path: "/savings" },
    { name: "Reports", path: "/reports" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">

      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900">

        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <button
            onClick={() => navigate("/dashboard")}
            className="text-xl font-bold text-blue-600"
          >
            Finance Advisor
          </button>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-2 md:flex">

            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}

          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">

            {/* Theme Button */}
            <button
              onClick={toggleTheme}
              className="rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            >
              Logout
            </button>

          </div>

        </div>

        {/* Mobile Navigation */}
        <div className="border-t border-gray-100 px-4 py-3 dark:border-slate-800 md:hidden">

          <div className="flex flex-wrap gap-2">

            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200"
                      : "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}

          </div>

        </div>

      </nav>

      {/* Page Content */}
      <main className="mx-auto max-w-7xl">
        <Outlet />
      </main>

    </div>
  );
};

export default Layout;