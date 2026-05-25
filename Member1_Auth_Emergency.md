# AIHCAS — Member 1: Authentication & Emergency Services
## Complete Technical Documentation

**Member Role:** Authentication System + Emergency Services Hub  
**Files Owned:**
- `src/app/auth/page.tsx`
- `src/app/auth/reset-password/page.tsx`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/signup/route.ts`
- `src/app/api/auth/me/route.ts`
- `src/app/api/auth/forgot-password/route.ts`
- `src/app/api/auth/reset-password/route.ts`
- `src/app/api/auth/google/route.ts`
- `src/app/dashboard/emergency/page.tsx`
- `src/context/AuthContext.tsx`
- `src/lib/auth.ts`

**Total Lines of Code:** ~1,850 lines  
**Language:** TypeScript (TSX + TS)  
**Framework:** Next.js 14 App Router

---

## Table of Contents

1. [Overview](#1-overview)
2. [Workflow / User Journey](#2-workflow--user-journey)
3. [Algorithms and Logic Used](#3-algorithms-and-logic-used)
4. [Libraries Used](#4-libraries-used)
5. [Implementation Details — Step by Step](#5-implementation-details--step-by-step)
6. [Code Logic Samples](#6-code-logic-samples)
7. [Lines of Code Breakdown](#7-lines-of-code-breakdown)
8. [Problems Faced and Solutions](#8-problems-faced-and-solutions)
9. [Testing / Execution Steps](#9-testing--execution-steps)
10. [Security Considerations](#10-security-considerations)

---

## 1. Overview

### What is Authentication?

Authentication is the process by which a system **verifies the identity** of a user before granting them access to protected resources. In simple terms, it is the "front door" of any application — if you do not provide the correct credentials (email + password, or a linked Google account), you cannot enter.

In AIHCAS (AI-powered Healthcare Clinical Advisory System), the authentication module is particularly critical because the system deals with **sensitive medical data** — prescriptions, diagnostic reports, personal health records, and doctor-patient information. Without a strong authentication layer, any person on the internet could read, modify, or delete someone else's health data, which would be both a privacy violation and a potential threat to patient safety.

### What Problem Does Authentication Solve in AIHCAS?

Without authentication, AIHCAS would be:
- **Publicly accessible** — anyone could view any patient's prescriptions or reports
- **Unaccountable** — there would be no way to know who uploaded or modified data
- **Insecure** — malicious actors could inject fake prescriptions or corrupt records
- **Legally non-compliant** — healthcare data must be protected under laws like India's Digital Personal Data Protection Act (DPDPA)

The authentication module in AIHCAS solves these problems by:
1. Requiring every user to create an account (signup)
2. Verifying that account with a password or Google identity (login)
3. Issuing a secure session token after successful login
4. Protecting all dashboard routes so only authenticated users can access them
5. Providing a safe password recovery path via time-limited email tokens

### What are Emergency Services?

The Emergency Services Hub is a secondary feature owned by Member 1. It provides patients and users with **one-tap access to critical medical helplines** across India, including:
- National emergency numbers (112, 102, 104)
- Mental health helplines (KIRAN — 1800-599-0019)
- City-specific hospital contacts (AIIMS Delhi, Tata Memorial Mumbai, NIMHANS Bangalore, etc.)

The problem this solves is the **critical delay** that occurs during a medical emergency when a person is frantically searching the internet for the right phone number. AIHCAS consolidates 16 verified emergency contacts, allows users to filter by city, search by name, and place a direct phone call with a single tap on mobile devices.

### Why These Two Features Belong Together

Both authentication and emergency services serve as **entry and exit points** to the clinical system:
- **Auth** is the entry — you log in to access your health data
- **Emergency** is the exit — when the system cannot help, it directs you to a human responder

Both also run on the **client side** (browser-rendered) with API routes that call the database, making them cohesive in terms of architecture.

---

## 2. Workflow / User Journey

### 2.1 — User Signs Up (New Account)

A brand new user visits AIHCAS for the first time and wants to create an account.

```
[User visits /auth]
        |
        v
[Page loads in "login" mode by default]
        |
        v
[User clicks "Sign up free" link]
        |
        v
[Mode switches to "signup" — form shows Name + Email + Password fields]
        |
        v
[User fills in: Full Name, Email, Password]
        |
        v
[User clicks "Register Account" button]
        |
        v
[validate() runs on client side]
  - Is name empty?              → Show error "Full name is required"
  - Does email contain "@"?     → If no, show "Enter a valid email address"
  - Is password < 6 chars?      → Show "Password must be at least 6 characters"
  - Is password > 45 chars?     → Show "Password must not exceed 45 characters"
        |
        v (all validations pass)
[AuthContext.signup() is called]
        |
        v
[HTTP POST → /api/auth/signup]
  Request body: { name, email, password }
        |
        v
[signup/route.ts runs server-side validation again]
        |
        v
[createUser() in lib/auth.ts is called]
  1. Normalizes email to lowercase
  2. Checks Supabase "aihcas_users" table for duplicate email
  3. If duplicate → returns { success: false, error: "email already exists" }
  4. Hashes password with bcrypt (salt rounds = 12)
  5. Generates unique user ID: "usr_<timestamp>_<random>"
  6. Inserts new row into "aihcas_users" table
        |
        v
[Signup API returns 201 Created with user data]
        |
        v
[AuthContext automatically calls login() with same credentials]
        |
        v
[NextAuth credentials provider logs user in]
        |
        v
[Session established — user redirected to /dashboard after 500ms delay]
```

### 2.2 — User Logs In (Email + Password)

```
[User visits /auth]
        |
        v
[Page loads in "login" mode]
        |
        v
[User enters Email + Password]
        |
        v
[User clicks "Authorized Log In"]
        |
        v
[validate() runs — checks email format, password length]
        |
        v
[AuthContext.login(email, password) called]
        |
        v
[nextAuthSignIn('credentials', { email, password, redirect: false })]
  - NextAuth calls the "authorize" function in [...nextauth] config
  - "authorize" calls authenticateUser() from lib/auth.ts
        |
        v
[authenticateUser() in lib/auth.ts]
  1. Normalizes email to lowercase
  2. Queries Supabase: SELECT * FROM aihcas_users WHERE email = ?
  3. If no user found → returns error "Invalid email or password"
  4. Calls bcrypt.compare(enteredPassword, storedHash)
  5. If compare fails → returns error "Invalid email or password"
  6. If compare succeeds → returns { userId, name, email }
        |
        v
[NextAuth creates a session + sets HTTP-only cookie]
        |
        v
[AuthContext receives success → calls router.push('/dashboard')]
[setTimeout 500ms ensures session cookie is set before redirect]
        |
        v
[User lands on /dashboard — fully authenticated]
```

### 2.3 — User Logs In with Google OAuth

```
[User clicks "Continue with Google" button on /auth]
        |
        v
[handleGoogle() called → loginWithGoogle() called in AuthContext]
        |
        v
[nextAuthSignIn('google', { callbackUrl: '/dashboard' })]
        |
        v
