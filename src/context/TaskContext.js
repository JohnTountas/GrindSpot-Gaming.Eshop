import React, { createContext, useContext, useEffect, useState } from "react";

const TaskContext = createContext();
const API_BASE = "/api/todos";

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(API_BASE);
        if (!response.ok) {
          throw new Error("Unable to load tasks.");
        }
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const addTask = async (title, description) => {
    try {
      setError(null);
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (!response.ok) {
        throw new Error("Unable to create task.");
      }
      const newTask = await response.json();
      setTasks((prev) => [newTask, ...prev]);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

  const editTask = async (id, updatedTask) => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      });
      if (!response.ok) {
        throw new Error("Unable to update task.");
      }
      const savedTask = await response.json();
      setTasks((prev) => prev.map((task) => (task.id === id ? savedTask : task)));
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

  const deleteTask = async (id) => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Unable to delete task.");
      }
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

  const toggleComplete = async (id) => {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    await editTask(id, { ...task, completed: !task.completed });
  };

  // Task filtering implementation
  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    if (filter === "completed") return task.completed;
    if (filter === "incomplete") return !task.completed;
    return true;
  });

  return (
    <TaskContext.Provider
      value={{
        tasks,
        filteredTasks,
        addTask,
        editTask,
        deleteTask,
        toggleComplete,
        setFilter,
        filter,
        isLoading,
        error,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
