import React from "react";

export const isOverdue = (deadline, completed) => {
  if (completed) return false;
  return new Date(deadline) < new Date();
};

export const formatDeadline = (deadline) => {
  const d = new Date(deadline);
  return d.toLocaleString();
};

const TaskItem = ({ task, onEdit, onDelete, onToggle, loading }) => {
  const overdue = isOverdue(task.deadline, task.completed);

  return (
    <li style={{
      border: `1px solid ${overdue ? "#fca5a5" : "#eee"}`,
      borderRadius: 10,
      padding: 12,
      background: overdue ? "#fff1f2" : "#fff",
      opacity: loading ? 0.6 : 1,
      marginBottom: 10
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggle(task.id)}
              disabled={loading}
              style={{ cursor: "pointer" }}
            />
            <div style={{
              fontWeight: 600,
              textDecoration: task.completed ? "line-through" : "none",
              color: task.completed ? "#64748b" : "#000"
            }}>
              {task.title}
            </div>
          </div>

          {task.description && (
            <div style={{ color: "#555", marginLeft: 28, fontStyle: "italic" }}>
              {task.description}
            </div>
          )}

          <div style={{
            fontSize: 12,
            marginTop: 8,
            marginLeft: 28,
            color: overdue ? "#b91c1c" : "#64748b"
          }}>
            {formatDeadline(task.deadline)}
            {overdue && <strong> (Overdue)</strong>}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => onEdit(task)}
            disabled={loading}
            style={{
              padding: "6px 10px",
              border: "1px solid #ddd",
              borderRadius: 8,
              cursor: "pointer",
              opacity: loading ? 0.5 : 1
            }}
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task.id)}
            disabled={loading}
            style={{
              padding: "6px 10px",
              border: "1px solid #fecaca",
              background: "#fee2e2",
              borderRadius: 8,
              cursor: "pointer",
              opacity: loading ? 0.5 : 1
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
};

export default TaskItem;
