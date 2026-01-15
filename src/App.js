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
      <div className="app-shell">
        <header className="app-topbar">
          <div className="brand">
            <span className="brand-mark">TM</span>
            <div>
              <p className="brand-title">Todo Management</p>
              <p className="brand-subtitle">Focus workspace</p>
            </div>
          </div>
          <div className="topbar-actions">
            <span className="topbar-pill">Synced · Just now</span>
            <button className="ghost-btn" type="button">
              Share workspace
            </button>
          </div>
        </header>

        <main className="app-main">
          <section className="app-hero">
            <div>
              <p className="eyebrow">Today</p>
              <h1 className="app-title">Build momentum with smart tasks.</h1>
              <p className="app-subtitle">
                Plan, prioritize, and ship work with a clean daily checklist
                designed for teams that move fast.
              </p>
            </div>
            <div className="hero-card">
              <p className="hero-label">Weekly focus</p>
              <p className="hero-value">86%</p>
              <p className="hero-caption">
                You are ahead of schedule compared to last week.
              </p>
            </div>
          </section>

          <section className="app-layout">
            <div className="main-column">
              <div className="panel">
                <div className="panel-header">
                  <div>
                    <h2>Add a new task</h2>
                    <p>Capture what matters and keep context attached.</p>
                  </div>
                  <span className="panel-chip">Quick add</span>
                </div>
                <TaskForm />
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div>
                    <h2>Task board</h2>
                    <p>Track progress and keep your day in motion.</p>
                  </div>
                </div>
                <TaskFilter />
                <TaskList />
              </div>
            </div>

            <aside className="side-column">
              <div className="panel">
                <div className="panel-header">
                  <div>
                    <h2>Overview</h2>
                    <p>Your productivity snapshot.</p>
                  </div>
                </div>
                <TaskOverview />
              </div>

              <div className="panel panel-gradient">
                <h3>Quick wins</h3>
                <ul>
                  <li>Schedule a focus block.</li>
                  <li>Share next steps with your team.</li>
                  <li>Close out two small tasks today.</li>
                </ul>
              </div>
            </aside>
          </section>
        </main>
      </div>
    </TaskProvider>
  );
}
