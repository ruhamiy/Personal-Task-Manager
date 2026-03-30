export const validateRegister = (data) => {
  const { fullName, email, password, confirmPassword } = data;

  if (!fullName || !email || !password || !confirmPassword) {
    throw new Error("All fields are required");
  }

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
};

export const validateLogin = (data) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }
};