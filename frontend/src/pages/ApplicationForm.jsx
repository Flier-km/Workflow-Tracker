import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createApplication, getApplication, updateApplication } from "../api/applications";

const APP_TYPES = ["Recordation", "Renewal", "Change of Ownership", "Change of Name", "Discontinuation"];

const EMPTY = { applicant_name: "", applicant_email: "", company_name: "", application_type: "", description: "" };

export default function ApplicationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    getApplication(id)
      .then((r) => {
        const { applicant_name, applicant_email, company_name, application_type, description } = r.data;
        setForm({ applicant_name, applicant_email, company_name, application_type, description });
      })
      .catch(() => setError("Failed to load application."))
      .finally(() => setFetchLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.application_type) { setError("Please select an application type."); return; }
    setLoading(true);
    try {
      let res;
      if (isEdit) {
        res = await updateApplication(id, form);
        navigate(`/applications/${id}`, { state: { success: "Application updated successfully." } });
      } else {
        res = await createApplication(form);
        navigate(`/applications/${res.data.id}`, { state: { success: "Application created successfully." } });
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div style={{ color: "var(--text3)", fontFamily: "var(--mono)", padding: 40 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 28 }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "var(--text2)", fontSize: "0.85rem", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          ← Back
        </button>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800 }}>{isEdit ? "Edit Application" : "New Application"}</h1>
        {isEdit && <p style={{ color: "var(--text2)", marginTop: 4, fontFamily: "var(--mono)", fontSize: "0.8rem" }}>Only Draft and Need More Information applications can be edited.</p>}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Applicant Name *</label>
              <input className="form-control" name="applicant_name" value={form.applicant_name} onChange={handleChange} required placeholder="John Paul" />
            </div>
            <div className="form-group">
              <label className="form-label">Applicant Email *</label>
              <input className="form-control" type="email" name="applicant_email" value={form.applicant_email} onChange={handleChange} required placeholder="trend@company.com" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Company Name *</label>
            <input className="form-control" name="company_name" value={form.company_name} onChange={handleChange} required placeholder="FlierTech Systems" />
          </div>

          <div className="form-group">
            <label className="form-label">Application Type *</label>
            <select className="form-control" name="application_type" value={form.application_type} onChange={handleChange} required>
              <option value="">Select a type...</option>
              {APP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-control" name="description" value={form.description} onChange={handleChange} required placeholder="Describe the purpose of this application..." style={{ minHeight: 120 }} />
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", paddingTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Draft"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
