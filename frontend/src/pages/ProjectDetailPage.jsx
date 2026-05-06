import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectService, taskService } from "../services/services";
import { useAuth } from "../context/AuthContext";
import { format, isPast } from "date-fns";
import toast from "react-hot-toast";

// ─── Task Form Modal ────────────────────────────────────────
function TaskModal({ task, projectId, members, onClose, onSave }) {
  const { user } = useAuth();
  const isEdit = !!task;
  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    project_id: projectId,
    assigned_to: task?.assigned_to || "",
    priority: task?.priority || "Medium",
    status: task?.status || "To Do",
    due_date: task?.due_date ? task.due_date.slice(0, 16) : "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      assigned_to: form.assigned_to || null,
      due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
    };
    try {
      let res;
      if (isEdit) {
        const { project_id, ...updatePayload } = payload;
        res = await taskService.update(task.id, updatePayload);
        toast.success("Task updated!");
      } else {
        res = await taskService.create(payload);
        toast.success("Task created! ✅");
      }
      onSave(res.data, isEdit);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{isEdit ? "Edit Task" : "Create Task"}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" placeholder="Task title" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" placeholder="Task details..." value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            {isEdit && (
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>Done</option>
                </select>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input type="datetime-local" className="form-input" value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <select className="form-select" value={form.assigned_to}
                onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}>
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user_id} value={m.user_id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="row" style={{ justifyContent: "flex-end", gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Add Member Modal ────────────────────────────────────────
function AddMemberModal({ projectId, onClose, onAdd }) {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await projectService.addMember(projectId, userId.trim());
      toast.success("Member added!");
      onAdd(res.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Add Member</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Member ID</label>
            <input className="form-input" placeholder="e.g. alekh08" value={userId}
              onChange={(e) => setUserId(e.target.value)} required />
            <div className="form-error" style={{ color: "var(--text-muted)", marginTop: 6 }}>
              Ask the user to share their unique Member ID they created during signup.
            </div>
          </div>
          <div className="row" style={{ justifyContent: "flex-end", gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Priority badge helper ───────────────────────────────────
function PriorityBadge({ priority }) {
  const map = { Low: "badge-low", Medium: "badge-medium", High: "badge-high" };
  return <span className={`badge ${map[priority] || "badge-medium"}`}>{priority}</span>;
}

function StatusBadge({ status }) {
  const map = { "To Do": "badge-todo", "In Progress": "badge-inprogress", Done: "badge-done" };
  return <span className={`badge ${map[status] || "badge-todo"}`}>{status}</span>;
}

// ─── Task Card ───────────────────────────────────────────────
function TaskCard({ task, members, onEdit, onDelete, currentUserId }) {
  const isOverdue = task.is_overdue;
  const assignee = members.find((m) => m.user_id === task.assigned_to);
  const canEdit = task.assigned_to === currentUserId || true; // admins too — checked server-side

  return (
    <div className={`task-card${isOverdue ? " overdue" : ""}`}>
      <div className="task-main">
        <div className="row-between" style={{ marginBottom: 4 }}>
          <div className="task-title">{task.title}</div>
          {isOverdue && <span className="badge badge-overdue">Overdue</span>}
        </div>
        {task.description && <div className="task-desc">{task.description}</div>}
        <div className="task-meta">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
          {assignee && <span className="task-meta-item">👤 {assignee.name}</span>}
          {task.due_date && (
            <span className="task-meta-item" style={{ color: isOverdue ? "var(--danger)" : undefined }}>
              📅 {format(new Date(task.due_date), "MMM d")}
            </span>
          )}
        </div>
      </div>
      <div className="task-actions">
        <button className="btn btn-sm btn-secondary" onClick={() => onEdit(task)}>Edit</button>
        <button className="btn btn-sm btn-danger" onClick={() => onDelete(task.id)}>Del</button>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────
export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | mine
  const [activeTab, setActiveTab] = useState("tasks"); // tasks | members
  const [taskModal, setTaskModal] = useState(null); // null | task | "new"
  const [memberModal, setMemberModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, mRes] = await Promise.all([
          projectService.getAll(),
          projectService.getMembers(id),
        ]);
        const found = pRes.data.find((p) => p.id === id);
        setProject(found);
        setMembers(mRes.data);
        await loadTasks(false);
      } catch {
        toast.error("Failed to load project");
        navigate("/projects");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const loadTasks = async (myOnly) => {
    const res = await taskService.getAll(id, myOnly);
    setTasks(res.data);
  };

  const handleFilterChange = (f) => {
    setFilter(f);
    loadTasks(f === "mine");
  };

  const handleTaskSave = (saved, isEdit) => {
    if (isEdit) {
      setTasks((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
    } else {
      setTasks((prev) => [saved, ...prev]);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await taskService.delete(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success("Task deleted");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to delete");
    }
  };

  const byStatus = (status) => tasks.filter((t) => t.status === status);

  const isAdmin = project?.members?.find(
    (m) => m.user_id === user?.id && m.role === "admin"
  );

  if (loading) return <div className="loading-center" style={{ minHeight: "100vh" }}><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header">
        <div className="row" style={{ marginBottom: 4 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate("/projects")}>← Back</button>
        </div>
        <div className="row-between">
          <div>
            <div className="page-title">{project?.name}</div>
            <div className="page-subtitle">{project?.description || "No description"}</div>
          </div>
          {activeTab === "tasks" && (
            <button className="btn btn-primary" onClick={() => setTaskModal("new")}>+ New Task</button>
          )}
          {activeTab === "members" && isAdmin && (
            <button className="btn btn-primary" onClick={() => setMemberModal(true)}>+ Add Member</button>
          )}
        </div>
      </div>

      <div className="page-body">
        <div className="tabs">
          <button className={`tab${activeTab === "tasks" ? " active" : ""}`} onClick={() => setActiveTab("tasks")}>
            📋 Tasks ({tasks.length})
          </button>
          <button className={`tab${activeTab === "members" ? " active" : ""}`} onClick={() => setActiveTab("members")}>
            👥 Members ({members.length})
          </button>
        </div>

        {activeTab === "tasks" && (
          <>
            <div className="filter-bar">
              <button className={`filter-btn${filter === "all" ? " active" : ""}`} onClick={() => handleFilterChange("all")}>
                All Tasks
              </button>
              <button className={`filter-btn${filter === "mine" ? " active" : ""}`} onClick={() => handleFilterChange("mine")}>
                My Tasks
              </button>
              <span className="text-muted">{tasks.length} task{tasks.length !== 1 ? "s" : ""}</span>
            </div>

            {tasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <div className="empty-title">No tasks yet</div>
                <div className="empty-desc">Create the first task for this project.</div>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setTaskModal("new")}>
                  + Create Task
                </button>
              </div>
            ) : (
              <div className="task-columns">
                {[
                  { label: "To Do", key: "To Do" },
                  { label: "In Progress", key: "In Progress" },
                  { label: "Done", key: "Done" },
                ].map(({ label, key }) => (
                  <div key={key} className="task-column">
                    <div className="column-header">
                      <div className="column-title">{label}</div>
                      <span className="column-count">{byStatus(key).length}</span>
                    </div>
                    <div className="task-grid">
                      {byStatus(key).length === 0 ? (
                        <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: 13 }}>
                          No tasks
                        </div>
                      ) : (
                        byStatus(key).map((t) => (
                          <TaskCard
                            key={t.id}
                            task={t}
                            members={members}
                            currentUserId={user?.id}
                            onEdit={(task) => setTaskModal(task)}
                            onDelete={handleDelete}
                          />
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "members" && (
          <div className="members-list">
            {members.map((m) => (
              <div key={m.user_id} className="member-item">
                <div className="member-avatar">{m.name.slice(0, 2).toUpperCase()}</div>
                <div className="member-info">
                  <div className="member-name">{m.name}</div>
                  <div className="member-email">{m.email}</div>
                </div>
                <span className={`badge badge-${m.role}`}>{m.role}</span>
                {isAdmin && m.role !== "admin" && (
                  <button className="btn btn-sm btn-danger" onClick={async () => {
                    try {
                      await projectService.removeMember(id, m.user_id);
                      setMembers((prev) => prev.filter((x) => x.user_id !== m.user_id));
                      toast.success("Member removed");
                    } catch (err) {
                      toast.error(err.response?.data?.detail || "Failed");
                    }
                  }}>Remove</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {taskModal && (
        <TaskModal
          task={taskModal === "new" ? null : taskModal}
          projectId={id}
          members={members}
          onClose={() => setTaskModal(null)}
          onSave={handleTaskSave}
        />
      )}

      {memberModal && (
        <AddMemberModal
          projectId={id}
          onClose={() => setMemberModal(false)}
          onAdd={(updated) => {
            // Refresh members
            projectService.getMembers(id).then((r) => setMembers(r.data));
          }}
        />
      )}
    </>
  );
}
