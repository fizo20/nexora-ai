// src/services/auth.service.ts
import { User } from "../models/user.model";
import { hashPassword, comparePassword } from "../utils/password";
import { AppError } from "../utils/app-error";

export const registerUser = async (data: {
  email: string;
  password: string;
  name: string;
}) => {
  const exists = await User.findOne({ email: data.email });
  if (exists) {
    throw new AppError("Email already in use", 409);
  }

  const hashedPassword = await hashPassword(data.password);

  return User.create({
    email: data.email,
    password: hashedPassword,
    name: data.name,
  });
};

export const loginUser = async (data: { email: string; password: string }) => {
  const user = await User.findOne({ email: data.email }).select("+password");
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const valid = await comparePassword(data.password, user.password);
  if (!valid) {
    throw new AppError("Invalid credentials", 401);
  }

  return user;
};
