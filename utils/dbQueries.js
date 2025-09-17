const { Pool } = require("pg");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { ERROR_CODES } = require('./constants.js')

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
  try {

  
    const result = await pool.query("SELECT * FROM users WHERE id = $1;", [userID]);
    if (result.rows.length === 0) {
      return { success: false, error_code: ERROR_CODES.USER_NOT_FOUND, error: `user ${userID} not found` };
    }
    user = result.rows[0];
    return user
  } catch (err) {
    return { success: false, error_code: ERROR_CODES.DB_QUERY_FAILED, error: err};
  }
}

const CreateChannel = async (name, description, user, type) => { 
  try {
    channel = await pool.query(
      "INSERT INTO channels (name, description, created_by, type) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, description, user.id, type]
    );
    return channel.rows[0];
  } catch (err) {
    if (err.code === "23505") {
      return { success: false, error_code: ERROR_CODES.CHANNEL_ALEADYY_EXISTS, error: "Channel name already exists" };
    } else {

    return { success: false, error_code: ERROR_CODES.DB_QUERY_FAILED, error: err };
    }
  };
};

const AdduserToChannel = async (Channel, User) => {
  try {
    console.log(Channel)
    await pool.query(
      "INSERT INTO channel_members (channel_id, user_id) VALUES ($1, $2)", [Channel.id, User.id]
    );
    return { success: true };
  } catch (err) {
    if (err.code === "23505") {
      return { success: false, error_code: ERROR_CODES.USER_ALREADY_IN_CHANNEL, error: "User already in channel" };
    } else {
      return { success: false, error_code: ERROR_CODES.DB_QUERY_FAILED, error: err };
    }
  }
};

const RemoveUserFromChannel = async (Channel, User) => {
  try {
    await pool.query(
      "DELETE FROM channel_members WHERE channel_id = $1 AND user_id = $2", [Channel.id, User.id]
    );
    return { success: true };
    
  } catch (err) {
    return { success: false, error_code: ERROR_CODES.DB_QUERY_FAILED, error: err}
  };
}

const DeleteChannel = async (Channel, user) => {
  try {
    await pool.query(
      "DELETE FROM channels WHERE id = $1", [Channel.id]
    );
    return { success: true };
  } catch (err) {
      return { success: false, error_code: ERROR_CODES.DB_QUERY_FAILED, error: err}
  }
};

const addMessageToChannel = async (user, content, channelId) => {
  try {
    await pool.query(
      "INSERT INTO messages (sender_id, channel_id, content) VALUES ($1, $2, $3)", [user.id, channelId, content]
    );
    return { success: true };
  } catch (err) {
    return { success: false, error_code: ERROR_CODES.DB_QUERY_FAILED, error: err}
  }
};

const addMessageToRead = async (user, messageId) => {
  try {
    await pool.query("INSERT INTO message_reads (message_id, user_id) VALUES ($1, $2)", [messageId, user.id]);
    return { success: true };
  } catch (err) {
    return { success: false, error_code: ERROR_CODES.DB_QUERY_FAILED, error: err}
  }
};


const getMessagesFromChannel = async (channel) => {
  try {
    const result = await pool.query("SELECT * FROM messages WHERE channel_id = $1", [channel.id] )  
    if (result.rows.length != 0) {
      return { success: false, error_code: ERROR_CODES.NO_MESSAGES_FOUND, error: "No messages in this channel" }
    }

    return { success: true, result: result.rows }

  } catch (err) {
    return { success: false, error_code: ERROR_CODES.DB_QUERY_FAILED, error: err }
  }
}
const getUserUnreadChannelMessages = async (user, channel) => {
  try {
    const result = await pool.query("SELECT m.* FROM messages m WHERE m.channel_id = $2 AND NOT EXISTS (SELECT 1 FROM message_reads mr WHERE mr.message_id = m.id AND mr.user_id = $1);", [user.id, channel.id] )
    if (result.rows.length != 0) {
      return { success: false, error_code: ERROR_CODES.NO_MESSAGES_FOUND, error: "No unread messages in channel" }
    }
    return { success: true, result: result.rows }   
  }
  catch (err) {
    return { success: false, error_code: ERROR_CODES.DB_QUERY_FAILED, error: err}
  }
};







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
