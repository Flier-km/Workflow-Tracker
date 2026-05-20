import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { listApplications } from "../api/applications";
import StatusBadge from "../components/StatusBadge";

const STATUSES = ["", "Draft", "Submitted", "Under Review", "Need More Information", "Approved", "Rejected"];

function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function ApplicationList() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    listApplications(filter || undefined)
      .then((r) => setApps(r.data))
      .catch(() => setError("Failed to load applications."))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 4 }}>Applications</h1>
          <p style={{ color: "var(--text2)", fontSize: "0.9rem" }}>{apps.length} total</p>
        </div>
        <Link to="/applications/new" className="btn btn-primary btn-lg">
          + New Application
        </Link>
      </div>

      <div style={{ marginBottom: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="btn btn-sm"
            style={{
              background: filter === s ? "var(--accent)" : "var(--surface2)",
              color: filter === s ? "#fff" : "var(--text2)",
              border: `1px solid ${filter === s ? "var(--accent)" : "var(--border)"}`,
            }}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div style={{ color: "var(--text3)", padding: 40, textAlign: "center", fontFamily: "var(--mono)" }}>Loading...</div>
      ) : apps.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>◈</div>
          <div style={{ color: "var(--text2)", marginBottom: 16 }}>No applications yet</div>
          <Link to="/applications/new" className="btn btn-primary">Create first application</Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface2)" }}>
                {["Tracking No.", "Applicant", "Company", "Type", "Status", "Created"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.72rem", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "var(--mono)" }}>{h}</th>
                ))}
                <th style={{ padding: "12px 16px" }}></th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app, i) => (
                <tr key={app.id} style={{ borderBottom: i < apps.length - 1 ? "1px solid var(--border)" : "none", transition: "background 0.12s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px 16px", fontFamily: "var(--mono)", fontSize: "0.82rem", color: "var(--accent)" }}>{app.tracking_number}</td>
                  <td style={{ padding: "14px 16px", fontSize: "0.88rem", fontWeight: 600 }}>{app.applicant_name}</td>
                  <td style={{ padding: "14px 16px", fontSize: "0.85rem", color: "var(--text2)" }}>{app.company_name}</td>
                  <td style={{ padding: "14px 16px", fontSize: "0.82rem", color: "var(--text2)" }}>{app.application_type}</td>
                  <td style={{ padding: "14px 16px" }}><StatusBadge status={app.status} /></td>
                  <td style={{ padding: "14px 16px", fontSize: "0.8rem", color: "var(--text3)", fontFamily: "var(--mono)" }}>{formatDate(app.created_at)}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <Link to={`/applications/${app.id}`} className="btn btn-sm btn-secondary">View →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