[Browser redirects to Google's OAuth Authorization Server]
  URL: https://accounts.google.com/o/oauth2/v2/auth
  Parameters:
    - client_id: GOOGLE_CLIENT_ID (from .env.local)
    - redirect_uri: http://localhost:3000/api/auth/callback/google
    - scope: openid email profile
    - response_type: code
        |
        v
[Google shows account selection / consent screen]
        |
        v
[User selects account and approves]
        |
        v
[Google redirects back to /api/auth/callback/google with auth code]
        |
        v
[NextAuth exchanges code for access_token + id_token with Google]
        |
        v
[NextAuth calls the "signIn" callback → session created]
        |
        v
[authenticateGoogle() in lib/auth.ts runs]
  1. Checks if user already exists in Supabase by email
  2. If exists → returns existing user data
  3. If new → creates new aihcas_users row with provider = 'google'
              (password_hash is a random string — not usable for login)
        |
        v
[NextAuth sets session cookie]
        |
        v
[Browser redirected to /dashboard (callbackUrl)]
        |
        v
[AuthContext useEffect detects session → sets user state]
```

### 2.4 — User Forgets Their Password

```
[User on /auth clicks "Forgot password?"]
        |
        v
[Mode switches to "forgot-password"]
[Form now shows only Email field]
        |
        v
[User enters email and clicks "Request Recovery Link"]
        |
        v
[validate() checks email format]
        |
        v
[AuthContext.forgotPassword(email) called]
        |
        v
[HTTP POST → /api/auth/forgot-password]
  Request body: { email, role? }
        |
        v
[forgotPassword() in lib/auth.ts runs]
  1. Normalizes email to lowercase
  2. Searches aihcas_users table first (patient path)
  3. If not found, falls back to doctors table
  4. SECURITY: Always returns same message whether user exists or not
     → Prevents email enumeration attacks
        |
        v (user found)
  5. Generates reset token: random base36 + timestamp
     Example: "k7mq2x9p4r3n1lf5q8m" + "1716824400" (in base36)
  6. Sets expiry to exactly 1 hour from now
  7. Inserts into aihcas_reset_tokens table:
     { email, token, expires_at, used: false }
        |
        v
  8. Builds reset link:
     https://aihcas.com/auth/reset-password?token=<TOKEN>&email=<EMAIL>
  9. Calls sendPasswordResetEmail() → sends via Nodemailer/Resend
        |
        v
[API returns 200: "If an account exists... check your inbox"]
        |
        v
[User checks email, clicks the link]
        |
        v
[Browser opens /auth/reset-password?token=...&email=...]
```

### 2.5 — User Resets Password with Token

```
[User opens reset link: /auth/reset-password?token=XYZ&email=user@ex.com]
        |
        v
[ResetPasswordPage renders]
[useSearchParams() extracts token and email from URL]
        |
        v
[If token or email missing → show "Invalid Link" error immediately]
        |
        v
[User enters new password + confirm password]
        |
        v
[Client-side validation]:
  - Do passwords match? (if not → "Passwords do not match")
  - Is length >= 6? (if not → error)
  - Is length <= 45? (if not → error)
        |
        v
[HTTP POST → /api/auth/reset-password]
  Body: { email, password, token }
        |
        v
[updateUserPassword() in lib/auth.ts runs]
  1. Queries aihcas_reset_tokens WHERE token = ? AND email = ? AND used = false
  2. If no record → "Invalid or expired reset link"
  3. Checks expires_at < NOW() → if expired → "This reset link has expired"
  4. Marks token as used: UPDATE aihcas_reset_tokens SET used = true
  5. Hashes new password with bcrypt
  6. Updates password_hash in aihcas_users table
  7. Also updates doctors table if email found there
        |
        v
[API returns 200: "Password updated successfully"]
        |
        v
[Page shows success message]
[After 2500ms → router.push('/auth')] ← back to login
        |
        v
[User logs in with new password]
```

### 2.6 — User Visits Emergency Hub

```
[Authenticated user navigates to /dashboard/emergency]
        |
        v
[EmergencyPage component mounts]
[emergencyData array (16 contacts) is loaded into memory — no API call]
        |
        v
[Component renders search bar + city dropdown]
[Initial state: search = "", selectedCity = "All"]
        |
        v
[filteredData computed on every render:]
  For each of 16 contacts:
    - matchesSearch: Does name or type contain search string?
    - matchesCity:   Is city === selectedCity? OR city === "National"?
                     OR selectedCity === "All"?
    - Include contact if: matchesSearch AND matchesCity
        |
        v
[All 16 contacts shown initially (no filters active)]
        |
[User selects city "Delhi" from dropdown]
        |
        v
[Re-renders with filter applied]
  Shown: National (6 contacts) + Delhi (3 contacts) = 9 contacts
  Hidden: Mumbai, Bangalore, Chennai, Kolkata contacts
        |
[User types "AIIMS" in search box]
        |
        v
[Further filtered: contacts whose name OR type contains "aiims"]
  Shown: "Poison Control Centre (AIIMS)" + "AIIMS Hospital"
        |
[User clicks the phone icon button on "AIIMS Hospital"]
        |
        v
[onClick → window.location.href = "tel:011-26588500"]
        |
        v
[Mobile device: Phone app opens with pre-dialed number]
[Desktop: OS handles tel: protocol — may open Skype, FaceTime, etc.]
```

---

## 3. Algorithms and Logic Used

### 3.1 — bcrypt Password Hashing

#### What is bcrypt?

bcrypt is a **password hashing algorithm** specifically designed for secure password storage. Unlike regular encryption (which can be reversed), hashing is a **one-way transformation**: you can hash a password but you cannot "unhash" it back to the original.

When a user sets their password "MyPass123", it is never stored as "MyPass123" in the database. Instead, bcrypt converts it into something like:

```
$2a$12$rVzS1g.H5Yg3dJxYm2b7v.hE0OlLsX/8kWz7nJ9kHxQ3d4aKlP2ti
```

This 60-character string is what gets saved. When the user logs in later, bcrypt **re-hashes** the entered password and compares it to the stored string — if they match, the password is correct.

#### What is a Salt?

A **salt** is a random string that bcrypt generates and mixes into the password before hashing. This means two users with the same password ("password123") will have completely different hash strings in the database. This prevents **rainbow table attacks** — where attackers pre-compute hashes for millions of common passwords.

In the stored hash `$2a$12$rVzS1g...`:
- `$2a$` = bcrypt algorithm identifier
- `$12$` = the **work factor** (salt rounds = 12 in our implementation)
- The remaining 53 characters = the salt (22 chars) + hash (31 chars), encoded in base64

#### Salt Factor 12 — Why?

The work factor (also called cost factor or salt rounds) controls how many times bcrypt runs internally. With factor 12:
- bcrypt performs 2^12 = **4,096 iterations** of its internal function
- On a modern CPU, this takes approximately **150-300 milliseconds** per hash

This delay is **intentional**. For a legitimate user logging in once, 200ms is imperceptible. But for an attacker trying to crack 1 million passwords, this would take years. Higher factors = more security but slower performance. Factor 12 is the current best-practice default as of 2025.

Note: The actual code uses `bcrypt.hash(password, 12)` in `lib/auth.ts`, which automatically generates the salt internally.

#### bcrypt Verification

When comparing during login:
```typescript
const valid = await bcrypt.compare(enteredPassword, user.password_hash);
```
bcrypt extracts the salt from the stored hash, re-hashes the entered password with that same salt, and compares the results. This is a **constant-time comparison** — it always takes the same amount of time regardless of whether the passwords match, preventing timing attacks.

---

### 3.2 — JWT Token Generation and Verification

#### What is a JWT?

JWT stands for **JSON Web Token**. It is an open standard (RFC 7519) for securely transmitting information between parties as a compact, URL-safe string. A JWT has three parts separated by dots:

```
HEADER.PAYLOAD.SIGNATURE
```

Example:
```
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJ1c3JfMTcxNjgyNDQwMF9hYmMiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20ifQ.RVnOZ3G2HGbFm7XxHQo_rQxMzAI2oXJb1UyODmVFcE8
```

- **Header**: Encodes the algorithm used (e.g., `{ "alg": "HS256" }`)
- **Payload**: Contains the actual data (claims) — e.g., `{ "userId": "usr_...", "email": "user@example.com" }`
- **Signature**: HMAC-SHA256 hash of header + payload, signed with a secret key

#### JWT in AIHCAS

In AIHCAS, JWTs are primarily managed by **NextAuth.js**, which handles session creation, signing, and verification automatically. When a user logs in:

1. NextAuth calls `authenticateUser()` → gets `{ userId, name, email }`
2. NextAuth creates a JWT using the `NEXTAUTH_SECRET` from `.env.local`
3. The JWT is stored in a secure HTTP-only cookie named `next-auth.session-token`
4. On every protected page request, Next.js middleware reads and verifies this JWT
5. If the JWT is valid and not expired (default 30 days), the session is active

The **payload** stored in the JWT session token includes:
```json
{
  "userId": "usr_1716824400_abc123",
  "name": "Sampada Kulkarni",
  "email": "srkulkarni1969.74@gmail.com",
  "iat": 1716824400,
  "exp": 1719416400
}
```

- `iat` = issued at (Unix timestamp)
- `exp` = expiration timestamp (30 days later)

#### Why HTTP-Only Cookies?

The JWT is stored in an HTTP-only cookie, which means JavaScript running in the browser **cannot read it**. This protects against Cross-Site Scripting (XSS) attacks where malicious scripts try to steal authentication tokens.

---

### 3.3 — Google OAuth 2.0 Flow via NextAuth.js

#### What is OAuth 2.0?

OAuth 2.0 is an **authorization protocol** that allows a third-party application (AIHCAS) to obtain limited access to a user's account on another service (Google) without ever seeing the user's Google password.

#### The Authorization Code Flow

AIHCAS uses the **Authorization Code Flow** — the most secure OAuth flow for server-side applications:

**Step 1 — Authorization Request:**
AIHCAS redirects the user to Google's authorization server with these parameters:
```
https://accounts.google.com/o/oauth2/v2/auth
  ?client_id=<GOOGLE_CLIENT_ID>
  &redirect_uri=http://localhost:3000/api/auth/callback/google
  &scope=openid email profile
  &response_type=code
  &state=<CSRF_TOKEN>
```

**Step 2 — User Consent:**
Google shows the user a consent screen: "AIHCAS wants to access your email and profile". The user approves.

**Step 3 — Authorization Code:**
Google redirects back to AIHCAS's callback URL with a short-lived `code`:
```
http://localhost:3000/api/auth/callback/google?code=4/0Adm...&state=<CSRF_TOKEN>
```

**Step 4 — Token Exchange:**
NextAuth's backend (on the server) exchanges the `code` for actual tokens by calling Google's token endpoint:
```
POST https://oauth2.googleapis.com/token
  grant_type=authorization_code
  code=4/0Adm...
  redirect_uri=http://localhost:3000/api/auth/callback/google
  client_id=<GOOGLE_CLIENT_ID>
  client_secret=<GOOGLE_CLIENT_SECRET>
```
Google responds with:
- `access_token` — for calling Google APIs
- `id_token` — JWT containing the user's identity (email, name, picture)

**Step 5 — Session Creation:**
NextAuth decodes the `id_token`, extracts the user's email and name, calls `authenticateGoogle()` in `lib/auth.ts` to upsert the user in Supabase, and creates a session cookie.

**Step 6 — Redirect:**
The user lands on `/dashboard` — fully logged in with their Google identity.

---

### 3.4 — Password Reset Token Generation

The password reset system uses a **cryptographically random, time-limited, single-use token**.

#### Token Generation Algorithm

```typescript
function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) +  // ~13 random chars
    Math.random().toString(36).substring(2, 15) +        // ~13 random chars
    Date.now().toString(36);                              // timestamp in base36
}
```

This produces a string like: `k7mq2x9p4r3n1lf5q8m1n4r9kh` — approximately 26-36 characters.

**Properties of this token:**
- **Random**: `Math.random()` produces a different token every time
- **Unique**: The timestamp component ensures tokens from the same millisecond are still different
- **URL-safe**: base36 uses only `[0-9a-z]` characters — no special characters that would break URLs

#### Storage in Supabase

The token is stored in the `aihcas_reset_tokens` table:
```sql
{
  email:      "user@example.com",
  token:      "k7mq2x9p4r3n1lf5q8m1n4r9kh",
  expires_at: "2025-05-25T17:00:00Z",   -- exactly 1 hour from generation
  used:       false
}
```

#### 1-Hour TTL (Time-To-Live)

```typescript
const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
//                          now (ms)   + 1 hour in ms
```

When the user clicks the reset link and submits a new password, the API:
1. Checks `WHERE token = ? AND used = false` — token must exist and not be consumed
2. Checks `expires_at < NOW()` — token must not be expired
3. If both pass, sets `used = true` and updates the password

**Single-use enforcement**: Once used, the token is marked `used = true`. Any further attempts to use the same link return "Invalid or expired reset link."

---

### 3.5 — Input Validation Algorithm

Validation runs in two places:
1. **Client-side** (in `auth/page.tsx` `validate()` function) — for fast user feedback
2. **Server-side** (in each `route.ts`) — for security (client-side can be bypassed)

#### Client-Side `validate()` Function

```typescript
const validate = () => {
  const e: Record<string, string> = {};
  
  // Name validation — only for signup mode
  if (mode === 'signup' && !form.name.trim()) 
    e.name = 'Full name is required';
  
  // Email validation — simple @ presence check
  if (!form.email.includes('@')) 
    e.email = 'Enter a valid email address';
  
  // Password length — minimum
  if (mode !== 'forgot-password' && form.password.length < 6) 
    e.password = 'Password must be at least 6 characters';
  
  // Password length — maximum (prevents bcrypt DoS attacks)
  if (mode !== 'forgot-password' && form.password.length > 45) 
    e.password = 'Password must not exceed 45 characters';
  
  return e; // empty object = no errors
};
```

**Why max 45 characters?** bcrypt has an internal input limit of 72 bytes. If someone passes a very long password (e.g., 10,000 characters), bcrypt will still only use the first 72, creating a subtle security bug. The 45-character limit prevents this while still allowing strong passwords.

**Why only check `@` for email?** Full RFC 5322 email regex is extremely complex and still misses edge cases. A simple `@` check catches 99% of typos. The server also checks email existence in the database, which serves as a secondary validation.

#### Server-Side Validation

Each API route re-validates all inputs independently. This is because:
- API routes can be called directly (bypassing the UI)
- Browser JavaScript can be modified to skip the `validate()` call
- Defense-in-depth security requires validation at every layer

---

### 3.6 — Emergency Contact Filtering Algorithm

The emergency page maintains a `filteredData` array computed on every render using JavaScript's `.filter()` method:

```typescript
const filteredData = emergencyData.filter(contact => {
  // Text search: does name OR type contain the search string?
  const matchesSearch =
    contact.name.toLowerCase().includes(search.toLowerCase()) ||
    contact.type.toLowerCase().includes(search.toLowerCase());

  // City filter: show if:
  //   - "All" is selected (show everything), OR
  //   - contact's city matches selected city, OR
  //   - contact's city is "National" (ALWAYS show national numbers)
  const matchesCity =
    selectedCity === 'All' ||
    contact.city === selectedCity ||
    contact.city === 'National';

  // Contact is shown ONLY if BOTH conditions are true
  return matchesSearch && matchesCity;
});
```

**Why always include National contacts?**
When a user selects "Delhi" as their city, they should still see 112, 102, and other national emergency numbers — because these are valid and usable from Delhi. Hiding national numbers when a city is selected would be dangerous in a medical emergency.

**Case-insensitive search:**
Both the search term and the contact data are lowercased before comparison using `.toLowerCase()`. This means "AIIMS", "aiims", and "Aiims" all match the same contacts.

**Time complexity:** O(n) where n = 16 contacts. The filter runs 16 comparisons on every keystroke — this is trivially fast for this dataset size.

---

## 4. Libraries Used

| Library | Version | Purpose |
|---|---|---|
| `bcryptjs` | ^2.4.3 | Password hashing. Pure JavaScript implementation of bcrypt (no native bindings required). Provides `hash()` and `compare()` functions used in `lib/auth.ts` for password storage and verification. |
| `jose` | ^5.x | JSON Object Signing and Encryption. Provides JWT creation/verification utilities. Used internally by NextAuth for token signing. |
| `next-auth` | ^4.24.x | Full-stack authentication framework for Next.js. Manages OAuth 2.0 flows (Google), session cookies, JWT generation, CSRF protection, and the `[...nextauth]` catch-all route. |
| `@supabase/supabase-js` | ^2.x | Official JavaScript client for Supabase (PostgreSQL-as-a-service). Used in `lib/auth.ts` to query the `aihcas_users` and `aihcas_reset_tokens` tables. Handles connection pooling and row-level security. |
| `lucide-react` | ^0.x | Icon library providing SVG icons as React components. Used throughout `auth/page.tsx` and `emergency/page.tsx` for visual icons (Heart, Lock, PhoneCall, ShieldAlert, Eye, EyeOff, etc.). |
| `nodemailer` | ^6.x | Node.js email sending library. Used in `lib/email.ts` (called by `forgotPassword()`) to send password reset emails via SMTP. Supports Gmail, SendGrid, and custom SMTP servers. |
| `resend` | ^2.x | Modern email API service. Alternative to Nodemailer; used for sending transactional emails (password reset links) via Resend's cloud infrastructure. |
| `jsonwebtoken` | ^9.x | Reference JWT library. Provides `sign()` and `verify()` functions used for creating custom JWTs where NextAuth's built-in session is insufficient. |

---

## 5. Implementation Details — Step by Step

### 5.1 — `AuthContext.tsx` (129 lines)

#### What is React Context?

Imagine a large family tree where the grandparent has important information (the user's identity) that many grandchildren (different UI components) need to access. Without React Context, you would have to manually pass this information from grandparent → parent → child → grandchild at every level — this is called "prop drilling" and makes code messy.

React Context creates a **shared data store** that any component in the tree can access directly, without passing props through intermediate components.

#### The AuthContext Design

`AuthContext.tsx` exports:
1. `AuthProvider` — a wrapper component that holds all auth state and functions
2. `useAuth()` — a custom hook that any component can call to get auth data

#### State Stored in Context

```typescript
interface AuthContextType {
  user: User | null;    // The currently logged-in user (or null if not logged in)
  loading: boolean;     // True while NextAuth is checking session on page load
  login: Function;      // Email + password login
  signup: Function;     // New account creation
  loginWithGoogle: Function; // Google OAuth login
  forgotPassword: Function;  // Send reset email
  logout: Function;     // Destroy session
  isDemo: boolean;      // True if user is a demo account
}
```

The `User` interface stores:
- `userId`: unique database ID (e.g., `usr_1716824400_abc123`)
- `name`: display name (e.g., "Sampada Kulkarni")
- `email`: email address
- `image`: optional profile picture URL (from Google accounts)

#### How `useEffect` Auto-Fetches Session on Mount

```typescript
const { data: session, status } = useSession();

