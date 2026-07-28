import { useState } from "react";

export default function ItPolicies({ onBack }) {
  const [query, setQuery] = useState("");
  const policies = [
    { id: 1, name: 'Acceptable Usage Policy' },
    { id: 2, name: 'Anti-malware Policy' },
    { id: 3, name: 'E-Mail Policy' },
    { id: 4, name: 'Workstation Usage Policy' },
    { id: 5, name: 'Network Policy' },
    { id: 6, name: 'Network Policy for Tenants' },
    { id: 7, name: 'Network Policy for Passengers' },
    { id: 8, name: 'Physical Security Policy' },
    { id: 9, name: 'Backup and Disaster Recovery Policy' },
  ];

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <div className="page-subtitle">IT Policies</div>
          <h1 className="page-title">AASL IT Policies</h1>
          
        </div>
        <button className="btn-link small" onClick={onBack}>
          Back to Dashboard
        </button>
      </div>

      <div className="search-card card">
        <form
          className="search-box"
          onSubmit={(event) => {
            event.preventDefault();
            if (!query.trim()) return;
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            window.open(searchUrl, "_blank", "noreferrer");
          }}
        >
          <span>🔎</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search policies..."
          />
          <button className="search-button" type="submit">
            Search
          </button>
        </form>
      </div>

      <div className="policies-panel card">
        <div className="table-wrapper">
          <table className="policies-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((policy) => (
                <tr key={policy.id}>
                  <td>{policy.id}</td>
                  <td>{policy.name}</td>
                  <td>
                    <button className="btn-link small" type="button">
                      View Policy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
