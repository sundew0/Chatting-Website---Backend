const { Pool } = require('pg');

// Configure connection
const pool = new Pool({
  user: 'sundew',          // your PostgreSQL username
  host: '192.168.0.160',   // Raspberry Pi IP
  database: 'chatsite_dev',// or chatsite_prod
  password: 'MadsSunny1!0',// the password for sundew
  port: 5432,              // default PostgreSQL port
});

// Test connection
const CreateChannels = `
CREATE TABLE channels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;
const CreateDMS = `
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL REFERENCES users(id),
    receiver_id INT REFERENCES users(id),   
    channel_id INT REFERENCES channels(id), 
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read BOOLEAN DEFAULT FALSE           
);
`
const createMany2Many = `
CREATE TABLE channel_members (
    channel_id INT REFERENCES channels(id),
    user_id INT REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (channel_id, user_id)
);`

const tables = [CreateChannels, CreateDMS, createMany2Many];



pool.query(CreateDMS, (err, res) => {
  if (err) {
    console.error('Error creating table', err.stack);
  } else {
    console.log('Users table created successfully!');
  }
  pool.end(); // close connection
});
