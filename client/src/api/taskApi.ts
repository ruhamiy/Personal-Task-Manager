import API from "./authApi";
import type { Task } from "../types/types";

// GET all tasks
export const getTasks = async (): Promise<Task[]> => {
  const res = await API.get("/tasks");
  return res.data;
};

// GET single task
export const getTaskById = async (id: number): Promise<Task> => {
  const res = await API.get(`/tasks/${id}`);
  return res.data;
};

// CREATE task
export const createTask = async (task: Partial<Task>) => {
  const res = await API.post("/tasks", task);
  return res.data;
};

// UPDATE task
export const updateTask = async (id: number, task: Partial<Task>) => {
  const res = await API.put(`/tasks/${id}`, task);
  return res.data;
};

// DELETE task
export const deleteTask = async (id: number) => {
  const res = await API.delete(`/tasks/${id}`);
  return res.data;
};
export const assignCategoryToTask = async (taskId: number, categoryId: number) => {
  const res = await API.post("/tasks/assign-category", {
    taskId,
    categoryId,
  });
  return res.data;
};
// GET tasks by category
export const getTasksByCategory = async (categoryId: number) => {
  const res = await API.get(`/tasks/category/${categoryId}`);
  return res.data;
};