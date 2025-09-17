const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const { readUsers, writeUsers } = require("../utils/fileHelpers");

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
    const hashedPassword = await bcrypt.hash(password, 12);

    let users = readUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase()))
      return res.status(409).json({ error: "Username already exists" });

    users.push({ username, password: hashedPassword });
    writeUsers(users);

    res.status(201).send();
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

    let users = []
  
    users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
    const user =  users.find(u => u.username.toLowerCase() === username.toLowerCase())
    if (user) {

      const match = await bcrypt.compare(password, user.password)
      const whitelisted = ["sundew", "sewil", "areila", "arelia"]
      if (match) {

//        if (whitelisted.includes(username.toLowerCase()))
        return res.status(200).json( { passed: true})
      }
    }
      
      return res.status(401).json({ error: "Invalid username or password" });

      

})

module.exports = router;
