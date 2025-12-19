// chatRoutes.js
const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  // GET chat messages (personal or group)
  router.get("/messages", (req, res) => {
    const { user_id, other_user_id, group_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }

    // Personal chat
    if (other_user_id && !group_id) {
      const query = `
        SELECT 
          pc.chat_id, 
          pc.sender_id, 
          pc.receiver_id, 
          pc.message, 
          pc.created_at,
          u1.first_name as sender_first_name,
          u1.last_name as sender_last_name,
          u1.profile_pic as sender_profile_pic,
          u2.first_name as receiver_first_name,
          u2.last_name as receiver_last_name,
          u2.profile_pic as receiver_profile_pic
        FROM PersonalChats pc
        JOIN Users u1 ON pc.sender_id = u1.user_id
        JOIN Users u2 ON pc.receiver_id = u2.user_id
        WHERE (sender_id = ? AND receiver_id = ?)
          OR (sender_id = ? AND receiver_id = ?)
        ORDER BY created_at ASC
      `;
      db.query(query, [user_id, other_user_id, other_user_id, user_id], (err, results) => {
        if (err) {
          console.error("Error fetching personal chats:", err);
          return res.status(500).json({ error: "Error fetching personal chats" });
        }
        res.json(results);
      });
    }
    // Group chat
    else if (group_id) {
      const query = `
        SELECT 
          gcm.message_id,
          gcm.group_id,
          gcm.sender_id,
          gcm.message,
          gcm.created_at,
          u.first_name,
          u.last_name,
          u.profile_pic
        FROM GroupChatMessages gcm
        JOIN Users u ON gcm.sender_id = u.user_id
        WHERE gcm.group_id = ?
        ORDER BY gcm.created_at ASC
      `;
      db.query(query, [group_id], (err, results) => {
        if (err) {
          console.error("Error fetching group messages:", err);
          return res.status(500).json({ error: "Error fetching group messages" });
        }
        res.json(results);
      });
    } else {
      res.status(400).json({ error: "Invalid parameters" });
    }
  });

  // POST new message
  router.post("/messages", (req, res) => {
    const { sender_id, receiver_id, group_id, message } = req.body;

    if (!sender_id || !message) {
      return res.status(400).json({ error: "sender_id and message are required" });
    }

    // Personal message
    if (receiver_id && !group_id) {
      const query = "INSERT INTO PersonalChats (sender_id, receiver_id, message) VALUES (?, ?, ?)";
      db.query(query, [sender_id, receiver_id, message], (err, results) => {
        if (err) {
          console.error("Error sending personal message:", err);
          return res.status(500).json({ error: "Error sending message" });
        }
        res.json({ success: true, chat_id: results.insertId });
      });
    }
    // Group message
    else if (group_id) {
      const query = "INSERT INTO GroupChatMessages (group_id, sender_id, message) VALUES (?, ?, ?)";
      db.query(query, [group_id, sender_id, message], (err, results) => {
        if (err) {
          console.error("Error sending group message:", err);
          return res.status(500).json({ error: "Error sending message" });
        }
        res.json({ success: true, message_id: results.insertId });
      });
    } else {
      res.status(400).json({ error: "Invalid parameters" });
    }
  });

  // GET user's groups
  router.get("/groups", (req, res) => {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }

    const query = `
      SELECT 
        gc.group_id, 
        gc.group_name, 
        gc.created_at,
        COUNT(gcm.message_id) as message_count
      FROM GroupChats gc
      JOIN GroupChatMembers gcmem ON gc.group_id = gcmem.group_id
      LEFT JOIN GroupChatMessages gcm ON gc.group_id = gcm.group_id
      WHERE gcmem.user_id = ?
      GROUP BY gc.group_id
      ORDER BY gc.created_at DESC
    `;

    db.query(query, [user_id], (err, results) => {
      if (err) {
        console.error("Error fetching user groups:", err);
        return res.status(500).json({ error: "Error fetching groups" });
      }
      res.json(results);
    });
  });

  // GET group members
  router.get("/groups/:group_id/members", (req, res) => {
    const { group_id } = req.params;

    const query = `
      SELECT 
        u.user_id,
        u.first_name,
        u.last_name,
        u.profile_pic,
        a.role
      FROM GroupChatMembers gcm
      JOIN Users u ON gcm.user_id = u.user_id
      JOIN Auth a ON u.auth_id = a.auth_id
      WHERE gcm.group_id = ?
    `;

    db.query(query, [group_id], (err, results) => {
      if (err) {
        console.error("Error fetching group members:", err);
        return res.status(500).json({ error: "Error fetching group members" });
      }
      res.json(results);
    });
  });
  // GET all group names
  router.get("/all-groups", (req, res) => {
    const query = `
    SELECT 
      group_id,
      group_name,
      created_at
    FROM GroupChats
    ORDER BY created_at DESC
  `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching all group names:", err);
        return res.status(500).json({ error: "Error fetching all group names" });
      }
      res.json(results);
    });
  });

  // POST create new group
  router.post("/groups", (req, res) => {
    const { group_name, creator_id, members } = req.body;

    if (!group_name || !creator_id || !members || !Array.isArray(members)) {
      return res.status(400).json({ error: "group_name, creator_id, and members array are required" });
    }

    // Start transaction
    db.beginTransaction(err => {
      if (err) {
        console.error("Error starting transaction:", err);
        return res.status(500).json({ error: "Error creating group" });
      }

      // 1. Create the group
      const createGroupQuery = "INSERT INTO GroupChats (group_name) VALUES (?)";
      console.log("Creating group:", group_name);

      db.query(createGroupQuery, [group_name], (err, results) => {
        if (err) {
          console.error("SQL Error creating group:", err);
          return db.rollback(() => {
            res.status(500).json({ error: "Error creating group: " + err.message });
          });
        }

        const group_id = results.insertId;
        const membersToAdd = [...new Set(members)]; // members is just an array of ids now
        console.log("Adding members:", membersToAdd);

        // 2. Add members to the group
        const addMembersQuery = "INSERT INTO GroupChatMembers (group_id, user_id) VALUES ?";
        const membersValues = membersToAdd.map(user_id => [group_id, user_id]);

        db.query(addMembersQuery, [membersValues], (err) => {
          if (err) {
            console.error("SQL Error adding members:", err);
            return db.rollback(() => {
              res.status(500).json({ error: "Error adding group members: " + err.message });
            });
          }

          // Commit transaction
          db.commit(err => {
            if (err) {
              console.error("Transaction Commit Error:", err);
              return db.rollback(() => {
                res.status(500).json({ error: "Error creating group during commit" });
              });
            }

            res.json({ success: true, group_id });
          });
        });
      });
    });
  });





  // PUT update group (name and members sync)
  router.put("/groups/:group_id", (req, res) => {
    const { group_id } = req.params;
    const { group_name, members } = req.body;

    if (!group_name) {
      return res.status(400).json({ error: "group_name is required" });
    }

    // Update Name
    const updateNameQuery = "UPDATE GroupChats SET group_name = ? WHERE group_id = ?";
    db.query(updateNameQuery, [group_name, group_id], (err) => {
      if (err) {
        console.error("Error updating group name:", err);
        return res.status(500).json({ error: "Error updating group name" });
      }

      // Sync Members if provided
      if (members) {
        // 1. Get current members (to avoid full delete/insert if possible, but full delete/insert is easier for sync)
        // Strategy: Delete all for this group, then insert new list.
        const deleteMembersQuery = "DELETE FROM GroupChatMembers WHERE group_id = ?";
        db.query(deleteMembersQuery, [group_id], (err) => {
          if (err) {
            console.error("Error clearing members for update:", err);
            return res.status(500).json({ error: "Error updating members" });
          }

          if (members.length > 0) {
            const insertMembersQuery = "INSERT INTO GroupChatMembers (group_id, user_id) VALUES ?";
            const values = members.map(uid => [group_id, uid]);
            db.query(insertMembersQuery, [values], (err) => {
              if (err) {
                console.error("Error inserting members for update:", err);
                return res.status(500).json({ error: "Error updating members" });
              }
              res.json({ success: true, message: "Group updated successfully" });
            });
          } else {
            res.json({ success: true, message: "Group updated successfully (no members)" });
          }
        });
      } else {
        res.json({ success: true, message: "Group name updated successfully" });
      }
    });
  });

  // POST add member to group
  router.post("/groups/:group_id/members", (req, res) => {
    const { group_id } = req.params;
    const { user_id } = req.body;

    if (!group_id || !user_id) {
      return res.status(400).json({ error: "group_id and user_id are required" });
    }

    const query = "INSERT INTO GroupChatMembers (group_id, user_id) VALUES (?, ?)";
    db.query(query, [group_id, user_id], (err) => {
      if (err) {
        // Ignore duplicate entry error
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(200).json({ message: "User is already a member" });
        }
        console.error("Error adding group member:", err);
        return res.status(500).json({ error: "Error adding group member" });
      }
      res.json({ success: true, message: "Member added successfully" });
    });
  });

  // DELETE remove member from group
  router.delete("/groups/:group_id/members/:user_id", (req, res) => {
    const { group_id, user_id } = req.params;

    const query = "DELETE FROM GroupChatMembers WHERE group_id = ? AND user_id = ?";
    db.query(query, [group_id, user_id], (err) => {
      if (err) {
        console.error("Error removing group member:", err);
        return res.status(500).json({ error: "Error removing group member" });
      }
      res.json({ success: true, message: "Member removed successfully" });
    });
  });

  // GET all groups (for admin)
  router.get("/groups/all", (req, res) => {
    const query = `
      SELECT 
        gc.group_id, 
        gc.group_name, 
        gc.created_at, 
        COUNT(gcm.message_id) as message_count 
      FROM GroupChats gc
      LEFT JOIN GroupChatMessages gcm ON gc.group_id = gcm.group_id
      GROUP BY gc.group_id
      ORDER BY gc.created_at DESC
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching all groups:", err);
        return res.status(500).json({ error: "Error fetching groups" });
      }
      res.json(results);
    });
  });

  return router;
};