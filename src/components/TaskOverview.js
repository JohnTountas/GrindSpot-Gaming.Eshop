import React from "react";
import { useTasks } from "../context/TaskContext";

export default function TaskOverview() {
  const { tasks } = useTasks();
  const completed = tasks.filter((task) => task.completed).length;
  const pending = tasks.length - completed;

  return (
    <section className="task-overview">
      <div>
        <p className="overview-label">Total tasks</p>
        <p className="overview-value">{tasks.length}</p>
      </div>
      <div>
        <p className="overview-label">Completed</p>
        <p className="overview-value">{completed}</p>
      </div>
      <div>
        <p className="overview-label">In progress</p>
        <p className="overview-value">{pending}</p>
      </div>
    </section>
  );
}
