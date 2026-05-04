import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { dashboardService } from "../services/services";
import { format } from "date-fns";

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${color}20`, fontSize: 22 }}>{icon}</div>
      <div className="stat-body">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.get()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pct = (n) => data?.total_tasks > 0 ? Math.round((n / data.total_tasks) * 100) : 0;

  return (
    <>
      <div className="page-header">
        <div className="page-title">Good {getGreeting()}, {user?.name?.split(" ")[0]} 👋</div>
        <div className="page-subtitle">Here's what's happening across your projects.</div>
      </div>

      <div className="page-body">
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <>
            <div className="stats-grid">
              <StatCard icon="📋" label="Total Tasks" value={data?.total_tasks ?? 0} color="#6366f1" />
              <StatCard icon="📁" label="Total Projects" value={data?.total_projects ?? 0} color="#3b82f6" />
              <StatCard icon="⏳" label="In Progress" value={data?.by_status?.in_progress ?? 0} color="#f59e0b" />
              <StatCard icon="✅" label="Completed" value={data?.by_status?.done ?? 0} color="#22c55e" />
              <StatCard icon="🔴" label="Overdue" value={data?.overdue_count ?? 0} color="#ef4444" />
            </div>

            <div className="grid-2">
              {/* Status breakdown */}
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Task Status Breakdown</div>
                </div>
                {[
                  { label: "To Do", val: data?.by_status?.todo ?? 0, color: "#6b7494" },
                  { label: "In Progress", val: data?.by_status?.in_progress ?? 0, color: "#f59e0b" },
                  { label: "Done", val: data?.by_status?.done ?? 0, color: "#22c55e" },
                ].map((s) => (
                  <div key={s.label} style={{ marginBottom: 14 }}>
                    <div className="row-between" style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>{s.label}</span>
                      <span style={{ fontSize: 13, color: s.color, fontWeight: 700 }}>{s.val}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct(s.val)}%`, background: s.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Tasks per user */}
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Tasks Per Member</div>
                </div>
                {data?.tasks_per_user?.length === 0 ? (
                  <div className="empty-state" style={{ padding: 24 }}>
                    <div className="empty-icon">👥</div>
                    <div className="empty-desc">No assigned tasks yet</div>
                  </div>
                ) : (
                  <div className="members-list">
                    {data?.tasks_per_user?.map((u) => (
                      <div key={u.user_id} className="member-item">
                        <div className="member-avatar">{u.name.slice(0, 2).toUpperCase()}</div>
                        <div className="member-info">
                          <div className="member-name">{u.name}</div>
                          <div className="member-email">{u.task_count} task{u.task_count !== 1 ? "s" : ""}</div>
                        </div>
                        <div style={{ fontWeight: 700, color: "var(--accent)", fontSize: 18 }}>{u.task_count}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Overdue tasks */}
            {data?.overdue_tasks?.length > 0 && (
              <div className="card" style={{ marginTop: 20 }}>
                <div className="card-header">
                  <div className="card-title" style={{ color: "var(--danger)" }}>🔴 Overdue Tasks</div>
                  <span className="badge badge-overdue">{data.overdue_tasks.length} overdue</span>
                </div>
                <div className="task-grid">
                  {data.overdue_tasks.map((t) => (
                    <div key={t.id} className="task-card overdue">
                      <div className="task-main">
                        <div className="task-title">{t.title}</div>
                        <div className="task-meta">
                          <span className="task-meta-item">📅 Due: {format(new Date(t.due_date), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
