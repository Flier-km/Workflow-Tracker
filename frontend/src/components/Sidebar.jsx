import { NavLink } from "react-router-dom";

const NAV = [
  { to: "/", label: "Applications", icon: "◈" },
  { to: "/applications/new", label: "New Application", icon: "+" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div style={{ padding: "28px 20px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", color: "var(--accent)", letterSpacing: "0.12em", marginBottom: 6 }}>
          WORKFLOW
        </div>
        <div style={{ fontWeight: 800, fontSize: "1.15rem", lineHeight: 1.2 }}>
          Tracker
        </div>
      </div>
      <nav style={{ padding: "16px 12px", flex: 1 }}>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 12px", borderRadius: "var(--radius)",
              marginBottom: 4, fontSize: "0.88rem", fontWeight: 600,
              transition: "all 0.15s",
              background: isActive ? "rgba(79,142,247,0.12)" : "transparent",
              color: isActive ? "var(--accent)" : "var(--text2)",
              borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
            })}
          >
            <span style={{ fontFamily: "var(--mono)", fontSize: "1rem" }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)", fontSize: "0.72rem", color: "var(--text3)", fontFamily: "var(--mono)" }}>
        v1.0.0
      </div>
    </aside>
  );
}
