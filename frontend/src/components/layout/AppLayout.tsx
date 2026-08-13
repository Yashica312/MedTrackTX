import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar />

      {mobileOpen && (
        <button
          type="button"
          className="mobile-overlay"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="app-main">
        <Header
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}