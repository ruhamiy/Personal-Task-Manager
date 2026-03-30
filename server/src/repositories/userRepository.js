import db from "../config/db.js";

export const createUser = async (name, email, password) => {
  const [result] = await db.execute(
    "INSERT INTO User (name, email, password) VALUES (?, ?, ?)",
    [name, email, password]
  );
  return result;
};

export const findUserByEmail = async (email) => {
  const [rows] = await db.execute(
    "SELECT * FROM User WHERE email = ?",
    [email]
  );
  return rows[0];
};