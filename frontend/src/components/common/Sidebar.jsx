import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">📋</div>
        <span>TaskManager</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Navigation</div>

        <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
          <span className="nav-icon">📊</span>
          Dashboard
        </NavLink>

        <NavLink to="/projects" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
          <span className="nav-icon">📁</span>
          Projects
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info" onClick={handleLogout} title="Click to logout">
          <div className="user-avatar">{initials}</div>
          <div className="user-details">
            <div className="user-name">{user?.name}</div>
            <div className="user-email">{user?.email}</div>
          </div>
          <span style={{ color: "var(--text-muted)", fontSize: 16 }}>↩</span>
        </div>
      </div>
    </aside>
  );
}
