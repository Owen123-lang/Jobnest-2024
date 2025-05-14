import pool from "../config/db.js";

// Create a new skill
export const createSkill = async (req, res) => {
  const userId = req.user.id; // Get from JWT token
  const { skill_name, level } = req.body;
  
  if (!skill_name || !level) {
    return res.status(400).json({ message: "Skill name and level are required" });
  }
  
  // Validate skill level is one of the allowed enum values
  const allowedLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
  if (!allowedLevels.includes(level.toLowerCase())) {
    return res.status(400).json({ 
      message: "Invalid skill level. Must be one of: beginner, intermediate, advanced, expert" 
    });
  }
  
  try {
    // Check if skill already exists for this user
    const existingSkill = await pool.query(
      "SELECT * FROM skills WHERE user_id = $1 AND skill_name = $2",
      [userId, skill_name]
    );
    
    if (existingSkill.rows.length > 0) {
      return res.status(400).json({ 
        message: "You already have this skill listed. Try updating it instead." 
      });
    }
    
    // Create new skill
    const result = await pool.query(
      `INSERT INTO skills (user_id, skill_name, level)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, skill_name, level.toLowerCase()]
    );
    
    res.status(201).json({
      message: "Skill added successfully",
      skill: result.rows[0]
    });
  } catch (error) {
    console.error("Error adding skill:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all skills for current user
export const getMySkills = async (req, res) => {
  const userId = req.user.id; // Get from JWT token
  
  try {
    const result = await pool.query(
      "SELECT * FROM skills WHERE user_id = $1 ORDER BY skill_name",
      [userId]
    );
    
    res.status(200).json({
      count: result.rows.length,
      skills: result.rows
    });
  } catch (error) {
    console.error("Error fetching skills:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get skills for a specific user
export const getUserSkills = async (req, res) => {
  const userId = parseInt(req.params.userId);
  
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ message: "Valid user ID is required" });
  }
  
  try {
    const result = await pool.query(
      "SELECT * FROM skills WHERE user_id = $1 ORDER BY skill_name",
      [userId]
    );
    
    res.status(200).json({
      count: result.rows.length,
      skills: result.rows
    });
  } catch (error) {
    console.error("Error fetching user skills:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a skill
export const updateSkill = async (req, res) => {
  const userId = req.user.id; // Get from JWT token
  const skillId = parseInt(req.params.id);
  const { level, skill_name } = req.body;
  
  if (!skillId || isNaN(skillId)) {
    return res.status(400).json({ message: "Valid skill ID is required" });
  }
  
  // Check if at least one field is provided
  if (!level && !skill_name) {
    return res.status(400).json({ message: "At least one field (level or skill_name) is required for update" });
  }
  
  // Validate skill level if provided
  if (level) {
    const allowedLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    if (!allowedLevels.includes(level.toLowerCase())) {
      return res.status(400).json({ 
        message: "Invalid skill level. Must be one of: beginner, intermediate, advanced, expert" 
      });
    }
  }
  
  try {
    // Check if skill exists and belongs to the user
    const existingSkill = await pool.query(
      "SELECT * FROM skills WHERE id = $1 AND user_id = $2",
      [skillId, userId]
    );
    
    if (existingSkill.rows.length === 0) {
      return res.status(404).json({ 
        message: "Skill not found or you don't have permission to update it" 
      });
    }
    
    // If skill_name is being updated, check if it would create a duplicate
    if (skill_name) {
      const duplicateCheck = await pool.query(
        "SELECT * FROM skills WHERE user_id = $1 AND skill_name = $2 AND id != $3",
        [userId, skill_name, skillId]
      );
      
      if (duplicateCheck.rows.length > 0) {
        return res.status(400).json({ 
          message: "You already have another skill with this name" 
        });
      }
    }
    
    // Build the update query dynamically based on what was provided
    const updateFields = [];
    const values = [];
    let paramCount = 1;
    
    if (level) {
      updateFields.push(`level = $${paramCount}`);
      values.push(level.toLowerCase());
      paramCount++;
    }
    
    if (skill_name) {
      updateFields.push(`skill_name = $${paramCount}`);
      values.push(skill_name);
      paramCount++;
    }
    
    // Add the WHERE clause parameters
    values.push(skillId);
    values.push(userId);
    
    // Execute the update
    const result = await pool.query(
      `UPDATE skills 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
       RETURNING *`,
      values
    );
    
    res.status(200).json({
      message: "Skill updated successfully",
      skill: result.rows[0]
    });
  } catch (error) {
    console.error("Error updating skill:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a skill
export const deleteSkill = async (req, res) => {
  const userId = req.user.id; // Get from JWT token
  const skillId = parseInt(req.params.id);
  
  if (!skillId || isNaN(skillId)) {
    return res.status(400).json({ message: "Valid skill ID is required" });
  }
  
  try {
    // Check if skill exists and belongs to the user
    const existingSkill = await pool.query(
      "SELECT * FROM skills WHERE id = $1 AND user_id = $2",
      [skillId, userId]
    );
    
    if (existingSkill.rows.length === 0) {
      return res.status(404).json({ 
        message: "Skill not found or you don't have permission to delete it" 
      });
    }
    
    // Delete the skill
    await pool.query(
      "DELETE FROM skills WHERE id = $1 AND user_id = $2",
      [skillId, userId]
    );
    
    res.status(200).json({
      message: "Skill deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting skill:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all skills (admin only)
export const getAllSkills = async (req, res) => {
  try {
    // Optional pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // Get skills with user info
    const result = await pool.query(
      `SELECT s.*, u.email 
       FROM skills s
       JOIN users u ON s.user_id = u.id
       ORDER BY u.email, s.skill_name
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    // Get total count for pagination
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM skills"
    );
    
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    
    res.status(200).json({
      count: result.rows.length,
      totalCount,
      currentPage: page,
      totalPages,
      skills: result.rows
    });
  } catch (error) {
    console.error("Error fetching all skills:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};