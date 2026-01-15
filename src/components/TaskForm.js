import React, { useState } from "react";
import { useTasks } from "../context/TaskContext";

export default function TaskForm() {
  const { addTask } = useTasks();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title, description);
    setTitle("");
    setDescription("");
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <div className="task-field">
        <label htmlFor="task-title">Task title</label>
        <input
          id="task-title"
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="task-field">
        <label htmlFor="task-description">Details</label>
        <textarea
          id="task-description"
          className="text-area"
          placeholder="Add context or a checklist (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <button type="submit" className="primary-btn">
        Add task
      </button>
    </form>
  );
}
