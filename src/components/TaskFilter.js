import React from "react";
import { useTasks } from "../context/TaskContext";

export default function TaskFilter() {
  const { filter, setFilter, tasks } = useTasks();

  const counts = {
    all: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    incomplete: tasks.filter((t) => !t.completed).length,
  };

  return (
    <div className="task-filter">
      <button
        onClick={() => setFilter("all")}
        className={filter === "all" ? "active" : ""}
      >
        All ({counts.all})
      </button>
      <button
        onClick={() => setFilter("completed")}
        className={filter === "completed" ? "active" : ""}
      >
        Completed ({counts.completed})
      </button>
      <button
        onClick={() => setFilter("incomplete")}
        className={filter === "incomplete" ? "active" : ""}
      >
        Incomplete ({counts.incomplete})
      </button>
    </div>
  );
}