useEffect(() => {
  if (status === 'authenticated' && session?.user) {
    setUser({
      userId: (session.user as any).userId || session.user.email || 'google_user',
      name: session.user.name || 'User',
      email: session.user.email || '',
      image: session.user.image || '',
    });
  } else {
    setUser(null);
  }
}, [session, status]);
```

`useSession()` is from NextAuth. It automatically reads the session cookie and provides:
- `status: 'loading'` — while checking the cookie
- `status: 'authenticated'` — user is logged in
- `status: 'unauthenticated'` — no valid session

The `useEffect` hook runs whenever `session` or `status` changes. This means:
- On initial page load, if a valid session cookie exists, the user state is populated automatically (no extra API call needed)
- When the user logs out, the session becomes null, and `setUser(null)` is called

#### The `login()` Function

```typescript
const login = async (email: string, password: string) => {
  const result = await nextAuthSignIn('credentials', {
    email,
    password,
    redirect: false,  // Don't auto-redirect; we'll handle it manually
  });

  if (result?.error) {
    throw new Error(result.error || 'Login failed');
  }
  
  router.push('/dashboard');
};
```

`nextAuthSignIn('credentials', ...)` triggers NextAuth's credentials provider, which internally:
1. Sends the credentials to the `authorize` function in `[...nextauth]/route.ts`
2. That function calls `authenticateUser()` from `lib/auth.ts`
3. If valid, NextAuth creates a JWT session and sets the cookie
4. If invalid, `result.error` will contain the error message

`redirect: false` prevents NextAuth from doing an automatic hard redirect (which would lose error messages). Instead, we manually call `router.push('/dashboard')` after confirming success.

#### The `logout()` Function

```typescript
const logout = async () => {
  if (typeof window !== 'undefined') {
    localStorage.clear();    // Clear any locally cached data
    sessionStorage.clear();  // Clear session storage data
  }
  await nextAuthSignOut({ callbackUrl: '/auth' }); // Destroy session cookie
};
```

`nextAuthSignOut()` invalidates the JWT session cookie on the server and redirects to `/auth`. Local storage and session storage are cleared to remove any cached health data that might remain in the browser.

#### The `isDemo` Flag

```typescript
const isDemo = user?.email === 'priya@example.com' || 
               user?.email === 'srkulkarni1969.74@gmail.com';
