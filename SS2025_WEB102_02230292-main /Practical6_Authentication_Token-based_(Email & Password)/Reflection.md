# Practical 6: Authentication - Token-based (Email & Password) Reflection 🤔  

## 📚 Documentation: Main Concepts Applied  

### 1. Authentication vs Authorization 🔐  
- **Authentication**: Verifying user identity (e.g., email/password login).  
- **Authorization**: Granting access to resources post-authentication (e.g., viewing account balance).  
- **Real-world Example**:  
  - **AuthN**: Showing a driver's license to prove identity.  
  - **AuthZ**: Using a ticket to enter a concert venue.  

### 2. Password Security with Bcrypt 🛡️  
- **Hashing**: Converting passwords to irreversible hashes using bcrypt.  
- **Salt Rounds**: Adjustable cost factor (e.g., `cost: 10`) to slow down brute-force attacks.  
- **Verification**: Comparing submitted passwords against stored hashes without reversing them.  

**Code Example**:  
```typescript  
// Hashing password  
const hash = await Bun.password.hash("secureP@ss123", { algorithm: "bcrypt", cost: 10 });  
// Verifying password  
const isMatch = await Bun.password.verify("secureP@ss123", hash, "bcrypt");  
```  

### 3. JWT (JSON Web Token) Fundamentals 🎫  
- **Structure**: `Header.Payload.Signature` (encoded with Base64).  
- **Stateless Auth**: Server doesn’t store sessions; tokens contain user info.  
- **Payload Claims**:  
  - `sub` (subject): User ID.  
  - `exp` (expiration): Token expiry time.  
- **Signing**: Using a secret key to ensure token integrity.  

### 4. Middleware for Route Protection 🔧  
- **JWT Verification**: Middleware checks token validity before allowing route access.  
- **Error Handling**: Uniform 401 responses for unauthorized requests.  
- **Code Reusability**: Apply middleware to multiple protected routes.  

**Middleware Example**:  
```typescript  
app.use("/protected/*", jwt({ secret: "yourSecretKey" }));  
```  

### 5. Database Relationships 🗄️  
- **1:N Relationship**: One user can have multiple accounts (e.g., checking/savings).  
- **Prisma ORM**: Handles foreign key constraints and nested queries.  
- **Schema Design**:  
  ```prisma  
  model User {  
    id           String    @id @default(uuid())  
    email        String    @unique  
    hashedPassword String  
    accounts     Account[]  
  }  
  model Account {  
    id      String @id @default(uuid())  
    userId  String  
    user    User   @relation(fields: [userId], references: [id])  
    balance Int    @default(0)  
  }  
  ```  


## 💭 Reflection: What I Learned  

### Technical Skills Gained 💻  
#### 1. Password Hashing Best Practices  
- **Never Store Plain Text**: Hashing with bcrypt adds a layer of security.  
- **Cost Factor Impact**: Higher salt rounds (e.g., 12) improve security but increase server load.  
- **Timing Attacks**: Using `Bun.password.verify` prevents attackers from measuring hash comparison times.  

#### 2. JWT Authentication Workflow  
- **Token Lifecycle**: Generate on login → Attach to requests → Verify on protected routes.  
- **Security Risks**: Short-lived tokens (1 hour) reduce theft impact; long-lived refresh tokens needed for reauthentication.  
- **Payload Constraints**: Only include non-sensitive data (user ID, not email/password).  

#### 3. Middleware Architecture  
- **Separation of Concerns**: Authentication logic is isolated from route handlers.  
- **TypeScript Integration**: Extended Hono’s `Context` to type JWT payloads.  
- **Error Propagation**: Middleware catches token validation errors and returns 401 responses.  

#### 4. Database Design for Auth Systems  
- **Normalization**: Storing user accounts separately avoids data duplication.  
- **Unique Constraints**: `@unique` on email prevents duplicate registrations.  
- **Prisma’s Type Safety**: Auto-generated types catch database errors at compile time.  


## 🚧 Challenges & Solutions  

