import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { getApplication, submitApplication, startReview, recordDecision } from "../api/applications";
import StatusBadge from "../components/StatusBadge";

function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function Field({ label, value, mono }) {
  return (
    <div>
      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4, fontFamily: "var(--mono)" }}>{label}</div>
      <div style={{ fontSize: "0.9rem", color: "var(--text)", fontFamily: mono ? "var(--mono)" : "inherit" }}>{value || "—"}</div>
    </div>
  );
}

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(location.state?.success || "");

  // Decision modal state
  const [showDecision, setShowDecision] = useState(false);
  const [decision, setDecision] = useState("");
  const [comment, setComment] = useState("");
  const [decisionError, setDecisionError] = useState("");

  const load = () => {
    setLoading(true);
    getApplication(id)
      .then((r) => setApp(r.data))
      .catch(() => setError("Failed to load application."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleSubmit = async () => {
    setActionLoading(true); setError("");
    try {
      await submitApplication(id);
      setSuccess("Application submitted successfully.");
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit.");
    } finally { setActionLoading(false); }
  };

  const handleStartReview = async () => {
    setActionLoading(true); setError("");
    try {
      await startReview(id);
      setSuccess("Review started.");
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to start review.");
    } finally { setActionLoading(false); }
  };

  const handleDecision = async () => {
    setDecisionError("");
    if (!decision) { setDecisionError("Select a decision."); return; }
    if ((decision === "Rejected" || decision === "Need More Information") && !comment.trim()) {
      setDecisionError("A comment is required for this decision.");
      return;
    }
    setActionLoading(true);
    try {
      await recordDecision(id, { decision, reviewer_comment: comment });
      setSuccess(`Decision recorded: ${decision}`);
      setShowDecision(false);
      setDecision(""); setComment("");
      load();
    } catch (err) {
      setDecisionError(err.response?.data?.detail || "Failed to record decision.");
    } finally { setActionLoading(false); }
  };

  if (loading) return <div style={{ color: "var(--text3)", fontFamily: "var(--mono)", padding: 40 }}>Loading...</div>;
  if (error && !app) return <div className="alert alert-error">{error}</div>;
  if (!app) return null;

  const { status } = app;
  const isDraft = status === "Draft";
  const isSubmitted = status === "Submitted";
  const isUnderReview = status === "Under Review";
  const isNMI = status === "Need More Information";

  return (
    <div style={{ maxWidth: 760 }}>
      <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "var(--text2)", fontSize: "0.85rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
        ← All Applications
      </button>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.82rem", color: "var(--accent)", marginBottom: 6 }}>{app.tracking_number}</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 8 }}>{app.company_name}</h1>
          <StatusBadge status={status} />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {(isDraft || isNMI) && (
            <Link to={`/applications/${id}/edit`} className="btn btn-secondary">✎ Edit</Link>
          )}
          {isDraft && (
            <button className="btn btn-primary" onClick={handleSubmit} disabled={actionLoading}>
              {actionLoading ? "..." : "↑ Submit"}
            </button>
          )}
          {isNMI && (
            <button className="btn btn-primary" onClick={handleSubmit} disabled={actionLoading}>
              {actionLoading ? "..." : "↑ Resubmit"}
            </button>
          )}
          {isSubmitted && (
            <button className="btn btn-purple" onClick={handleStartReview} disabled={actionLoading}>
              {actionLoading ? "..." : "⊙ Start Review"}
            </button>
          )}
          {isUnderReview && (
            <button className="btn btn-secondary" onClick={() => setShowDecision(true)}>
              ✓ Record Decision
            </button>
          )}
        </div>
      </div>

      {/* Detail grid */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Field label="Applicant" value={app.applicant_name} />
          <Field label="Email" value={app.applicant_email} />
          <Field label="Company" value={app.company_name} />
          <Field label="Application Type" value={app.application_type} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <Field label="Description" value={app.description} />
      </div>

      {/* Reviewer comment */}
      {app.reviewer_comment && (
        <div className="card" style={{ marginBottom: 16, borderColor: status === "Approved" ? "rgba(45,212,160,0.3)" : status === "Rejected" ? "rgba(240,92,92,0.3)" : "rgba(240,168,67,0.3)" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8, fontFamily: "var(--mono)" }}>Reviewer Comment</div>
          <div style={{ fontSize: "0.9rem" }}>{app.reviewer_comment}</div>
        </div>
      )}

      {/* Timeline */}
      <div className="card" style={{ padding: "16px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16 }}>
          <Field label="Created" value={formatDate(app.created_at)} mono />
          <Field label="Submitted" value={formatDate(app.submitted_at)} mono />
          <Field label="Reviewed" value={formatDate(app.reviewed_at)} mono />
          <Field label="Last Updated" value={formatDate(app.updated_at)} mono />
        </div>
      </div>

      {/* Decision Modal */}
      {showDecision && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)" }}>
          <div className="card" style={{ width: 480, maxWidth: "90vw" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 20 }}>Record Reviewer Decision</h2>
            {decisionError && <div className="alert alert-error">{decisionError}</div>}
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Decision *</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Approved", "Rejected", "Need More Information"].map((d) => (
                  <button key={d} type="button"
                    className={`btn btn-sm ${decision === d ? (d === "Approved" ? "btn-success" : d === "Rejected" ? "btn-danger" : "btn-warning") : "btn-secondary"}`}
                    onClick={() => setDecision(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">
                Comment {(decision === "Rejected" || decision === "Need More Information") ? "*" : "(optional)"}
              </label>
              <textarea className="form-control" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Provide feedback for the applicant..." style={{ minHeight: 90 }} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => { setShowDecision(false); setDecision(""); setComment(""); setDecisionError(""); }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleDecision} disabled={actionLoading || !decision}>
                {actionLoading ? "Saving..." : "Confirm Decision"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
