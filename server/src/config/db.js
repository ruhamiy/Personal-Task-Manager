// db layer - connects to db - manages mysql connection pool 

import mysql from "mysql2"; // promise-based MySQL client for Node.js
import dotenv from "dotenv"; // load environment variables from .env file

dotenv.config(); // loads .env file into process.env

// Create a MySQL connection pool using environment variables
// connection pool allows for multiple connections instead of creating a new connection for each request
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  timezone: "Z",
  dateStrings: true,
  ssl: {
    rejectUnauthorized: false
  }
});
// Test the database connection - remove this in production - could cause errors 
pool.getConnection((err, connection) => {
  if (err) {
    console.error("DB Connection Failed:", err.message);
  } else {
    console.log("MySQL Connected!");
    connection.release();
  }
});
// Export the pool as a promise-based interface for easier async/await usage in other parts of the application
// without the promise we would have to use callbacks for every database operation, which can lead to callback hell and less readable code
export default pool.promise();