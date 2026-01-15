## Task Management Application - (TODO App)

A modern task management application that demonstrates a clean React front end
paired with a Node.js + Express API. It supports creating, editing, completing,
and filtering tasks with a refreshed, dashboard-like interface.

### Features

- Create, edit, delete, and complete tasks.
- Filter by all, completed, and incomplete tasks.
- API-driven data layer with a lightweight Express server.
- Updated UI with stats, status messaging, and a modern layout.

### Getting Started

1. **Install front-end dependencies**

   ```bash
   npm install
   ```

2. **Install back-end dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Start the API**

   ```bash
   npm start
   ```

4. **Start the React app** (from the project root in another terminal)

   ```bash
   npm start
   ```

The React development server proxies API requests to `http://localhost:5000`.

> Tip: you can also run the API from the project root with `npm run server`.
