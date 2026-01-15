import React from "react";
import { TaskProvider } from "./context/TaskContext";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import TaskFilter from "./components/TaskFilter";
import TaskOverview from "./components/TaskOverview";
import "./styles.css";

export default function App() {
  return (
    <TaskProvider>
      <div className="app-container">
        <div className="app-card">
          <header className="app-header">
            <div>
              <p className="eyebrow">Focus workspace</p>
              <h1 className="app-title">Todo manager</h1>
              <p className="app-subtitle">
                Plan, prioritize, and ship work with a clean daily checklist.
              </p>
            </div>
            <div className="status-pill">Synced with API</div>
          </header>
          <TaskOverview />
          <TaskForm />
          <TaskFilter />
          <TaskList />
        </div>
      </div>
    </TaskProvider>
  );
}
