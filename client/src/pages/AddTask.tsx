import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import TaskForm from "../components/TaskForm";
import { createTask, updateTask, assignCategoryToTask } from "../api/taskApi";
import { getCategories } from "../api/categoryApi";
import Navbar from "../components/Navbar";
import type { Category } from "../types/types";

const AddTask = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const task = location.state?.task;

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  const handleSubmit = async (data: any) => {
  try {
    if (task) {
      // UPDATE TASK
      await updateTask(task.id, {
        ...data,
        status: task.status,
      });

      // REASSIGN CATEGORY (simple version)
      await assignCategoryToTask(task.id, data.categoryId);

    } else {
      // CREATE TASK
      const newTask = await createTask(data);

      if (data.categoryId) {
        await assignCategoryToTask(newTask.id, data.categoryId);
      }
    }

    // REDIRECT AFTER SUCCESS
    navigate("/tasks");

  } catch (err) {
    console.error(err);
  }
};

  return (
    <Navbar>
      <TaskForm
        onSubmit={handleSubmit}
        categories={categories}
        initialData={
          task
            ? {
                title: task.title,
                description: task.description,
                priority: task.priority,
                due_date: task.dueDate ? task.dueDate.split(' ')[0].split('T')[0] : '',
                categoryId: task.categoryId,
              }
            : undefined
        }
      />
    </Navbar>
  );
};

export default AddTask;