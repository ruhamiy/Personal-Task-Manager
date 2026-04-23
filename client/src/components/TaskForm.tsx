import React, { useState } from 'react';
import '../styles/TaskForm.css'; // Import the CSS file
import type { Category } from '../types/types';

interface TaskFormData {
  title: string;
  description: string;
  priority: 'Extreme' | 'Moderate' | 'Low';
  due_date: string;
  categoryId?: number;
}

interface TaskFormProps {
  onSubmit?: (data: TaskFormData) => void;
  initialData?: Partial<TaskFormData>;
  categories: Category[];
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, initialData, categories }) => {
  const isEditMode = !!initialData; // changes initialdate to boolean to check if we are in edit mode or not
  const [formData, setFormData] = useState<TaskFormData>({
    // if initialData exists(edit mode), use its values; otherwise, use defaults - empty
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'Moderate',
    due_date: initialData?.due_date || '',
    categoryId: initialData?.categoryId || 0,
  });

  const handleChange = (
    // handle change for all input types - text, textarea, select
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => {
  const { name, value } = e.target;

  setFormData(prev => ({
    ...prev,
    [name]: name === "categoryId" ? Number(value) : value,
  }));
};
  const handlePriorityChange = (
    priority: "Extreme" | "Moderate" | "Low"
  ) => {
    setFormData((prev) => ({ ...prev, priority }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <div className="form-field">
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="date">Date</label>
        <div className="form-field">
          <input
            type="date"
            id="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Priority</label>
        <div className="form-field priority-field">
          <div className="priority-options">
            {["Extreme", "Moderate", "Low"].map((p) => (
              <label
                key={p}
                className={`priority-option ${
                  formData.priority === p ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="priority"
                  checked={formData.priority === p}
                  onChange={() =>
                    handlePriorityChange(p as TaskFormData["priority"])
                  }
                />
                <span>{p}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>
        <div className="form-field">
          <select
            name="categoryId"
            value={formData.categoryId || ""}
            onChange={handleChange}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">Task Description</label>
        <div className="form-field">
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Start writing here..."
            rows={4}
          />
        </div>
      </div>

      <button type="submit" className="submit-btn">
        {isEditMode ? "Update Task" : "Create Task"}
      </button>
    </form>
  );
};

export default TaskForm;