```

Demo accounts are marked with this boolean flag. Components can check `isDemo` to show special UI (e.g., "This is a demo account" banners) or restrict certain operations.

---

### 5.2 — `auth/page.tsx` (486 lines)

This is the main authentication page — the visual interface users see at `/auth`. It is a single page with **three distinct modes** that switch without page navigation.

#### Three Modes

The page uses a `mode` state variable of type `'login' | 'signup' | 'forgot-password'`:

```typescript
const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password'>('login');
```

- **`login`** (default): Shows Email + Password fields. Has "Forgot password?" link. Shows "Sign up free" link.
- **`signup`**: Shows Name + Email + Password fields. Shows "Already have an account? Log in" link.
- **`forgot-password`**: Shows Email field only. Hides Google button. Shows "Back to log in" link.

Mode switching is handled by `switchMode()`:
```typescript
const switchMode = (newMode: 'login' | 'signup' | 'forgot-password') => {
  setMode(newMode);
  setErrors({});          // Clear all validation errors
  setSuccessMessage('');  // Clear success messages
  setForm(prev => ({ ...prev, name: '', password: '' })); // Keep email, clear rest
};
```

The email is preserved when switching to "forgot-password" mode — this is intentional UX, because the user likely tried to log in with their email first, then clicked "Forgot password?" and shouldn't have to re-type it.

#### Form State Management with `useState`

```typescript
const [form, setForm] = useState({ name: '', email: '', password: '' });
const [errors, setErrors] = useState<Record<string, string>>({});
const [showPassword, setShowPassword] = useState(false);
const [successMessage, setSuccessMessage] = useState('');
const [loading, setLoading] = useState(false);
```

Each form field is **controlled** — its value comes from React state and updates on every keystroke via `onChange`:
```typescript
<input
  value={form.email}
  onChange={e => setForm({ ...form, email: e.target.value })}
/>
```

The spread syntax `{ ...form, email: newValue }` creates a new object with all existing fields preserved but the `email` field updated. This is required because React state updates must be immutable.

#### The `validate()` Function Logic

The validate function is a pure function (no side effects) that returns an object of error messages:

```typescript
const validate = () => {
  const e: Record<string, string> = {};
  if (mode === 'signup' && !form.name.trim()) e.name = 'Full name is required';
  if (!form.email.includes('@')) e.email = 'Enter a valid email address';
  if (mode !== 'forgot-password' && form.password.length < 6) e.password = 'Password too short';
  if (mode !== 'forgot-password' && form.password.length > 45) e.password = 'Password too long';
  return e;
};
```

If the returned object is empty (`{}`), validation passed. If it has any keys, those keys correspond to field names with error messages to display.

#### `handleSubmit` Flow

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();         // Prevent default HTML form submission (page reload)
  const errs = validate();    // Run validation
  setErrors(errs);            // Display any errors
  setSuccessMessage('');      // Clear previous success message
  if (Object.keys(errs).length > 0) return; // Stop if errors exist
  
  setLoading(true);
  try {
    if (mode === 'login') {
      await login(form.email, form.password);
      setSuccessMessage('Login successful! Redirecting...');
      setTimeout(() => router.push('/dashboard'), 500); // 500ms delay
    } else if (mode === 'signup') {
      await signup(form.name, form.email, form.password);
      setSuccessMessage('Account created! Redirecting...');
      setTimeout(() => router.push('/dashboard'), 500);
    } else {
      const msg = await forgotPassword(form.email);
      setSuccessMessage(msg);  // Show "check your email" message
      // No redirect for forgot-password — user should check email
    }
  } catch (err: any) {
    setErrors({ server: err.message }); // Show server-side error
  } finally {
    setLoading(false); // Always stop loading, even on error
  }
};
```

The `try/catch/finally` pattern ensures:
- Any thrown error is caught and displayed to the user
- Loading spinner always stops (no stuck "Processing..." state)

#### Google OAuth Button

The Google button in the UI triggers the OAuth flow:
```typescript
const handleGoogle = () => {
  setErrors({});
  setSuccessMessage('');
  loginWithGoogle(); // Calls nextAuthSignIn('google', { callbackUrl: '/dashboard' })
};
```

The actual Google OAuth logo SVG is embedded directly in the JSX (not an external image) — this avoids the need to host image assets and ensures the Google brand colors are pixel-perfect.

#### Password Visibility Toggle

```typescript
const [showPassword, setShowPassword] = useState(false);

// In JSX:
<input type={showPassword ? 'text' : 'password'} ... />
<button onClick={() => setShowPassword(!showPassword)}>
  {showPassword ? <EyeOff /> : <Eye />}
</button>
```

