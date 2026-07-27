import { useEffect, useMemo, useState } from "react";
import { fetchErpLearningHub } from "../services/api";

export default function ErpLearningHub({ onBack }) {
  const [hub, setHub] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("setup");

  useEffect(() => {
    fetchErpLearningHub()
      .then(setHub)
      .catch((err) => {
        console.error('ERP load failed:', err);
        const message = err.response?.data?.message || err.message || "Could not load the ERP Learning Hub. Please try again.";
        setError(`Could not load the ERP Learning Hub. ${message}`);
      });
  }, []);

  const tabs = useMemo(() => {
    if (!hub) return [];

    const setup = hub.sections.find((section) => section.title === "ERP Setup Guide");
    const resources = hub.sections.find((section) => section.title === "ERP Resources");
    const related = hub.sections.find((section) => section.title === "Related Links");

    return [
      { key: "setup", label: "ERP Setup Guide", section: setup },
      {
        key: "videos",
        label: "ERP Videos",
        section: {
          title: "ERP Videos",
          items: [
            resources?.items?.find((item) => item.title === "Training Videos") || {
              title: "Training Videos",
              url: "#",
              description: "Watch short tutorials for common ERP tasks.",
            },
          ],
        },
      },
      {
        key: "materials",
        label: "ERP Materials",
        section: {
          title: "ERP Materials",
          items: [
            resources?.items?.find((item) => item.title === "ERP Policy Documents") || {
              title: "ERP Policy Documents",
              url: "#",
              description: "Download ERP guidance and process documents.",
            },
            ...(related?.items || []),
          ],
        },
      },
      {
        key: "support",
        label: "Support Center",
        section: {
          title: "Support Center",
          items: [
            { title: "Assistance Line", url: "#", description: `Ext. ${hub.support_extension}` },
            ...(related?.items || []),
          ],
        },
      },
    ];
  }, [hub]);

  if (error) return <div className="dashboard">{error}</div>;
  if (!hub) return <div className="dashboard">Loading…</div>;

  const activeSection = tabs.find((tab) => tab.key === activeTab)?.section || tabs[0]?.section;

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

      <div className="erp-tabs card">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`erp-tab ${activeTab === tab.key ? "active" : ""}`}
            type="button"
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="alert-card card">
        <div className="alert-title">Any further assistance</div>
        <div className="alert-contact">Ext. {hub.support_extension}</div>
      </div>

      <div className="alert-banner">{hub.alert}</div>

      <div className="hub-panel card">
        <div className="hub-panel-header">
          <h3>{activeSection.title}</h3>
        </div>
        <div className="hub-panel-grid">
          {activeSection.items?.map((item, index) => (
            <a
              key={index}
              className="hub-link"
              href={item.url || '#'}
              target={item.url?.startsWith('http') ? '_blank' : undefined}
              rel={item.url?.startsWith('http') ? 'noreferrer' : undefined}
              onClick={(event) => {
                if (!item.url || item.url === '#') {
                  event.preventDefault();
                } else if (!item.url?.startsWith('http') && item.url?.startsWith('/')) {
                  event.preventDefault();
                  window.location.href = item.url;
                }
              }}
            >
              <div>
                <strong>{item.title}</strong>
                <p>{item.description || item.url}</p>
              </div>
              {item.url && item.url !== "#" ? <span className="hub-link-arrow">→</span> : null}
            </a>
          ))}
        </div>
      </div>

      <div className="notice info">{hub.footer_note}</div>
      <div className="footer-quote">
        <strong>Daily Quote</strong>
        <div>{hub.quote}</div>
      </div>
    </div>
  );
}
