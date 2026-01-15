import React from "react";
import { useTasks } from "../context/TaskContext";
import TaskItem from "./TaskItem";

export default function TaskList() {
  const { filteredTasks, isLoading, error } = useTasks();

  return (
    <div className="task-list">
      {isLoading ? <p className="status-message">Loading tasks...</p> : null}
      {!isLoading && error ? (
        <p className="status-message error">{error}</p>
      ) : null}
      {!isLoading && !error && filteredTasks.length === 0 ? (
        <p className="no-tasks">No tasks yet. Add one to get started.</p>
      ) : null}
      {!isLoading && !error
        ? filteredTasks.map((task) => <TaskItem key={task.id} task={task} />)
        : null}
    </div>
  );
}