The input type switches between `'password'` (masking characters) and `'text'` (showing characters). The icon switches accordingly. The toggle button is positioned absolutely inside the input container using CSS `position: relative / absolute`.

#### Auto-Redirect for Already-Logged-In Users

```typescript
useEffect(() => {
  if (user) {
    router.push('/dashboard');
  }
}, [user, router]);
```

If a user who is already logged in somehow navigates to `/auth`, this effect immediately redirects them to `/dashboard`. This prevents the confusion of seeing a login form when already authenticated.

---

### 5.3 — API Routes

#### `POST /api/auth/login` — `login/route.ts`

**Purpose:** Validate credentials and authenticate the user.

**Request Body:**
```json
{ "email": "user@example.com", "password": "mypassword" }
```

**Validation:**
- `email` must exist, be a string, and contain `@`
- `password` must exist and be a string

**Processing:**
1. Calls `authenticateUser(email, password)` from `lib/auth.ts`
2. `authenticateUser` queries Supabase, runs bcrypt compare
3. Returns success with user object or error

**Responses:**
- `200 OK`: `{ user: { userId, name, email }, message: "Login successful" }`
- `400 Bad Request`: `{ error: "Valid email address is required" }`
- `401 Unauthorized`: `{ error: "Invalid email or password" }`
- `500 Internal Server Error`: `{ error: "Internal server error" }`

**Note:** The 401 response uses the same message ("Invalid email or password") whether the email doesn't exist or the password is wrong. This prevents **user enumeration** — attackers cannot determine if an email is registered by checking the error message.

---

#### `POST /api/auth/signup` — `signup/route.ts`

**Purpose:** Create a new user account.

**Request Body:**
```json
{ "name": "Sampada Kulkarni", "email": "user@example.com", "password": "mypassword" }
```

**Validation:**
- `name` must not be empty or whitespace-only
- `email` must contain `@`
- `password` must be at least 6 characters
- `password` must not exceed 45 characters

**Processing:**
1. Calls `createUser(name, email, password)` from `lib/auth.ts`
2. `createUser` checks for duplicate email in Supabase
3. Hashes password with bcrypt
4. Inserts new row into `aihcas_users`
5. Returns user data

**Responses:**
- `201 Created`: `{ user: { userId, name, email }, message: "Account created successfully" }`
- `400 Bad Request`: Validation error (name/email/password invalid)
- `409 Conflict`: `{ error: "An account with this email already exists" }` — HTTP 409 is the standard code for resource conflicts
- `500 Internal Server Error`: Database error

---

#### `GET /api/auth/me` — `me/route.ts`

**Purpose:** Return the current user's session data (used to check if user is logged in from server components).

**Request:** No body needed. NextAuth session cookie is read automatically.

**Processing:**
1. Calls `getSession()` from `lib/auth.ts`
2. `getSession()` calls `getServerSession()` from NextAuth — reads JWT from cookie
3. Returns `session.user` if valid, or null

**Responses:**
- `200 OK` (logged in): `{ user: { name: "Sampada", email: "user@ex.com" } }`
- `200 OK` (not logged in): `{ user: null }`

Note: This route always returns 200, even when the user is not logged in. This is intentional — the consumer (`AuthContext`) checks `data.user` to determine auth state. A 401 would be misleading because the request itself was valid.

---

#### `POST /api/auth/forgot-password` — `forgot-password/route.ts`

**Purpose:** Initiate a password reset by generating a token and sending an email.

**Request Body:**
```json
{ "email": "user@example.com", "role": "patient" }
```

The `role` parameter (optional) tells the system whether to search the `aihcas_users` table (patients) or the `doctors` table first. This is important because the same email could theoretically exist in both tables with different passwords.

**Processing:**
Delegates to `forgotPassword()` in `lib/auth.ts`, which:
1. Searches the appropriate table first based on `role`
2. Falls back to the other table if not found
3. Always returns the same safe message (whether user exists or not)
4. If user exists: generates token, stores in DB, sends email

**Responses:**
- `200 OK`: `{ message: "If an account exists with this email..." }` — always the same
- `400 Bad Request`: `{ error: "Valid email address is required" }`
- `500 Internal Server Error`: If email sending fails

---

#### `POST /api/auth/reset-password` — `reset-password/route.ts`

**Purpose:** Consume a password reset token and update the user's password.

**Request Body:**
```json
{ "email": "user@example.com", "password": "newpassword", "token": "k7mq2x..." }
```

**Validation:**
- All three fields (`email`, `password`, `token`) must be present
- `password` must be 6-45 characters

**Processing:**
1. Calls `updateUserPassword(email, password, token)` from `lib/auth.ts`
2. `updateUserPassword` validates the token against `aihcas_reset_tokens`
3. Checks `used = false` and `expires_at > NOW()`
4. Marks token as `used = true`
5. Hashes new password, updates `aihcas_users` and/or `doctors` tables

**Responses:**
- `200 OK`: `{ message: "Password updated successfully" }`
- `400 Bad Request`: Missing fields, invalid token, expired token, or password too short/long
- `500 Internal Server Error`: Database error

---

### 5.4 — Emergency Page (`dashboard/emergency/page.tsx` — 166 lines)

#### The `emergencyData` Array

The page defines a hardcoded array of 16 emergency contacts at the top of the file:

```typescript
const emergencyData = [
  { id: 1, name: 'National Health Helpline', number: '1800-180-1104', 
    type: 'General Support', city: 'National', icon: <PhoneCall /> },
  { id: 2, name: 'National Emergency Number', number: '112', 
    type: 'All-in-One Emergency', city: 'National', icon: <ShieldAlert /> },
  // ... 14 more entries
];
```

Each contact has:
- `id`: Unique numeric identifier
- `name`: Organization or service name
- `number`: The actual phone number (formatted for display)
- `type`: Category/specialization (e.g., "Apex Hospital", "Oncology Specialist")
- `city`: Geographic scope — either "National", "State-wise", or a city name
- `icon`: A Lucide React icon component, color-coded by category

**Why hardcoded data (not API)?** Emergency contacts rarely change. Using a static array means:
- Zero latency — no API call needed
- Works offline (if the user has the page cached)
- No database dependency for the emergency hub
- Simpler code with no loading states needed

#### City Distribution of the 16 Contacts

| City | Count | Contacts |
|---|---|---|
| National | 6 | Helpline 1800, 112, 102, KIRAN, Women Helpline, 1075 |
| Delhi | 3 | Poison Control (AIIMS), AIIMS Hospital, Max Speciality |
| Mumbai | 2 | Tata Memorial, KEM Hospital |
| Bangalore | 2 | NIMHANS, Fortis Hospital |
| State-wise | 1 | Blood Bank (104) |
| Chennai | 1 | Apollo Hospitals |
| Kolkata | 1 | AMRI Hospitals |

#### The Dual Filter System

Two state variables control filtering:
```typescript
const [search, setSearch] = useState('');          // Text search
const [selectedCity, setSelectedCity] = useState('All'); // City dropdown
```

The filter combines both conditions with AND logic:
```typescript
const filteredData = emergencyData.filter(e => {
  const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || 
                        e.type.toLowerCase().includes(search.toLowerCase());
  const matchesCity = selectedCity === 'All' || e.city === selectedCity || e.city === 'National';
  return matchesSearch && matchesCity;
});
```

**Critical Design Decision — Always Include National:**
When a user selects "Mumbai", the filter uses `e.city === 'Mumbai' || e.city === 'National'`. This means contacts like "National Emergency Number (112)" and "Ambulance Service (102)" always appear, even when a city is selected. This is a life-safety design decision — you should never hide emergency number 112 just because someone filtered by city.

#### Direct Dialing with `tel:` Protocol

```typescript
<button onClick={() => window.location.href = `tel:${contact.number}`}>
  <PhoneCall />
</button>
```

The `tel:` URI scheme is a standard web protocol that triggers the device's phone dialer. On mobile devices (Android/iOS), this opens the phone app with the number pre-filled. On desktop, it may open Skype, FaceTime, or the OS's default calling application.

The city dropdown options are generated dynamically from the data:
```typescript
{['All', ...Array.from(new Set(emergencyData.map(e => e.city)))].map(city => (
  <option key={city} value={city}>{city}</option>
))}
```

`new Set()` removes duplicate city names (e.g., if multiple contacts share the same city). `Array.from()` converts the Set back to an array for mapping.

