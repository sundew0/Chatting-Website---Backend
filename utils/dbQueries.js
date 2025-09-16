const { Pool } = require("pg");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

require("dotenv").config({path: __dirname + '/../.env'});

const pool = new Pool({
  user: process.env.DB_USER,          // your PostgreSQL username
  host: process.env.DB_HOST,   // Raspberry Pi IP
  database: process.env.DB_TABLE,// or chatsite_prod
  password: process.env.DB_PASS,// the password for sundew
  port: process.env.DB_PORT,              // default PostgreSQL port
});



const CreateAccount = async (username, hashedPassword) => {
  
  try {
    await pool.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2)",
      [username, hashedPassword]
    );
    console.log("User inserted successfully!");
  } catch (err) {
  {if (err.code === "23505") 
      {
        console.log("user already exists")
        
      };
    if (err) {
  
      console.error('Error creating table', err.stack);
    }
  }}
}

const LoginUser = async (username, password) => {
  try {
    // Fetch the user by username
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return { success: false, message: "User not found" };
    }

    const user = result.rows[0];

    // Compare the password with the hashed password
    const match = await bcrypt.compare(password, user.password_hash);

    if (match) {
      // Generate JWT token
      payload = { userId: user.id, username: user.username };
      token_expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      const token = jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRES_IN });
      
      pool.query("UPDATE users SET token = $2, token_expiry = $3 WHERE users.id = $1;", [user.id, token, token_expiry]); // 1 hour expiry

      return { success: true, user, token };
    } else {
      return { success: false, message: "Invalid password" };
    }
  } catch (err) {
    console.error("Error during login:", err);
    return { success: false, message: "Server error" };
  }
};

//CreateAccount("sundew", "$2b$12$kSk07iKYwOslPetyZk02TO6GLdWSQvYTCT.9K5FYINp6OPEVOTotq"); // password is MadsSunny1!0


//test cases
const testuser =  {
    id: 1,
    username: 'sundew',
    password_hash: '$2b$12$kSk07iKYwOslPetyZk02TO6GLdWSQvYTCT.9K5FYINp6OPEVOTotq',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoic3VuZGV3IiwiaWF0IjoxNzU4MDE2MzQ0LCJleHAiOjE3NTgwMTk5NDR9.SISe-YwVJn7hCT_JO8HwKzEVZeZ7WVtS9qemzUHYlDk',
    token_expiry: "2025-09-16T10:52:24.082Z",
    created_at: "2025-09-16T08:57:59.764Z"
  };
/*LoginUser("sundew", "MadsSunny1!0").then(result => {
  console.log(result);
  user = result.user;
});
*/
const getUserFromID = async (userID) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1;", [userID]);
  if (result.rows.length === 0) {
    return { success: false, message: "User not found" };
  }
  user = result.rows[0];
  return user
}

const CreateChannel = async (name, description, user, type) => { 
  try {
    channel = await pool.query(
      "INSERT INTO channels (name, description, created_by, type) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, description, user.id, type]
    );
    console.log("Channel created:", name);
    return channel.rows[0];
  } catch (err) {
    if (err.code === "23505") {
      console.log("Channel name already exists");
    } else {
      console.error("Error creating channel:", err);
    }
  };
};

const AdduserToChannel = async (Channel, User) => {
  try {
    console.log(Channel)
    await pool.query(
      "INSERT INTO channel_members (channel_id, user_id) VALUES ($1, $2)", [Channel.id, User.id]
    );
    console.log(`User ${User.id} added to channel ${Channel.id}`);
  } catch (err) {
    if (err.code === "23505") {
      console.log("User already in channel"); 
    } else {
      console.error("Error adding user to channel:", err);
    }
  }
};

const RemoveUserFromChannel = async (Channel, User) => {
  try {
    await pool.query(
      "DELETE FROM channel_members WHERE channel_id = $1 AND user_id = $2", [Channel.id, User.id]
    );
    console.log(`User ${User.id} removed from channel ${Channel.id}`);
  } catch (err) {
      console.error("Error removing user from channel:", err);
  }
};

const DeleteChannel = async (Channel, user) => {
  try {
    await pool.query(
      "DELETE FROM channels WHERE id = $1", [Channel.id]
    );
    console.log(`Channel ${Channel.id} deleted`);
  } catch (err) {
      console.error("Error deleting channel:", err);
  }
};

const addMessageToChannel = async (user, content, channelId) => {
  try {
    await pool.query(
      "INSERT INTO messages (sender_id, channel_id, content) VALUES ($1, $2, $3)", [user.id, channelId, content]
    );
    console.log(`Message from ${user.id} to channel ${channelId} added`);
  } catch (err) {
      console.error("Error adding message to channel:", err);
  }
};

const addMessageToRead = async (user, messageId) => {
  try {
    await pool.query("INSERT INTO message_reads (message_id, user_id) VALUES ($1, $2)", [messageId, user.id]);
  } catch (err) {
      console.error("Error marking message as read:", err);
  }
};


const getMessagesFromChannel = async (channel) => {
  try {
    
  } catch (err) {
    console.error('couldnt find messages:', err)
  }
}



//CreateChannel("test", "General discussion", testuser, 1);
//const channel = {id: 1, name: "general", description: "General discussion", created_by: 1, created_at: "2025-09-16T11:03:00.123Z"};
//AdduserToChannel(channel, user);
//RemoveUserFromChannel(channel, user);

module.exports = { 
  CreateAccount, 
  LoginUser, 
  CreateChannel, 
  AdduserToChannel, 
  RemoveUserFromChannel, 
  DeleteChannel,
  addMessageToChannel,
  addMessageToRead,
  getUserFromID
};
