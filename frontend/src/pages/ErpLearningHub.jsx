import { useEffect, useState } from "react";
import { fetchErpLearningHub } from "../services/api";

export default function ErpLearningHub({ onBack }) {
  const [hub, setHub] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchErpLearningHub()
      .then(setHub)
      .catch((err) => {
        console.error('ERP load failed:', err);
        const message = err.response?.data?.message || err.message || "Could not load the ERP Learning Hub. Please try again.";
        setError(`Could not load the ERP Learning Hub. ${message}`);
      });
  }, []);

  if (error) return <div className="dashboard">{error}</div>;
  if (!hub) return <div className="dashboard">Loading…</div>;

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <div className="page-subtitle">ERP Learning Hub</div>
          <h1 className="page-title">{hub.title}</h1>
          <p className="page-description">{hub.subtitle}</p>
        </div>
        <button className="btn-link small" onClick={onBack}>
          Back to Dashboard
        </button>
      </div>

      <div className="alert-card card">
        <div className="alert-title">Any further assistance</div>
        <div className="alert-contact">Ext. {hub.support_extension}</div>
      </div>

      <div className="alert-banner">{hub.alert}</div>

      <div className="hub-grid">
        {hub.sections.map((section) => (
          <div key={section.id} className="card section-card">
            <h3>{section.title}</h3>
            <div className="section-items">
              {section.items.map((item, index) => (
                <a
                  key={index}
                  className="section-item"
                  href={item.url || '#'}
                  target={item.url?.startsWith('http') ? '_blank' : undefined}
                  rel={item.url?.startsWith('http') ? 'noreferrer' : undefined}
                  onClick={(event) => {
                    if (!item.url?.startsWith('http') && item.url?.startsWith('/')) {
                      event.preventDefault();
                      window.location.href = item.url;
                    }
                  }}
                >
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.description || item.url}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="notice info">{hub.footer_note}</div>
      <div className="footer-quote">
        <strong>Daily Quote</strong>
        <div>{hub.quote}</div>
      </div>
    </div>
  );
}