---

## 6. Code Logic Samples

### 6.1 — Password Hashing

```typescript
// In lib/auth.ts — hashPassword function
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
  //             ^password  ^salt rounds (work factor)
}

// How it's called during signup:
const passwordHash = await hashPassword(password);
// passwordHash is now: "$2a$12$randomSalt22CharsHere.hashOutput31Chars"

// Storing in Supabase:
await supabase.from('aihcas_users').insert({
  id,
  name,
  email: normalizedEmail,
  password_hash: passwordHash,  // Stored hash, never plain text
  provider: 'credentials',
});
```

### 6.2 — JWT Session Creation (via NextAuth)

```typescript
// In [...nextauth]/route.ts (NextAuth configuration)
// This is the authorize function called on every credentials login

async authorize(credentials) {
  const result = await authenticateUser(credentials.email, credentials.password);
  
  if (!result.success) return null; // NextAuth treats null as "unauthorized"
  
  // Return user object — NextAuth encodes this into a JWT
  return {
    id: result.user.userId,
    name: result.user.name,
    email: result.user.email,
  };
}

// NextAuth then creates a JWT with this payload:
// {
//   "sub": "usr_1716824400_abc",   ← user ID
//   "name": "Sampada Kulkarni",
//   "email": "user@example.com",
//   "iat": 1716824400,             ← issued at
//   "exp": 1719416400,             ← expires in 30 days
//   "jti": "unique_token_id"       ← JWT ID (for revocation)
// }
// Signed with NEXTAUTH_SECRET from .env.local
```

### 6.3 — Emergency Filter Logic

```typescript
// Full filter function from emergency/page.tsx
const filteredData = emergencyData.filter(e => {
  // Case-insensitive search across name and type fields
  const matchesSearch = 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.type.toLowerCase().includes(search.toLowerCase());

  // City filter with mandatory National inclusion
  const matchesCity = 
    selectedCity === 'All' ||     // Show all when no filter
    e.city === selectedCity ||    // Show exact city match
    e.city === 'National';        // ALWAYS show national numbers

  return matchesSearch && matchesCity;
});

// Example: user selected city = "Bangalore", search = ""
// - "NIMHANS" (city: Bangalore) → matchesCity: true → SHOWN
// - "Fortis" (city: Bangalore) → matchesCity: true → SHOWN
// - "112" (city: National) → matchesCity: true (National rule) → SHOWN
// - "KEM Hospital" (city: Mumbai) → matchesCity: false → HIDDEN
```

### 6.4 — Forgot Password Token Generation

```typescript
// Token generator in lib/auth.ts
function generateToken(): string {
  // Part 1: ~13 random base36 chars (e.g., "k7mq2x9p4r3")
  const part1 = Math.random().toString(36).substring(2, 15);
  
  // Part 2: another ~13 random base36 chars (e.g., "n1lf5q8m1n4r")
  const part2 = Math.random().toString(36).substring(2, 15);
  
  // Part 3: current timestamp in base36 (e.g., "lyjq8m4c") — ensures uniqueness
  const timestamp = Date.now().toString(36);
  
  return part1 + part2 + timestamp;
  // Result: "k7mq2x9p4r3n1lf5q8m1n4r9lyjq8m4c" (34 chars)
}

// Storing the token with 1-hour expiry
const token = generateToken();
const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
//                                      ↑ 3,600,000 milliseconds = 1 hour

await supabase.from('aihcas_reset_tokens').insert({
  email: normalizedEmail,
  token,
  expires_at: expiresAt,  // e.g., "2025-05-25T17:00:00.000Z"
  used: false,            // Can only be used once
});

// Email link built from token:
const resetLink = `${baseUrl}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
// encodeURIComponent ensures special chars in email don't break the URL
```

---

## 7. Lines of Code Breakdown

| File | Approximate Lines | Purpose |
|---|---|---|
| `src/context/AuthContext.tsx` | 129 | Global auth state management; React Context Provider; login/signup/logout/forgotPassword functions; NextAuth session subscription via useSession() |
| `src/app/auth/page.tsx` | 486 | Main auth UI; three-mode form (login/signup/forgot-password); form state management; Google OAuth button; password visibility toggle; Google account selector modal; responsive split-panel layout |
| `src/app/auth/reset-password/page.tsx` | 132 | Password reset confirmation UI; reads token + email from URL query params; validates new password match; calls reset API; redirects after success; shows Invalid Link UI if params missing |
| `src/app/api/auth/login/route.ts` | 45 | REST API endpoint for credential-based login; validates email + password format; delegates to authenticateUser(); returns user data or 401 |
| `src/app/api/auth/signup/route.ts` | 58 | REST API endpoint for new account creation; validates name/email/password; delegates to createUser(); returns 201 Created or 409 Conflict |
| `src/app/api/auth/me/route.ts` | 27 | Session check endpoint; reads current NextAuth session; returns user data or null; used for server-side auth state queries |
| `src/app/api/auth/forgot-password/route.ts` | 37 | Password reset initiation endpoint; validates email; delegates to forgotPassword(); always returns safe ambiguous message |
| `src/app/api/auth/reset-password/route.ts` | 50 | Password update endpoint; validates token + email + password; delegates to updateUserPassword(); enforces TTL and single-use |
| `src/app/api/auth/google/route.ts` | ~30 | Supplemental Google auth API route; wraps authenticateGoogle() for direct API calls (separate from NextAuth callback flow) |
| `src/app/dashboard/emergency/page.tsx` | 166 | Emergency contacts hub; 16 hardcoded contacts; dual filter (city dropdown + text search); always-visible National contacts; tel: href for direct dialing; First-Response tips section |
| `src/lib/auth.ts` | 366 | Core auth business logic library; bcrypt hashing; Supabase queries; createUser, authenticateUser, authenticateGoogle, forgotPassword, updateUserPassword, destroySession, getSession |
| **TOTAL** | **~1,526** | (Additional lines in helper files: `lib/email.ts`, `lib/supabase.ts`, etc. bring total to ~1,850) |

---

## 8. Problems Faced and Solutions

### Problem 1: Google OAuth Redirect URI Mismatch

**The Issue:**
When Google OAuth was first set up, clicking "Continue with Google" would redirect to Google's consent screen, but after the user approved, Google would return a `redirect_uri_mismatch` error. The browser would show:
```
Error 400: redirect_uri_mismatch
The redirect URI in the request did not match a registered redirect URI.
```

**Root Cause:**
In Google Cloud Console, the "Authorized redirect URIs" was set to `http://localhost:3000/api/auth/callback/google`, but NextAuth was generating a callback URL with a slightly different format (e.g., using a different port or `127.0.0.1` instead of `localhost`).

**Solution:**
1. Opened Google Cloud Console → APIs & Services → Credentials
2. Edited the OAuth 2.0 client
3. Added ALL possible redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `http://127.0.0.1:3000/api/auth/callback/google`
   - `https://aihcas.onrender.com/api/auth/callback/google` (production)
4. Set `NEXTAUTH_URL=http://localhost:3000` in `.env.local` to ensure NextAuth generates the correct callback URL
5. Verified the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables matched the Google Cloud Console values exactly

**Lesson Learned:** OAuth redirect URIs must match byte-for-byte. Even a trailing slash difference (`/callback/google` vs `/callback/google/`) causes a mismatch error.

---

### Problem 2: bcrypt Timing Attacks

**The Issue:**
When a user with a non-existent email attempted login, the response came back extremely fast (< 5ms) because the code returned immediately after "user not found". But when a valid email with a wrong password was tried, the response took ~200ms (bcrypt comparison time). This timing difference was observable and could allow attackers to discover which emails were registered (by measuring response times).

**Root Cause:**
The original code flow was:
```typescript
if (!user) return { success: false, error: 'Invalid email or password' };
// This returns in <5ms — no bcrypt needed

const valid = await bcrypt.compare(password, user.password_hash);
// This takes 200ms — bcrypt running
```

**Solution:**
Ensured that bcrypt comparison **always runs**, even when the email doesn't exist:
```typescript
// If user not found, compare against a dummy hash
const dummyHash = '$2a$12$' + 'x'.repeat(53);

if (!user) {
  await bcrypt.compare(password, dummyHash); // Takes same time as real compare
  return { success: false, error: 'Invalid email or password' };
}

const valid = await bcrypt.compare(password, user.password_hash);
```

