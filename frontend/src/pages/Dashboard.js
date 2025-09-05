// src/pages/Dashboard.js
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { format, isBefore, parseISO } from "date-fns";

function Dashboard() {
  const { token } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newTask, setNewTask] = useState({ title: "", description: "", deadline: "" });
  const [filter, setFilter] = useState("all");

  // --- Helpers ---
  const isOverdue = (deadline, completed) => {
    if (!deadline || completed) return false;
    return isBefore(parseISO(deadline), new Date());
  };

  const formatDeadline = (deadline) => {
    return deadline ? format(parseISO(deadline), "dd MMM yyyy HH:mm") : "No deadline";
  };

  // --- Fetch Tasks ---
  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/tasks", { headers: { Authorization: `Bearer ${token}` } });
      setTasks(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchTasks();
  }, [token]);

  // --- Handlers ---
  const handleToggle = async (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    try {
      const res = await api.put(
        `/tasks/${taskId}`,
        { completed: !task.completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(tasks.map((t) => (t.id === taskId ? res.data : t)));
    } catch (err) {
      console.error("Toggle failed", err);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`, { headers: { Authorization: `Bearer ${token}` } });
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleInlineEdit = async (taskId, field, value) => {
    try {
      const res = await api.put(
        `/tasks/${taskId}`,
        { [field]: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(tasks.map((t) => (t.id === taskId ? res.data : t)));
    } catch (err) {
      console.error("Edit failed", err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    try {
      const res = await api.post("/tasks", newTask, { headers: { Authorization: `Bearer ${token}` } });
      setTasks([...tasks, res.data]);
      setNewTask({ title: "", description: "", deadline: "" });
    } catch (err) {
      console.error("Add task failed", err);
    }
  };

  // --- Filtering ---
  const filteredTasks = tasks.filter((t) => {
    if (filter === "completed") return t.completed;
    if (filter === "pending") return !t.completed && !isOverdue(t.deadline, t.completed);
    if (filter === "overdue") return isOverdue(t.deadline, t.completed);
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 20 }}>Dashboard</h1>

      {/* Add Task Form */}
      <form
        onSubmit={handleAddTask}
        style={{ marginBottom: 20, display: "flex", gap: 8, alignItems: "center" }}
      >
        <input
          type="text"
          placeholder="Task Title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
        />
        <input
          type="datetime-local"
          value={newTask.deadline}
          onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
        />
        <button type="submit">Add</button>
      </form>

      {/* Filters */}
      <div style={{ marginBottom: 16, display: "flex", gap: 10 }}>
        {["all", "completed", "pending", "overdue"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 12px",
              borderRadius: 4,
              border: filter === f ? "2px solid #000" : "1px solid #ccc",
              background: filter === f ? "#000" : "#fff",
              color: filter === f ? "#fff" : "#000",
              cursor: "pointer",
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Task List */}
      {loading && <p>Loading tasks...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {filteredTasks.length === 0 && !loading && <p>No tasks found.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {filteredTasks.map((task) => (
          <li
            key={task.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: 6,
              padding: 12,
              marginBottom: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggle(task.id)}
                  style={{ cursor: "pointer" }}
                />
                <div
                  contentEditable={!task.completed}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleInlineEdit(task.id, "title", e.target.innerText)}
                  style={{
                    fontWeight: 600,
                    textDecoration: task.completed ? "line-through" : "none",
                    color: task.completed ? "#555" : "#000",
                  }}
                >
                  {task.title}
                </div>
              </div>
              {task.description && (
                <div
                  contentEditable={!task.completed}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleInlineEdit(task.id, "description", e.target.innerText)}
                  style={{ marginLeft: 28, fontStyle: "italic", color: "#555" }}
                >
                  {task.description}
                </div>
              )}
              {task.deadline && (
                <div style={{ marginLeft: 28, fontSize: 12, marginTop: 4, color: isOverdue(task.deadline, task.completed) ? "red" : "#555" }}>
                  {formatDeadline(task.deadline)} {isOverdue(task.deadline, task.completed) && "(Overdue)"}
                </div>
              )}
            </div>
            <button
              onClick={() => handleDelete(task.id)}
              style={{ padding: "4px 8px", border: "1px solid #ccc", borderRadius: 4, cursor: "pointer" }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
