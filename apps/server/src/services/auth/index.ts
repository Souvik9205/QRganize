import { PrismaClient } from "@prisma/client";
import { hash, compare } from "../../script";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config";

const prisma = new PrismaClient();

export const loginService = async (
  email: string,
  password: string
): Promise<{ token?: string; message?: string }> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { message: "User Not Found" };
  }

  const isPasswordValid = await compare(password, user.password);

  if (!isPasswordValid) {
    return { message: "Invalid Credentials" };
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
  return { token };
};

export const registerService = async (
  email: string,
  password: string,
  name: string
): Promise<{ user?: object; message?: string }> => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { message: "Email already in use" };
  }

  const hashedPassword = await hash(password);

  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  return { user: newUser };
};

export const logoutService = async (token: string): Promise<{ message}> => {
  const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
  if (!decoded) {
    return { message: "Invalid Token" };
  }
}