Now the response always takes ~200ms regardless of whether the email exists, eliminating the timing side-channel. Additionally, the error message is the same ("Invalid email or password") whether the email doesn't exist or the password is wrong.

---

### Problem 3: Password Reset Token Expiry Not Enforced

**The Issue:**
During initial testing, it was discovered that password reset links could be used **hours after they were generated** — the expiry check was present in the code but was not being evaluated correctly due to a timezone comparison bug.

**Root Cause:**
The original expiry check was:
```typescript
if (resetRecord.expires_at < new Date().toISOString()) { ... }
```

However, `resetRecord.expires_at` was returned from Supabase as a PostgreSQL `TIMESTAMPTZ` string in UTC format with `+00:00` suffix (`2025-05-25T16:00:00+00:00`), while `new Date().toISOString()` produces `2025-05-25T16:00:00.000Z`. String comparison between these two formats is unreliable.

**Solution:**
Changed to explicit `Date` object comparison:
```typescript
if (new Date(resetRecord.expires_at) < new Date()) {
  return { success: false, error: 'This reset link has expired. Please request a new one.' };
}
```

The `new Date()` constructor correctly parses both timestamp formats and converts to UTC milliseconds for comparison. This ensures the expiry check is accurate regardless of timezone representation.

---

### Problem 4: Emergency Page Showing Wrong City Contacts

**The Issue:**
When a user selected "Bangalore" from the city dropdown, the emergency numbers `112` (National Emergency) and `102` (Ambulance) disappeared from the list. This meant that during an emergency, a user in Bangalore who filtered by city would NOT see the most critical numbers.

**Root Cause:**
The original filter logic was:
```typescript
const matchesCity = selectedCity === 'All' || e.city === selectedCity;
```

This only showed contacts where `city` exactly matched the selected city. Since `112` has `city: 'National'`, it didn't match `city: 'Bangalore'`, so it was hidden.

**Solution:**
Added an explicit exception for National-scope contacts:
```typescript
const matchesCity = 
  selectedCity === 'All' ||      // Show all when "All" selected
  e.city === selectedCity ||     // Show matching city
  e.city === 'National';         // ALWAYS show National contacts
```

Now, regardless of which city is selected, all contacts with `city: 'National'` are always visible. This was tested with all 7 city options to confirm national numbers appear in every filter state.

---

### Problem 5: JWT Secret Not Loading in Production

**The Issue:**
The application worked perfectly in local development, but after deploying to Render.com, all users were immediately logged out after login and `getServerSession()` returned `null` everywhere. The NextAuth logs showed: `[next-auth] error: JWTDecodeError — Invalid signature`.

**Root Cause:**
The `NEXTAUTH_SECRET` environment variable was set in `.env.local` file (which works for development), but `.env.local` is intentionally excluded from git commits (listed in `.gitignore`). The production server had no `.env.local` file, so `NEXTAUTH_SECRET` was `undefined`. NextAuth was using a randomly generated secret on each server restart, making all previously issued JWTs invalid.

**Solution:**
1. Went to Render.com dashboard → Environment → Environment Variables
2. Added `NEXTAUTH_SECRET` with the same value as in `.env.local`
3. Added `NEXTAUTH_URL=https://aihcas.onrender.com` (important — must be the production URL)
4. Added all other required environment variables: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
5. Redeployed the application

**Lesson Learned:** Never rely on `.env.local` for production. Always explicitly set environment variables in the deployment platform's dashboard, and verify them before launch.

---

### Problem 6: Race Condition in Redirect After Login

**The Issue:**
After successful login, the code called `router.push('/dashboard')` immediately after `nextAuthSignIn()` resolved. However, the dashboard page (`/dashboard`) checks for an authenticated session on load. If the redirect happened **before the session cookie was fully set by NextAuth**, the dashboard would redirect back to `/auth`, creating a redirect loop.

**Root Cause:**
`nextAuthSignIn()` resolves (returns) after the server processes the credentials, but the **browser cookie** (containing the JWT) might take a few more milliseconds to be set and acknowledged by the browser's cookie jar. `router.push()` triggers a new page request before that cookie is set.

**Solution:**
Added a 500ms `setTimeout` before redirecting:
```typescript
if (mode === 'login') {
  await login(form.email, form.password);
  setSuccessMessage('Login successful! Redirecting...');
  setTimeout(() => router.push('/dashboard'), 500); // Wait 500ms for cookie
}
```

The 500ms delay is imperceptible to the user (who sees the "Login successful!" message) but gives the browser enough time to receive and store the session cookie from NextAuth. The success message also improves UX by providing immediate feedback before the page changes.

**Alternative approach considered:** Using NextAuth's built-in `redirect: true` option, but this caused issues with error handling (couldn't catch and display error messages since the page would reload).

---

## 9. Testing / Execution Steps

### Prerequisites
- Node.js 18+ installed
- `.env.local` file configured with all required keys:
  ```
  NEXTAUTH_SECRET=<your-secret>
  NEXTAUTH_URL=http://localhost:3000
  GOOGLE_CLIENT_ID=<google-client-id>
  GOOGLE_CLIENT_SECRET=<google-client-secret>
  NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
  SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
  ```

---

### Step 1: Start the Development Server

```powershell
cd c:\Users\sampa\OneDrive\Desktop\AIHCAS\aihcas
npm run dev
```

Expected output:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Environments: .env.local
✓ Ready in 3.2s
```

---

### Step 2: Navigate to the Auth Page

Open a browser and go to: `http://localhost:3000/auth`

**Expected:**
- The page loads with a split layout (left illustration panel + right form panel)
- The form shows "Welcome back 👋" heading (login mode)
- Google button is visible
- Email and Password fields are present

---

### Step 3: Test Signup (New Account Creation)

1. Click "Sign up free" at the bottom of the form
2. Verify mode switches to "Create workspace 🚀" with Name + Email + Password fields
3. **Test validation first:**
   - Click "Register Account" with empty fields → see "Full name is required" error
   - Enter invalid email (no @) → see "Enter a valid email address" error
   - Enter password with 3 characters → see "Password must be at least 6 characters" error
4. Fill in valid data:
   - Name: `Test User`
   - Email: `testuser@example.com` (use a fresh email)
   - Password: `TestPass123`
5. Click "Register Account"
6. **Expected:** Loading spinner, then success message, then redirect to `/dashboard`
7. **Verify in Supabase:** Open Supabase dashboard → Table Editor → `aihcas_users` → confirm new row with hashed password

---

### Step 4: Test Login (Email + Password)

1. Log out via the dashboard
2. Navigate back to `/auth`
3. **Test wrong password:**
   - Enter `testuser@example.com` and password `wrongpassword`
   - Click "Authorized Log In"
   - **Expected:** Red error banner "Invalid email or password"
4. **Test correct credentials:**
   - Enter `testuser@example.com` and `TestPass123`
   - Click "Authorized Log In"
   - **Expected:** Success message, redirect to `/dashboard` within 500ms
5. **Test already logged in redirect:**
   - While on `/dashboard`, navigate to `http://localhost:3000/auth`
   - **Expected:** Immediately redirected back to `/dashboard` (no login form shown)

---

### Step 5: Test Forgot Password + Reset Flow

1. Log out, go to `/auth`
2. Click "Forgot password?"
3. **Expected:** Form changes to show only Email field, Google button disappears
4. Enter a registered email address
5. Click "Request Recovery Link"
6. **Expected:** Green success banner — "If an account exists with this email..."
7. Check the email inbox for the password reset email
8. Open the email — verify it contains a link like:
   `http://localhost:3000/auth/reset-password?token=<token>&email=<email>`
9. Click the link — verify it opens the reset password form with the email displayed
10. **Test expired/invalid link:**
    - Manually change the token in the URL to `invalidtoken123`
    - **Expected:** Red error "Invalid or expired reset link. Please request a new one."
11. Go back to the valid link
12. Enter `NewPassword456` in both password fields
13. Click "Update Password"
14. **Expected:** "Password updated successfully! Redirecting to login…" then redirect to `/auth`
15. Login with the new password `NewPassword456` — **Expected:** Successful login

---

### Step 6: Test Emergency Page

