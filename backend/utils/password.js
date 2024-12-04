import bcrypt from "bcryptjs";

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

export const validatePassword = async (passwordToCheck, password) => {
  if (passwordToCheck.length < 6) {
    return { isValid: false, msg: "Password must be at least 6 chars" };
  }

  const isMatch = await bcrypt.compare(passwordToCheck, password);

  if (!isMatch) {
    return { isValid: false, msg: "Password is incorrect" };
  }

  return { isValid: true };
};
