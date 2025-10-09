const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const dbService = require("../utils/dbService");

// Create user
router.post(
  "/create_user",
  [
    body("username").isAlphanumeric().isLength({ min: 3, max: 20 }),
    body("password").isLength({ min: 8 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, password } = req.body;
    try {
      const result = await dbService.CreateUser(username, password);
      if (result && result.success === false) {
        return res.status(409).json({ error: result.error || "Username already exists" });
      }
      res.status(201).json({ success: true });
    } catch (err) {
      console.error("Error creating user:", err);
      res.status(500).json({ error: "Failed to create user" });
    }
  }
);
router.post("/login_user", 
  [
    body("username").isAlphanumeric().isLength({ min: 3, max: 20 }),
    body("password").isLength({ min: 8 })
  ],
  async (req, res) => {
    console.log("BODY RECEIVED:", req.body);
    const { username, password } = req.body;

    try {
      const result = await dbService.LoginUser(username, password);
      if (result && result.success === true) {
        return res.status(200).json({ 
          success: true, 
          token: result.token, 
          user: { id: result.user.id, username: result.user.username } 
        });
      }
      return res.status(401).json({ error: result.message || "Invalid username or password" });
    } catch (err) {
      console.error("Error logging in user:", err);
      return res.status(500).json({ error: "Failed to login user" });
    }
  }
);

module.exports = router;
