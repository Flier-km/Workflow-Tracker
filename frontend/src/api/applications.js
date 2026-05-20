import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: `${BASE_URL}/applications`,
  headers: { "Content-Type": "application/json" },
});

export const createApplication = (data) => api.post("/", data);
export const listApplications = (status) =>
  api.get("/", { params: status ? { status } : {} });
export const getApplication = (id) => api.get(`/${id}`);
export const updateApplication = (id, data) => api.put(`/${id}`, data);
export const submitApplication = (id) => api.post(`/${id}/submit`);
export const startReview = (id) => api.post(`/${id}/start-review`);
export const recordDecision = (id, data) => api.post(`/${id}/decision`, data);
