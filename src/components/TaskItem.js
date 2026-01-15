import React, { useState } from "react";
import { useTasks } from "../context/TaskContext";

export default function TaskItem({ task }) {
  const { deleteTask, toggleComplete, editTask } = useTasks();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const createdDate = task.createdAt
    ? new Date(task.createdAt).toLocaleDateString()
    : "Today";

  const handleEdit = () => {
    editTask(task.id, {
      ...task,
      title: editTitle,
      description: editDescription,
    });
    setIsEditing(false);
  };

  return (
    <div className={`task-item ${task.completed ? "completed" : ""}`}>
      {isEditing ? (
        <>
          <div className="task-edit">
            <input
              type="text"
              placeholder="Update title"
              className="task-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <textarea
              placeholder="Update details"
              className="task-area"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
            <div className="btn-group">
              <button className="save" onClick={handleEdit}>
                Save
              </button>
              <button className="cancel" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="task-header">
            <div>
              <h3>{task.title}</h3>
              <span className="task-meta">Created {createdDate}</span>
            </div>
            <div className="task-actions">
              <button className="ghost" onClick={() => toggleComplete(task.id)}>
                {task.completed ? "Undo" : "Complete"}
              </button>
              <button className="ghost" onClick={() => setIsEditing(true)}>
                Edit
              </button>
              <button className="ghost danger" onClick={() => deleteTask(task.id)}>
                Delete
              </button>
            </div>
          </div>
          <p>{task.description || "No additional details provided."}</p>
        </>
      )}
    </div>
  );
}
