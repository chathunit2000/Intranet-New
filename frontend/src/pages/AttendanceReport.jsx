import { useState, useMemo, useEffect, useCallback } from "react";
import "./AttendanceReport.css";

// ---- seed data -------------------------------------------------------
const INITIAL_RECORDS = {
  "2026-07-01": { status: "present", in: "08:55 AM", out: "05:12 PM" },
  "2026-07-02": { status: "present", in: "09:03 AM", out: "05:06 PM" },
  "2026-07-03": { status: "present", in: "08:58 AM", out: "05:20 PM" },
  "2026-07-06": { status: "present", in: "09:05 AM", out: "05:15 PM" },
  "2026-07-07": { status: "present", in: "08:51 AM", out: "05:08 PM" },
  "2026-07-08": { status: "absent" },
  "2026-07-09": { status: "present", in: "09:02 AM", out: "05:10 PM" },
  "2026-07-10": { status: "present", in: "08:57 AM", out: "05:02 PM" },
  "2026-07-13": { status: "holiday", title: "Company Holiday" },
  "2026-07-14": { status: "absent" },
  "2026-07-15": { status: "present", in: "09:07 AM", out: "05:14 PM" },
  "2026-07-16": { status: "present", in: "08:54 AM", out: "05:09 PM" },
  "2026-07-17": { status: "present", in: "09:00 AM", out: "05:18 PM" },
  "2026-07-20": { status: "leave", leaveType: "Annual Leave", reason: "Personal work" },
  "2026-07-21": { status: "present", in: "08:56 AM", out: "05:11 PM" },
  "2026-07-22": { status: "present", in: "09:01 AM", out: "05:04 PM" },
  "2026-07-23": { status: "present", in: "08:59 AM", out: "05:16 PM" },
  "2026-07-24": { status: "present", in: "09:06 AM", out: "05:13 PM" },
  "2026-07-27": { status: "present", in: "08:53 AM", out: "05:07 PM" },
  "2026-07-28": { status: "absent" },
  "2026-07-29": { status: "present", in: "08:57 AM", out: "05:12 PM" },
  "2026-07-30": { status: "present", in: "09:04 AM", out: "05:09 PM" },
  "2026-07-31": { status: "holiday", title: "Company Holiday" },
};

const STATUS_META = {
  present: { label: "Present", color: "var(--present)", bg: "var(--present-bg)" },
  absent: { label: "Absent", color: "var(--absent)", bg: "var(--absent-bg)" },
  holiday: { label: "Holiday", color: "var(--holiday)", bg: "var(--holiday-bg)" },
  leave: { label: "Leave", color: "var(--leave)", bg: "var(--leave-bg)" },
};

const LEAVE_TYPES = ["Casual Leave", "Annual Leave", "Sick Leave"];

function keyFromDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function descriptionFor(rec) {
  if (rec.status === "present") return "Attendance was recorded successfully.";
  if (rec.status === "absent") return "No attendance record was found. You can assign a leave type.";
  if (rec.status === "holiday") return "This date is marked as an official company holiday.";
  if (rec.status === "leave") return rec.reason ? `Reason: ${rec.reason}` : "Approved leave entry.";
  return "";
}