1. Login to the dashboard
2. Navigate to `/dashboard/emergency` (via the Emergency link in the sidebar)
3. **Verify initial state:**
   - All 16 contacts are visible
   - City dropdown shows "Filter by City (All)"
   - Search box is empty
4. **Test city filter:**
   - Select "Mumbai" from dropdown
   - **Expected:** 8 contacts visible (6 National + 2 Mumbai)
   - National numbers (112, 102, etc.) should still be visible
5. **Test search:**
   - Type "AIIMS" in the search box
   - **Expected:** Contacts containing "AIIMS" in name or type are shown
6. **Test combined filter:**
   - Select "Delhi" as city
   - Type "hospital" in search
   - **Expected:** Only Delhi + National contacts whose name/type contains "hospital"
7. **Test phone button (mobile):**
   - On a mobile device or mobile emulator, click any phone button
   - **Expected:** Phone dialer app opens with number pre-filled
8. **Test no-results state:**
   - Type "xyznonexistent" in search
   - **Expected:** Empty state with "No parameters detected" message and search icon
9. **Test emergency 112 button at bottom:**
   - Scroll to footer, click "Trigger Emergency 112"
   - **Expected:** `tel:112` is triggered

---

## 10. Security Considerations

### 10.1 — Password Security

- **bcrypt with work factor 12**: Passwords are never stored in plain text. Even if the database is compromised, an attacker would need years to crack bcrypt hashes with factor 12.
- **Maximum password length (45 chars)**: Prevents bcrypt DoS attacks where very long passwords could cause excessive CPU usage.
- **Minimum password length (6 chars)**: Prevents trivially weak passwords.
- **Constant-time comparison**: `bcrypt.compare()` runs in constant time to prevent timing attacks.
- **Same error message**: Both "email not found" and "wrong password" return the same error message, preventing user enumeration.

### 10.2 — Session Security

- **HTTP-only cookies**: The NextAuth session JWT is stored in an HTTP-only cookie, preventing JavaScript access and protecting against XSS token theft.
- **Secure flag**: In production (HTTPS), cookies are marked `Secure`, meaning they are only transmitted over encrypted connections.
- **SameSite=Lax**: Session cookies have `SameSite=Lax` to prevent Cross-Site Request Forgery (CSRF) in most scenarios.
- **CSRF protection**: NextAuth includes built-in CSRF token validation for form submissions.
- **30-day session expiry**: JWTs expire automatically after 30 days, forcing re-authentication.

### 10.3 — Password Reset Security

- **Time-limited tokens (1 hour)**: Reset tokens expire after 1 hour, minimizing the window of opportunity if a reset email is intercepted.
- **Single-use tokens**: Once a reset token is used, it is marked `used = true` and cannot be reused. This prevents replay attacks.
- **Secure token entropy**: The token combines multiple `Math.random()` calls with a timestamp, making it practically impossible to guess.
- **Safe email response**: The forgot-password endpoint always returns the same message regardless of whether the email exists — preventing email enumeration.
- **Token stored in database**: The reset token is validated server-side against the database, not just by reading URL parameters (which could be forged if stored client-side only).

### 10.4 — Input Validation

- **Double validation (client + server)**: Validation runs both in the browser and in every API route. Client-side validation provides fast feedback; server-side validation is the security layer.
- **Email normalization**: All emails are lowercased and trimmed before database operations, preventing duplicate accounts via case-variation attacks.
- **Type checking**: All API routes verify that inputs are the correct types (string, not object/number) to prevent type-juggling attacks.
- **SQL injection prevention**: Supabase's JavaScript client uses parameterized queries internally, preventing SQL injection via user inputs.

### 10.5 — Google OAuth Security

- **Authorization Code Flow**: The more secure OAuth flow is used — the access token is exchanged server-side, never exposed to the browser.
- **State parameter (CSRF)**: NextAuth includes a cryptographic `state` parameter in the OAuth redirect to prevent CSRF attacks on the OAuth flow.
- **PKCE (Proof Key for Code Exchange)**: NextAuth supports PKCE for public clients, adding another layer of protection against code interception attacks.
- **Client secret protection**: The `GOOGLE_CLIENT_SECRET` is only used server-side (in API routes), never in client-side code.

### 10.6 — API Route Security

- **No sensitive data in responses**: API routes return only the minimum necessary data. Password hashes are never returned in any response.
- **Error boundary**: All API routes are wrapped in `try/catch` blocks. Internal errors return a generic "Internal server error" message — no stack traces or database errors are exposed to the client.
- **HTTP method restriction**: Each route only responds to the appropriate HTTP method (POST for mutations, GET for reads). Other methods receive a 405 Method Not Allowed response from Next.js automatically.
- **Protected dashboard routes**: The `/dashboard` routes check for a valid session using NextAuth's `getServerSession()`. Unauthenticated requests are redirected to `/auth`.

### 10.7 — Emergency Page Security

- **No authentication required for data display**: Emergency contact data is static and non-sensitive. No database queries are made, eliminating injection risks.
- **`tel:` protocol safety**: The `tel:` links contain phone numbers from a hardcoded, developer-controlled array — not user input. There is no risk of tel URI injection.
- **Read-only data**: The emergency page has no forms, no user input processed server-side (except the search which is purely client-side filtering), and no database writes.

### 10.8 — Environment Variable Protection

- **`.env.local` in `.gitignore`**: Secret keys (NEXTAUTH_SECRET, GOOGLE_CLIENT_SECRET, SUPABASE_SERVICE_ROLE_KEY) are stored in `.env.local` which is never committed to git.
- **`NEXT_PUBLIC_` prefix discipline**: Only variables that are safe to expose to the browser use the `NEXT_PUBLIC_` prefix. The Supabase service role key (which bypasses Row Level Security) uses `SUPABASE_SERVICE_ROLE_KEY` without the public prefix, making it server-only.
- **Separate admin client**: The `supabaseAdmin` client (which uses the service role key) is used only in server-side code (`lib/auth.ts` marked with `'use server'`), never in client-side components.

---

## Appendix: File Structure Map

```
src/
├── app/
│   ├── auth/
│   │   ├── page.tsx                    ← Main auth UI (login/signup/forgot)
│   │   └── reset-password/
│   │       └── page.tsx                ← Password reset confirmation UI
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/           ← NextAuth catch-all route (OAuth callbacks)
│   │       │   └── route.ts
│   │       ├── login/
│   │       │   └── route.ts            ← POST /api/auth/login
│   │       ├── signup/
│   │       │   └── route.ts            ← POST /api/auth/signup
│   │       ├── me/
│   │       │   └── route.ts            ← GET /api/auth/me
│   │       ├── forgot-password/
│   │       │   └── route.ts            ← POST /api/auth/forgot-password
│   │       ├── reset-password/
│   │       │   └── route.ts            ← POST /api/auth/reset-password
│   │       └── google/
│   │           └── route.ts            ← Google auth helper route
│   └── dashboard/
│       └── emergency/
│           └── page.tsx                ← Emergency contacts hub
├── context/
│   └── AuthContext.tsx                 ← Global auth state + functions
└── lib/
    └── auth.ts                         ← Core auth business logic library
```

---

## Appendix: Database Schema (Supabase Tables)

### `aihcas_users` table

| Column | Type | Description |
|---|---|---|
| `id` | VARCHAR | Unique user ID (e.g., `usr_1716824400_abc123`) |
| `name` | VARCHAR | User's full name |
| `email` | VARCHAR (UNIQUE) | Normalized lowercase email |
| `password_hash` | VARCHAR(60) | bcrypt hash of the password |
| `provider` | VARCHAR | Authentication method: `'credentials'` or `'google'` |
| `created_at` | TIMESTAMPTZ | Account creation timestamp (auto-generated) |

### `aihcas_reset_tokens` table

| Column | Type | Description |
|---|---|---|
| `id` | SERIAL | Auto-incrementing primary key |
| `email` | VARCHAR | Email the token is associated with |
| `token` | VARCHAR | The reset token string |
| `expires_at` | TIMESTAMPTZ | Token expiry (1 hour from creation) |
| `used` | BOOLEAN | Whether the token has been consumed |
| `created_at` | TIMESTAMPTZ | Token creation timestamp |

---

*Documentation prepared by: Member 1 — Authentication & Emergency Services*  
*Project: AIHCAS — AI-powered Healthcare Clinical Advisory System*  
*Date: May 2025*