### Challenge 1: JWT Payload Security  
**Problem**: Initially included email in JWT payload, risking exposure.  
**Solution**:  
- Removed email from payload, storing only `sub` (user ID).  
- Queried user data from the database using the ID in protected routes.  
**Learning**: JWTs are encoded, not encrypted—never include sensitive data in the payload.  

### Challenge 2: Password Hashing Consistency  
**Problem**: Login failed due to mismatched hashing algorithms.  
**Solution**:  
- Explicitly specified `bcrypt` in both hash and verify functions:  
  ```typescript  
  // Registration  
  const hash = await Bun.password.hash(password, { algorithm: "bcrypt" });  
  // Login  
  const match = await Bun.password.verify(password, hash, "bcrypt");  
  ```  
**Learning**: Always specify the algorithm to avoid default behavior mismatches.  

### Challenge 3: Middleware Type Errors  
**Problem**: TypeScript couldn’t infer JWT payload in protected routes.  
**Solution**:  
- Extended Hono’s context with JWT payload types:  
  ```typescript  
  declare module 'hono' {  
    interface Context {  
      jwtPayload?: { sub: string; exp: number };  
    }  
  }  
  ```  
**Learning**: TypeScript requires explicit declarations for custom middleware data.  

### Challenge 4: Database Migration Complexity  
**Problem**: Adding `hashedPassword` to an existing user model caused schema errors.  
**Solution**:  
- Used Prisma’s `db push` to apply migrations and `generate` to update types.  
- Ensured existing users weren’t affected by phased updates.  
**Learning**: Database schema changes require careful planning and testing.  


## 🎯 Key Insights  

### 1. Security Is a Layered Approach  
- **Input Validation**: Check email format and password strength on both client/server.  
- **Rate Limiting**: Prevent brute-force attacks by limiting login attempts.  
- **HTTPS**: Always use encryption in production to protect token transmission.  

### 2. JWT Trade-offs  
- **Stateless Advantages**: Scales easily across servers without session storage.  
- **Refresh Tokens**: Needed to balance short-lived access tokens (security) and user experience (fewer logins).  
- **Revocation Difficulty**: Expired tokens can’t be revoked early; use short expiry times.  

### 3. User Experience in Auth  
- **Clear Error Messages**: "Invalid credentials" (not "Email not found") to prevent user enumeration.  
- **Token Auto-Refresh**: Background token renewal before expiry to avoid abrupt logouts.  
- **Password Recovery**: Implement email-based reset flows for forgotten passwords.  

### 4. ORM Benefits for Auth  
- **Type Safety**: Prisma prevents runtime errors from invalid database queries.  
- **Relationship Queries**: Easily fetch a user’s accounts with `include: { accounts: true }`.  
- **Migrations**: Version-controlled schema changes simplify team development.  


## 🚀 Future Improvements  

### 1. Enhanced Security Features  
- **2FA (Two-Factor Authentication)**: Add TOTP (Time-based One-Time Password) support.  
- **Password Policy Enforcement**: Require minimum length, special characters, etc.  
- **IP Tracking**: Log login IPs to detect suspicious activity.  

### 2. User Experience Upgrades  
- **Email Verification**: Require users to confirm email addresses on registration.  
- **Social Login**: Integrate Google/Facebook OAuth for easier onboarding.  
- **Token Refresh Endpoint**: Automatically renew tokens before expiry.  

### 3. Scalability & Monitoring  
- **Caching**: Cache user profiles to reduce database load.  
- **Auth Logging**: Track login attempts, token usage, and failures.  
- **Rate Limiting**: Implement per-IP request throttling with `express-rate-limit`.  

### 4. Compliance & Accessibility  
- **GDPR Compliance**: Add account deletion and data export endpoints.  
- **Password Hint Options**: Securely store password hints for recovery.  


## 💡 Personal Growth  

This project deepened my understanding of:  
- **End-to-End Auth Workflows**: From password hashing to protected route access.  
- **Security Mindset**: Prioritizing user data protection over development convenience.  
- **TypeScript in Backend Development**: How strong typing improves code reliability.  

Building a secure authentication system taught me that security requires constant vigilance—from initial design to ongoing maintenance. The experience will be invaluable for future projects, where protecting user credentials and data access will remain a top priority.