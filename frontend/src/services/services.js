import api from "./api";

export const authService = {
  signup: (data) => api.post("/auth/signup", data),
  login: (data) => api.post("/auth/login", data),
};

export const projectService = {
  getAll: () => api.get("/projects"),
  create: (data) => api.post("/projects", data),
  addMember: (projectId, userId) =>
    api.post(`/projects/${projectId}/add-member`, { user_id: userId }),
  removeMember: (projectId, userId) =>
    api.delete(`/projects/${projectId}/remove-member`, {
      data: { user_id: userId },
    }),
  getMembers: (projectId) => api.get(`/projects/${projectId}/members`),
};

export const taskService = {
  getAll: (projectId, myTasks = false) =>
    api.get(`/tasks?project_id=${projectId}&my_tasks=${myTasks}`),
  create: (data) => api.post("/tasks", data),
  update: (taskId, data) => api.put(`/tasks/${taskId}`, data),
  delete: (taskId) => api.delete(`/tasks/${taskId}`),
};

export const dashboardService = {
  get: () => api.get("/dashboard"),
};
