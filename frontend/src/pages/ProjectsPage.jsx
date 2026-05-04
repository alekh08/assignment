import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { projectService } from "../services/services";
import toast from "react-hot-toast";

function CreateProjectModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await projectService.create(form);
      toast.success("Project created! 📁");
      onCreate(res.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Create New Project</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input id="project-name" className="form-input" placeholder="e.g. Website Redesign" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea id="project-desc" className="form-textarea" placeholder="What's this project about?"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="row" style={{ justifyContent: "flex-end", gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button id="create-project-submit" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    projectService.getAll()
      .then((res) => setProjects(res.data))
      .catch(() => toast.error("Failed to load projects"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header">
        <div className="row-between">
          <div>
            <div className="page-title">Projects</div>
            <div className="page-subtitle">Manage your team projects and collaborations.</div>
          </div>
          <button id="new-project-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
            + New Project
          </button>
        </div>
      </div>

      <div className="page-body">
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <div className="empty-title">No projects yet</div>
            <div className="empty-desc">Create your first project to get started.</div>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>
              + Create Project
            </button>
          </div>
        ) : (
          <div className="project-grid">
            {projects.map((p) => (
              <div key={p.id} className="project-card" onClick={() => navigate(`/projects/${p.id}`)}>
                <div className="project-name">{p.name}</div>
                <div className="project-desc">{p.description || "No description provided."}</div>
                <div className="divider" style={{ margin: "12px 0" }} />
                <div className="project-footer">
                  <span className="task-meta-item">👥 {p.members.length} member{p.members.length !== 1 ? "s" : ""}</span>
                  <span className="badge badge-admin">Open →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreate={(p) => setProjects((prev) => [p, ...prev])}
        />
      )}
    </>
  );
}
