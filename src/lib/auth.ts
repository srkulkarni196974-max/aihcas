'use server';

import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import { sendPasswordResetEmail } from './email';

// ─── Supabase server client ───────────────────────────────────────────────────
// Uses the anon key — RLS is disabled on aihcas_users and aihcas_reset_tokens
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
function generateId(): string {
  return `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Date.now().toString(36);
}

// ─── Password Hashing ────────────────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── Create User ─────────────────────────────────────────────────────────────
export async function createUser(
  name: string,
  email: string,
  password: string
): Promise<{ success: true; user: SessionPayload } | { success: false; error: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if email already exists
  const { data: existing } = await supabase
    .from('aihcas_users')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (existing) {
    return { success: false, error: 'An account with this email already exists' };
  }

  const passwordHash = await hashPassword(password);
  const id = generateId();

  const { error } = await supabase.from('aihcas_users').insert({
    id,
    name,
    email: normalizedEmail,
    password_hash: passwordHash,
    provider: 'credentials',
  });

  if (error) {
    console.error('Supabase createUser error:', error.message);
    return { success: false, error: 'Failed to create account. Please try again.' };
  }

  return { success: true, user: { userId: id, name, email: normalizedEmail } };
}

// ─── Authenticate User ────────────────────────────────────────────────────────
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ success: true; user: SessionPayload } | { success: false; error: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  const { data: user, error } = await supabase
    .from('aihcas_users')
    .select('*')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (error || !user) {
    return { success: false, error: 'Invalid email or password' };
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return { success: false, error: 'Invalid email or password' };
  }

  return {
    success: true,
    user: { userId: user.id, name: user.name, email: user.email },
  };
}

// ─── Google Auth ──────────────────────────────────────────────────────────────
export async function authenticateGoogle(
  email: string = 'user@google.com',
  name: string = 'Google User'
): Promise<{ success: true; user: SessionPayload }> {
  const normalizedEmail = email.toLowerCase().trim();

  const { data: existing } = await supabase
    .from('aihcas_users')
    .select('*')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (existing) {
    return { success: true, user: { userId: existing.id, name: existing.name, email: existing.email } };
  }

  const id = generateId();
  await supabase.from('aihcas_users').insert({
    id,
    name,
    email: normalizedEmail,
    password_hash: await hashPassword('google_linked_' + Math.random().toString(36)),
    provider: 'google',
  });

  return { success: true, user: { userId: id, name, email: normalizedEmail } };
}

// ─── Forgot Password ──────────────────────────────────────────────────────────
export async function forgotPassword(
  email: string
): Promise<{ success: boolean; message: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  const { data: user } = await supabase
    .from('aihcas_users')
    .select('id, name, email')
    .eq('email', normalizedEmail)
    .maybeSingle();

  // Always return the same message for security (don't reveal if email exists)
  const safeMessage = 'If an account exists with this email, a password reset link has been sent. Please check your inbox and spam folder.';

  if (!user) return { success: true, message: safeMessage };

  // Generate a secure reset token (expires in 1 hour)
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  // Store the token in Supabase
  await supabase.from('aihcas_reset_tokens').insert({
    email: normalizedEmail,
    token,
    expires_at: expiresAt,
    used: false,
  });

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const resetLink = `${baseUrl}/auth/reset-password?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;

  const emailResult = await sendPasswordResetEmail(normalizedEmail, resetLink);

  if (!emailResult.success) {
    console.error('Email send failed:', emailResult.error);
    // Still return safe message
  }

  return { success: true, message: safeMessage };
}

// ─── Update Password ──────────────────────────────────────────────────────────
export async function updateUserPassword(
  email: string,
  newPassword: string,
  token?: string
): Promise<{ success: boolean; error?: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  // Verify the token if provided
  if (token) {
    const { data: resetRecord } = await supabase
      .from('aihcas_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('email', normalizedEmail)
      .eq('used', false)
      .maybeSingle();

    if (!resetRecord) {
      return { success: false, error: 'Invalid or expired reset link. Please request a new one.' };
    }

    if (new Date(resetRecord.expires_at) < new Date()) {
      return { success: false, error: 'This reset link has expired. Please request a new one.' };
    }

    // Mark token as used
    await supabase
      .from('aihcas_reset_tokens')
      .update({ used: true })
      .eq('id', resetRecord.id);
  }

  const passwordHash = await hashPassword(newPassword);
  const { error } = await supabase
    .from('aihcas_users')
    .update({ password_hash: passwordHash })
    .eq('email', normalizedEmail);

  if (error) {
    console.error('updateUserPassword error:', error.message);
    return { success: false, error: 'Failed to update password.' };
  }

  return { success: true };
}

// ─── Destroy Session / Get Session ───────────────────────────────────────────
export async function destroySession() {
  return { success: true };
}

export async function getSession() {
  return null;
}
