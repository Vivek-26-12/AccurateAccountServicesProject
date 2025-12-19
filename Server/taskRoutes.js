const express = require("express");
const router = express.Router();

module.exports = (db) => {
  // GET /tasks - Fetch all tasks with details
  router.get("/tasks", (req, res) => {
    const query = `
      SELECT 
        t.task_id,
        t.task_name,
        t.status,
        t.due_date,
        t.created_at,
        t.priority,
        t.group_id,
        assignedBy.first_name AS assigned_by_first_name,
        assignedBy.last_name AS assigned_by_last_name,
        assignedTo.first_name AS assigned_to_first_name,
        assignedTo.last_name AS assigned_to_last_name,
        gc.group_name
      FROM Tasks t
      LEFT JOIN Users assignedBy ON t.assigned_by = assignedBy.user_id
      LEFT JOIN Users assignedTo ON t.assigned_to = assignedTo.user_id
      LEFT JOIN GroupChats gc ON t.group_id = gc.group_id
      ORDER BY 
        CASE WHEN t.priority = 'High' THEN 1
             WHEN t.priority = 'Medium' THEN 2
             WHEN t.priority = 'Low' THEN 3
             ELSE 4 END,
        t.due_date ASC
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching tasks:", err);
        return res.status(500).json({ error: "Error fetching tasks" });
      }
      res.json(results);
    });
  });
  // GET /tasks/user/:userId - Fetch tasks assigned to a specific user
  router.get("/tasks/user/:userId", (req, res) => {
    const userId = req.params.userId;

    const query = `
    SELECT 
      t.task_id,
      t.task_name,
      t.status,
      t.due_date,
      t.created_at,
      t.priority,
      assignedBy.first_name AS assigned_by_first_name,
      assignedBy.last_name AS assigned_by_last_name,
      assignedTo.first_name AS assigned_to_first_name,
      assignedTo.last_name AS assigned_to_last_name,
      gc.group_name
    FROM Tasks t
    LEFT JOIN Users assignedBy ON t.assigned_by = assignedBy.user_id
    LEFT JOIN Users assignedTo ON t.assigned_to = assignedTo.user_id
    LEFT JOIN GroupChats gc ON t.group_id = gc.group_id
    WHERE t.assigned_to = ?
    ORDER BY 
      CASE WHEN t.priority = 'High' THEN 1
           WHEN t.priority = 'Medium' THEN 2
           WHEN t.priority = 'Low' THEN 3
           ELSE 4 END,
      t.due_date ASC
  `;

    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error("Error fetching user tasks:", err);
        return res.status(500).json({ error: "Error fetching user tasks" });
      }
      res.json(results);
    });
  });


  // POST /tasks - Create a new task
  router.post("/tasks", (req, res) => {
    const { task_name, assigned_by, assigned_to, group_id, due_date, status, priority } = req.body;

    const query = `
      INSERT INTO Tasks (task_name, assigned_by, assigned_to, group_id, due_date, status, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      query,
      [
        task_name,
        assigned_by,
        assigned_to || null,
        group_id || null,
        due_date,
        status || 'Pending',
        priority || 'Medium'
      ],
      (err, result) => {
        if (err) {
          console.error("Error creating task:", err);
          return res.status(500).json({ error: "Error creating task" });
        }
        res.json({
          message: "Task created successfully",
          task_id: result.insertId,
          priority: priority || 'Medium'
        });
      }
    );
  });


  // PUT /tasks/:id - Update a task
  router.put("/tasks/:id", (req, res) => {
    const { id } = req.params;
    const { task_name, assigned_by, assigned_to, group_id, due_date, status, priority } = req.body;

    const query = `
      UPDATE Tasks
      SET 
        task_name = ?, 
        assigned_by = ?, 
        assigned_to = ?, 
        group_id = ?, 
        due_date = ?, 
        status = ?, 
        priority = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE task_id = ?
    `;

    db.query(
      query,
      [
        task_name,
        assigned_by,
        assigned_to || null,
        group_id || null,
        due_date,
        status,
        priority || 'Medium',
        id
      ],
      (err) => {
        if (err) {
          console.error("Error updating task:", err);
          return res.status(500).json({ error: "Error updating task" });
        }
        res.json({
          message: "Task updated successfully",
          priority: priority || 'Medium'
        });
      }
    );
  });

  // DELETE /tasks/:id - Delete a task
  router.delete("/tasks/:id", (req, res) => {
    const { id } = req.params;

    const query = `DELETE FROM Tasks WHERE task_id = ?`;

    db.query(query, [id], (err) => {
      if (err) {
        console.error("Error deleting task:", err);
        return res.status(500).json({ error: "Error deleting task" });
      }
      res.json({ message: "Task deleted successfully" });
    });
  });

  return router;
};