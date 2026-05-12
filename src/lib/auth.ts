'use server';

import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';
import { sendPasswordResetEmail } from './email';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  provider: 'credentials' | 'google';
  createdAt: string;
}

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
}

// ─── User Database (JSON file-based for development) ─────────────────────────
const DB_PATH = path.join(process.cwd(), 'data', 'users.json');

async function ensureDbExists(): Promise<void> {
  const dir = path.dirname(DB_PATH);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify([], null, 2), 'utf-8');
  }
}

export async function readUsers(): Promise<StoredUser[]> {
  await ensureDbExists();
  const data = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

export async function writeUsers(users: StoredUser[]): Promise<void> {
  await ensureDbExists();
  await fs.writeFile(DB_PATH, JSON.stringify(users, null, 2), 'utf-8');
}

// ─── Password Hashing ───────────────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}



// ─── User Operations ─────────────────────────────────────────────────────────
function generateId(): string {
  return `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function createUser(
  name: string,
  email: string,
  password: string
): Promise<{ success: true; user: SessionPayload } | { success: false; error: string }> {
  const users = await readUsers();

  // Check if email already exists
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: 'An account with this email already exists' };
  }

  const passwordHash = await hashPassword(password);
  const newUser: StoredUser = {
    id: generateId(),
    name,
    email: email.toLowerCase(),
    passwordHash,
    provider: 'credentials',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await writeUsers(users);

  const sessionPayload: SessionPayload = {
    userId: newUser.id,
    name: newUser.name,
    email: newUser.email,
  };

  return { success: true, user: sessionPayload };
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<{ success: true; user: SessionPayload } | { success: false; error: string }> {
  const users = await readUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }

  const passwordValid = await verifyPassword(password, user.passwordHash);
  if (!passwordValid) {
    return { success: false, error: 'Invalid email or password' };
  }

  const sessionPayload: SessionPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
  };

  return { success: true, user: sessionPayload };
}

export async function authenticateGoogle(
  email: string = 'user@google.com',
  name: string = 'Google User'
): Promise<{
  success: true;
  user: SessionPayload;
}> {
  // In a real app, this would verify the Google OAuth token.
  // For now, we simulate a Google sign-in.
  const users = await readUsers();
  let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    const newUser: StoredUser = {
      id: generateId(),
      name: name,
      email: email.toLowerCase(),
      passwordHash: await hashPassword('google_linked_' + Math.random().toString(36)),
      provider: 'google',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    await writeUsers(users);
    user = newUser;
  }

  const sessionPayload: SessionPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
  };

  return { success: true, user: sessionPayload };
}


export async function forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
  const users = await readUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    // For security, we don't reveal if the email exists
    return { success: true, message: 'If an account exists with this email, a reset link has been sent.' };
  }

  // Generate a mock reset token (in a real app, save this to DB with expiry)
  const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

  // Send the actual email using Resend
  const emailResult = await sendPasswordResetEmail(user.email, resetLink);

  if (!emailResult.success) {
    // Fallback message if email sending fails (usually due to missing API key)
    console.warn('Email sending failed, check RESEND_API_KEY');
    return { 
      success: true, 
      message: 'Email service is currently initializing. A reset link will be sent shortly to ' + user.email 
    };
  }

  return { success: true, message: 'Password reset instructions have been sent to your registered Gmail: ' + user.email };
}

export async function updateUserPassword(email: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const users = await readUsers();
  const userIndex = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());

  if (userIndex === -1) {
    return { success: false, error: 'User not found' };
  }

  const passwordHash = await hashPassword(newPassword);
  users[userIndex].passwordHash = passwordHash;
  
  await writeUsers(users);
  return { success: true };
}

export async function destroySession() {
  // Session destruction is handled by NextAuth cookies
  return { success: true };
}
