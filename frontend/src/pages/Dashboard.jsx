import { useEffect, useState } from "react";
import { fetchDashboard, logout } from "../services/api";
import {
  Globe,
  Mail,
  Lock,
  Monitor,
  FolderOpen,
  Presentation,
  Headphones,
  ShieldCheck,
  Phone,
  Briefcase,
  MessageSquare,
  LogIn,
  UserCog,
  CalendarCheck,
  Car,
  Megaphone,
  Settings,
  BookOpen,
  Link as LinkIcon,
} from "lucide-react";

// Ordered [keyword, Icon] pairs — first match wins, so put more specific
// keywords (e.g. "user credential") before broader ones (e.g. "user").
const ICON_RULES = [
  [/aasl web/, Globe],
  [/office.*mail|e-?mail/, Mail],
  [/password/, Lock],
  [/help desk/, Monitor],
  [/ftp/, FolderOpen],
  [/civil aviation|training/, Presentation],
  [/it services/, Headphones],
  [/it polic/, ShieldCheck],
  [/directory/, Phone],
  [/procurement/, Briefcase],
  [/complaint/, MessageSquare],
  [/silk route|login/, LogIn],
  [/credential/, UserCog],
  [/leave management/, CalendarCheck],
  [/vehicle/, Car],
  [/tenderboard/, Megaphone],
  [/erp/, Settings],
  [/knowledge/, BookOpen],
];

function iconForLink(title = "") {
  const t = title.toLowerCase();
  const match = ICON_RULES.find(([pattern]) => pattern.test(t));
  return match ? match[1] : LinkIcon;
}

export default function Dashboard({ onLoggedOut, onNavigate }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch((err) => {
        console.error('Dashboard load failed:', err);
        const message = err.response?.data?.message || err.message || "Could not load your dashboard. Please try again.";
        setError(`Could not load your dashboard. ${message}`);
      });
  }, []);

  if (error) return <div className="dashboard">{error}</div>;
  if (!data) return <div className="dashboard">Loading…</div>;

  const { profile, attendance_today, updates, pending_actions, quick_links, document_panels } = data;

  return (
    <div className="dashboard">
      <TopBar profile={profile} onLogout={async () => { await logout(); onLoggedOut(); }} />

      <div className="top-grid">
        <ProfileCard profile={profile} />
        <AttendanceCard attendance={attendance_today} onNavigate={onNavigate} />
        <UpdatesCard updates={updates} pending={pending_actions} />
      </div>

      <QuickLinksStrip links={quick_links} onNavigate={onNavigate} />

      <div className="doc-grid">
        {document_panels.map((group) => (
          <DocumentPanel key={group.id} group={group} />
        ))}
      </div>

      <div className="notice">
        Your default user name and password will be your service number. Please change your
        password once you log in using "User Credential Manager".
      </div>
      <div className="notice info">
        Above mentioned employee information is not accurate and must be verified by the HR Division.
      </div>

      <div className="footer-quote">
        <strong>Daily Quote</strong>
        <div>“The real opportunity for success lies within the person and not in the job.”</div>
        <div style={{ marginTop: 6, opacity: 0.6 }}>— IT Team</div>
      </div>
    </div>
  );
}

function TopBar({ profile, onLogout }) {
  return (
    <div className="topbar">
      <input placeholder="Employee Name" readOnly />
      <input placeholder="Division" readOnly />
      <input placeholder="Service No" readOnly />
      <div className="topbar-user" onClick={onLogout} title="Click to log out" style={{ cursor: "pointer" }}>
        <div>
          <span className="name">{profile.full_name}</span>
          <span className="role">{profile.division}</span>
        </div>
        <div className="avatar-circle">👤</div>
      </div>
    </div>
  );
}

function ProfileCard({ profile }) {
  return (
    <div className="card">
      <h3>User Profile</h3>
      <div className="profile-avatar">👤</div>
      <p className="profile-name">{profile.full_name}</p>
      <p className="profile-role">{profile.division}</p>

      <h3 style={{ fontSize: 11 }}>Organizational Details</h3>
      <div className="detail-row"><span>Service No</span><span className="pill">{profile.service_no}</span></div>
      <div className="detail-row"><span>Salary Scale</span><span className="pill">{profile.salary_scale}</span></div>
      <div className="detail-row"><span>Pass No</span><span className="pill">{profile.pass_no}</span></div>
      <div className="detail-row"><span>Employment Type</span><span className="pill">{profile.employment_type}</span></div>
      <div className="detail-row" style={{ borderBottom: "none" }}>
        <span>Status</span><span className="pill">{profile.status}</span>
      </div>
    </div>
  );
}

function AttendanceCard({ attendance, onNavigate }) {
  const handleViewReports = (event) => {
    event.preventDefault();
    onNavigate?.("attendance");
  };

  return (
    <div className="card">
      <h3>Recent Attendance</h3>
      <div className="attendance-box in">
        <div>
          <div className="attendance-time">{attendance?.check_in?.slice(0, 5) || "--:--"}</div>
          <div className="attendance-sub">Checked In · {attendance?.work_date || "—"}</div>
        </div>
      </div>
      <div className="attendance-box out">
        <div>
          <div className="attendance-time">{attendance?.check_out?.slice(0, 5) || "--:--"}</div>
          <div className="attendance-sub">Checked Out · {attendance?.work_date || "—"}</div>
        </div>
      </div>
      <p className="attendance-note">
        You will be able to check your Daily Attendance Reports by clicking below.
      </p>
      <a className="btn-link" href="/attendance" onClick={handleViewReports}>
        View Daily Attendance Reports
      </a>
    </div>
  );
}

function UpdatesCard({ updates, pending }) {
  return (
    <div className="card">
      <h3>New Updates</h3>
      {updates.map((u) => (
        <div key={u.id} className={`update-item ${u.color}`}>
          {u.title}
        </div>
      ))}
      {pending.map((p) => (
        <div key={p.id} className="update-item red">
          {p.title}
        </div>
      ))}
    </div>
  );
}

function QuickLinksStrip({ links, onNavigate }) {
  return (
    <div className="links-strip">
      {links.map((l) => {
        const isExternal = l.url?.startsWith("http");
        const isInternal = l.url?.startsWith("/");
        const Icon = iconForLink(l.title);
        return (
          <a
            key={l.id}
            className="link-item"
            href={l.url || "#"}
            onClick={isInternal ? (event) => {
              event.preventDefault();
              onNavigate?.(l.url.slice(1));
            } : undefined}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noreferrer" : undefined}
          >
            <div className="link-icon"><Icon size={18} /></div>
            {l.title}
          </a>
        );
      })}
    </div>
  );
}

function DocumentPanel({ group }) {
  return (
    <div className="card">
      <h3>{group.title}</h3>
      {group.documents.map((d) => (
        <div key={d.id} className="doc-list-item">
          {d.title}
        </div>
      ))}
    </div>
  );
}