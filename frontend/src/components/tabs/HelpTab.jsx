import { useState, useReducer } from "react";
import { IconHelp, IconCheck } from "../common/Icons";

export function HelpTab({ t, apiBase }) {
  const [open, setOpen] = useState(null);
  const [form, setForm] = useReducer((s, p) => ({ ...s, ...p }), { farmer_name: "", contact: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async () => {
    if (!form.description.trim()) return;
    setSubmitting(true);
    try {
      const r = await fetch(`${apiBase}/grievances/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (r.ok) setSuccess(true);
    } catch {}
    setSubmitting(false);
  };

  return (
    <div className="tab-content">
      <h2 className="panel-title"><IconHelp /> {t.faq}</h2>
      <section className="panel">
        {t.faqs.map((item, i) => (
          <div className="faq-item" key={i}>
            <button className="faq-q" onClick={() => setOpen(open === i ? null : i)}>
              {item.q} <span>{open === i ? "▲" : "▼"}</span>
            </button>
            {open === i && <p className="faq-a">{item.a}</p>}
          </div>
        ))}
      </section>

      <section className="panel">
        <h2 className="panel-title">{t.grievance}</h2>
        {success ? (
          <div className="notice success"><IconCheck /> {t.grievanceSuccess}</div>
        ) : (
          <>
            <div className="wizard-grid">
              <label className="field">
                <span>Your name</span>
                <input
                  type="text"
                  placeholder="Ram Kumar"
                  value={form.farmer_name}
                  onChange={(e) => setForm({ farmer_name: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Phone / Contact</span>
                <input
                  type="text"
                  placeholder="9XXXXXXXXX"
                  value={form.contact}
                  onChange={(e) => setForm({ contact: e.target.value })}
                />
              </label>
            </div>
            <label className="field full-width">
              <span>{t.grievanceDesc}</span>
              <textarea
                rows={4}
                placeholder="Describe your problem or question…"
                value={form.description}
                onChange={(e) => setForm({ description: e.target.value })}
              />
            </label>
            <button className="btn-primary" onClick={submit} disabled={submitting || !form.description.trim()}>
              {submitting ? "Submitting…" : t.submit}
            </button>
          </>
        )}
      </section>
    </div>
  );
}

