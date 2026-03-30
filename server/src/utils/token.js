import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign(
    { userId: user.user_id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};