export default function AttendanceReport({ onBack }) {
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1));
  const [selectedKey, setSelectedKey] = useState(null);
  const [leaveTypeDraft, setLeaveTypeDraft] = useState(LEAVE_TYPES[0]);
  const [reasonDraft, setReasonDraft] = useState("");
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // keep the draft form in sync whenever the selected date changes
  useEffect(() => {
    if (!selectedKey) return;
    const rec = records[selectedKey];
    setLeaveTypeDraft(rec?.leaveType || LEAVE_TYPES[0]);
    setReasonDraft(rec?.reason || "");
  }, [selectedKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!toastVisible) return;
    const t = setTimeout(() => setToastVisible(false), 2400);
    return () => clearTimeout(t);
  }, [toastVisible]);

  const showToast = useCallback((message) => {
    setToast(message);
    setToastVisible(true);
  }, []);

  const calendarDays = useMemo(() => {
    const first = new Date(year, month, 1);
    const start = new Date(year, month, 1 - first.getDay());
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      days.push(date);
    }
    return days;
  }, [year, month]);

  const summary = useMemo(() => {
    let present = 0,
      absent = 0,
      leave = 0,
      holiday = 0,
      weekdays = 0;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      if (date.getDay() !== 0 && date.getDay() !== 6) weekdays++;
      const rec = records[keyFromDate(date)];
      if (!rec) continue;
      if (rec.status === "present") present++;
      if (rec.status === "absent") absent++;
      if (rec.status === "leave") leave++;
      if (rec.status === "holiday") holiday++;
    }
    return { present, absent, leave, holiday, working: weekdays - holiday };
  }, [records, year, month]);

  const monthTitle = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const goPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedKey(null);
  };
  const goNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedKey(null);
  };
  const goToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedKey(keyFromDate(today));
  };

  const handleSelectDay = (date) => {
    setSelectedKey(keyFromDate(date));
  };

  const handleSaveLeave = () => {
    if (!selectedKey) return;
    const trimmedReason = reasonDraft.trim();
    setRecords((prev) => ({
      ...prev,
      [selectedKey]: { status: "leave", leaveType: leaveTypeDraft, reason: trimmedReason },
    }));
    showToast(`${leaveTypeDraft} saved successfully.`);
  };

  const selectedRec = selectedKey ? records[selectedKey] : null;
  const selectedDateLabel = selectedKey
    ? new Date(`${selectedKey}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="page">

      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">▦</div>
          <div>
            {onBack && (
              <a
                href="/"
                onClick={(e) => { e.preventDefault(); onBack(); }}
                style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none" }}
              >
                ← Back to Dashboard
              </a>
            )}
            <h1>Attendance Manager</h1>
            <p>Monthly attendance, holidays and leave management</p>
          </div>
        </div>
        <div className="profile">
          <div className="avatar">ES</div>
          <div>
            <strong>Erandi Samarawickrama</strong>
            <span>Employee ID: EMP1234</span>
          </div>
        </div>
      </header>

      <section className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon" style={{ background: "rgba(22,163,74,0.18)", color: "#4ade80" }}>✓</div>
          <div><small>Present Days</small><strong>{summary.present}</strong></div>
        </div>
        <div className="summary-card">
          <div className="summary-icon" style={{ background: "rgba(147, 150, 235, 0.18)", color: "#f87171" }}>!</div>
          <div><small>Absent Days</small><strong>{summary.absent}</strong></div>
        </div>
        <div className="summary-card">
          <div className="summary-icon" style={{ background: "rgba(240,168,49,0.18)", color: "#fbbf24" }}>L</div>
          <div><small>Leave Days</small><strong>{summary.leave}</strong></div>
        </div>
        <div className="summary-card">
          <div className="summary-icon" style={{ background: "rgba(139,108,240,0.18)", color: "#c4b5fd" }}>★</div>
          <div><small>Company Holidays</small><strong>{summary.holiday}</strong></div>
        </div>
        <div className="summary-card">
          <div className="summary-icon" style={{ background: "rgba(46,163,201,0.18)", color: "#5eead4" }}>Σ</div>
          <div><small>Total Working Days</small><strong>{summary.working}</strong></div>
        </div>
      </section>

      <main className="app-shell">
        <section className="calendar-panel">
          <div className="calendar-toolbar">
            <div className="month-nav">
              <button className="icon-btn" aria-label="Previous month" onClick={goPrevMonth}>‹</button>
              <h2>{monthTitle}</h2>
              <button className="icon-btn" aria-label="Next month" onClick={goNextMonth}>›</button>
              <button className="today-btn" onClick={goToday}>Today</button>
            </div>
            <div className="legend">
              <span><i className="dot" style={{ background: "var(--present)" }} /> Present</span>
              <span><i className="dot" style={{ background: "var(--absent)" }} /> Absent</span>
              <span><i className="dot" style={{ background: "var(--holiday)" }} /> Holiday</span>
              <span><i className="dot" style={{ background: "var(--leave)" }} /> Leave</span>
            </div>
          </div>

          <div className="calendar-head">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>

          <div className="calendar-grid">
            {calendarDays.map((date) => {
              const key = keyFromDate(date);
              const rec = records[key];
              const inMonth = date.getMonth() === month;
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              const classes = [
                "day",
                !inMonth && "other-month",
                isWeekend && "weekend",
                rec && rec.status,
                selectedKey === key && "selected",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <div
                  key={key}
                  className={classes}
                  onClick={() => inMonth && handleSelectDay(date)}
                >
                  <div className="day-number"><span>{date.getDate()}</span></div>
                  {rec && (
                    <div className="status-pill">
                      <i className="dot" style={{ background: STATUS_META[rec.status].color }} />
                      {rec.status === "leave" ? rec.leaveType : rec.title || STATUS_META[rec.status].label}
                    </div>
                  )}
                  {rec && rec.status === "present" && (
                    <div className="time-list">
                      <div className="time-row"><span>In</span><strong>{rec.in}</strong></div>
                      <div className="time-row"><span>Out</span><strong>{rec.out}</strong></div>
                    </div>
                  )}
                  {rec && rec.status === "absent" && (
                    <div className="time-list"><div>Leave not assigned</div></div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <aside className="detail-panel">
          <h3>Date Details</h3>
          <div className="detail-date">{selectedDateLabel || "Select a date from the calendar"}</div>

          {!selectedKey && (
            <div className="empty-note">
              Select a working day to view attendance information. Absent days can be converted to Casual, Annual or Sick Leave.
            </div>
          )}

          {selectedKey && !selectedRec && (
            <div className="status-box" style={{ borderColor: "rgba(255,255,255,0.08)", background: "var(--navy-800)" }}>
              <strong>No attendance record</strong>
              <div>No check-in, check-out, holiday or leave entry is available for this date.</div>
            </div>
          )}

          {selectedKey && selectedRec && (
            <>
              <div
                className="status-box"
                style={{
                  borderColor: STATUS_META[selectedRec.status].color + "33",
                  background: STATUS_META[selectedRec.status].bg,
                }}
              >
                <strong style={{ color: STATUS_META[selectedRec.status].color }}>
                  {selectedRec.status === "leave" ? selectedRec.leaveType : selectedRec.title || STATUS_META[selectedRec.status].label}
                </strong>
                <div>{descriptionFor(selectedRec)}</div>
              </div>

              {selectedRec.status === "present" && (
                <div className="detail-times">
                  <div className="time-card"><span>Check-in</span><strong>{selectedRec.in}</strong></div>
                  <div className="time-card"><span>Check-out</span><strong>{selectedRec.out}</strong></div>
                </div>
              )}

              {(selectedRec.status === "absent" || selectedRec.status === "leave") && (
                <>
                  <div className="form-group">
                    <label htmlFor="leaveType">Leave Type</label>
                    <select
                      id="leaveType"
                      value={leaveTypeDraft}
                      onChange={(e) => setLeaveTypeDraft(e.target.value)}
                    >
                      {LEAVE_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="leaveReason">
                      Reason <span style={{ fontWeight: 400, color: "var(--muted)" }}>(Optional)</span>
                    </label>
                    <textarea
                      id="leaveReason"
                      placeholder="Enter a short reason..."
                      value={reasonDraft}
                      onChange={(e) => setReasonDraft(e.target.value)}
                    />
                  </div>
                  <button className="btn-primary" onClick={handleSaveLeave}>
                    {selectedRec.status === "leave" ? "Update Leave" : "Apply Leave"}
                  </button>
                  <div className="helper">Submitting a leave type changes this date from Absent to Leave.</div>
                </>
              )}
            </>
          )}
        </aside>
      </main>

      <div className={`toast ${toastVisible ? "show" : ""}`}>{toast}</div>
    </div>
  );
}