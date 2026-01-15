const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let nextId = 3;
let todos = [
  {
    id: 1,
    title: "Review the quarterly roadmap",
    description: "Align with the team and highlight upcoming milestones.",
    completed: false,
    createdAt: "2024-01-04T09:00:00.000Z",
  },
  {
    id: 2,
    title: "Schedule design sync",
    description: "Draft the agenda and invite stakeholders.",
    completed: true,
    createdAt: "2024-01-02T14:30:00.000Z",
  },
];

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/todos", (req, res) => {
  res.json(todos);
});

app.post("/api/todos", (req, res) => {
  const { title, description = "" } = req.body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "Title is required." });
  }

  const newTodo = {
    id: nextId++,
    title: title.trim(),
    description: description.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };

  todos = [newTodo, ...todos];
  return res.status(201).json(newTodo);
});

app.put("/api/todos/:id", (req, res) => {
  const todoId = Number(req.params.id);
  const todoIndex = todos.findIndex((todo) => todo.id === todoId);

  if (todoIndex === -1) {
    return res.status(404).json({ error: "Task not found." });
  }

  const current = todos[todoIndex];
  const { title, description, completed } = req.body;

  const updated = {
    ...current,
    title: typeof title === "string" ? title.trim() : current.title,
    description:
      typeof description === "string" ? description.trim() : current.description,
    completed: typeof completed === "boolean" ? completed : current.completed,
  };

  todos[todoIndex] = updated;
  return res.json(updated);
});

app.delete("/api/todos/:id", (req, res) => {
  const todoId = Number(req.params.id);
  const todoExists = todos.some((todo) => todo.id === todoId);

  if (!todoExists) {
    return res.status(404).json({ error: "Task not found." });
  }

  todos = todos.filter((todo) => todo.id !== todoId);
  return res.status(204).send();
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API server running on http://localhost:${PORT}`);
});
