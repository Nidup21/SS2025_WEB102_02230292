# Practical 6: Authentication - Token-based (Email & Password) Reflection 🔐  

## 📚 Documentation: Main Concepts Applied  

### 1. Authentication Fundamentals 🔑  
- **Password Hashing**: Used `bcrypt` to securely hash passwords with a cost factor of 4 (adjusted for production).  
  ```typescript  
  const bcryptHash = await Bun.password.hash(body.password, {  
    algorithm: "bcrypt",  
    cost: 4, // Increase for production (e.g., 10-12)  
  });  
  ```  
- **JWT Tokens**: Implemented JSON Web Tokens for stateless authentication, containing a user ID (`sub`) and expiration time (`exp`).  
- **Token Verification**: Middleware validated tokens using Hono’s `jwt` package before granting access to protected routes.  

### 2. Database Design & Relationships 🗄️  
- **User-Account Model**: Established a 1:N relationship between `User` and `Account` entities.  
  ```prisma  
  model User {  
    id           String    @id @default(uuid())  
    email        String    @unique  
    hashPassword String  
    Account      Account[]  
  }  

  model Account {  
    id      String @id @default(uuid())  
    userId  String  
    user    User   @relation(fields: [userId], references: [id])  
    balance Int    @default(0)  
  }  
  ```  
- **Unique Constraints**: Ensured email uniqueness using Prisma’s `@unique` attribute.  

### 3. API Endpoint Security 🛡️  
- **Public Routes**: `/register` and `/login` allowed unauthenticated access.  
- **Protected Routes**: `/protected/*` required a valid JWT in the `Authorization` header.  
- **Error Handling**: Consistent HTTP 401 responses for authentication failures.  

### 4. TypeScript Integration 🦕  
- **Type Safety**: Leveraged Prisma’s generated types and Hono’s request/response typing.  
- **Custom Middleware**: Created type-safe JWT validation middleware.  


## 🎯 Reflection: What I Learned  

### Technical Skills Gained 💻  
#### 1. JWT Authentication Workflow  
- **Token Generation**: Created tokens with user ID and expiration claims.  
- **Verification**: Validated tokens using Hono middleware to protect routes.  
- **Security Trade-offs**: Balanced token expiration times (1 hour) with usability.  

#### 2. Password Security Best Practices  
- **Hashing vs Encryption**: Understood why hashing (irreversible) is preferred over encryption for passwords.  
- **Bcrypt Cost Factor**: Tuned the cost factor to balance security and performance.  
- **Timing Attacks**: Used `Bun.password.verify` to prevent timing attacks during password comparison.  

#### 3. Prisma ORM with TypeScript  
- **Type-Safe Queries**: Leveraged Prisma’s auto-generated types to avoid runtime errors.  
- **Relational Data**: Queried related `Account` data using `select` and `include` clauses.  

#### 4. Error Handling in Auth Systems  
- **Generic Responses**: Returned non-specific error messages (e.g., "Invalid credentials") to prevent information leakage.  
- **Middleware Chaining**: Used Hono’s middleware to handle errors globally.  


## 🚧 Challenges & Solutions  

### Challenge 1: JWT Middleware Configuration  
**Problem**: Protected routes allowed invalid tokens due to incorrect middleware setup.  
**Solution**:  
- Debugged token verification by logging middleware outputs.  
- Ensured the secret key matched between token generation and verification.  
```typescript  
app.use(  
  "/protected/*",  
  jwt({  
    secret: 'mySecretKey', // Must match signing secret  
  })  
);  
```  

### Challenge 2: Password Hashing Consistency  
**Problem**: Login failed because the hashing algorithm differed between registration and verification.  
**Solution**:  
- Explicitly specified the `bcrypt` algorithm in both hash and verify functions:  
  ```typescript  
  // Registration  
  const bcryptHash = await Bun.password.hash(body.password, { algorithm: "bcrypt" });  

  // Login  
  const match = await Bun.password.verify(body.password, user.hashedPassword, "bcrypt");  
  ```  

### Challenge 3: TypeScript Integration  
**Problem**: Type errors occurred when accessing JWT payloads in protected routes.  
**Solution**:  
- Extended Hono’s `Context` type to include the JWT payload:  
  ```typescript  
  declare module 'hono' {  
    interface Context {  
      jwtPayload?: { sub: string; exp: number };  
    }  
  }  

  // Access in route handler  
  const payload = c.get('jwtPayload');  
  ```  

### Challenge 4: Database Constraint Handling  
**Problem**: Duplicate email registrations caused Prisma errors.  
**Solution**:  
- Added explicit error handling for unique constraint violations:  
  ```typescript  
  if (e instanceof Prisma.PrismaClientKnownRequestError) {  
    if (e.code === 'P2002') {  
      return c.json({ message: 'Email already exists' });  
    }  
  }  
  ```  


## 🎓 Key Takeaways  

### 1. Security is Paramount in Auth Systems  
- **Never Trust Input**: Validated all user inputs (emails, passwords) and handled edge cases.  
- **Secrets Management**: Stored JWT secrets and salts in environment variables (not hardcoded).  
- **Least Privilege**: Tokens contained minimal information (user ID only).  

### 2. JWT vs Session Cookies  
- **Stateless**: JWTs eliminate server-side session storage, simplifying scaling.  
- **Cross-Domain**: JWTs work better for APIs consumed by multiple frontends.  
- **Token Expiry**: Short-lived tokens (1 hour) reduce the risk of token theft.  

### 3. ORM Benefits for Auth  
- **Type Safety**: Prisma’s types caught database-related bugs early.  
- **Relationships**: Easily modeled user-account relationships without writing SQL.  
- **Migrations**: Maintained schema consistency across environments.  

### 4. Testing Auth Flows  
- **Automated Tests**: Would add tests for registration, login, and token expiration.  
- **Edge Cases**: Tested invalid passwords, expired tokens, and duplicate emails.  


## 🚀 Future Improvements  

### 1. Enhanced Security  
- **Refresh Tokens**: Implement long-lived refresh tokens to avoid frequent logins.  
- **Rate Limiting**: Prevent brute-force attacks on login endpoints.  
- **HTTPS**: Enforce secure connections in production.  

### 2. User Experience  
- **Password Reset**: Add password recovery via email.  
- **Email Verification**: Validate user emails during registration.  
- **Token Refresh Endpoint**: Automatically renew tokens before expiration.  

### 3. Scalability  
- **Caching**: Cache user data (e.g., account balance) for frequent requests.  
- **Database Indexing**: Optimize queries with indexes on `email` and `userId`.  

### 4. Monitoring & Logging  
- **Auth Logs**: Track login attempts and suspicious activity.  
- **Metrics**: Monitor token expiration rates and authentication failures.  


## 💡 Personal Growth  

This project solidified my understanding of:  
- **End-to-End Auth**: From password hashing to route protection.  
- **Security Trade-offs**: Balancing usability (token lifespan) with security.  
- **TypeScript Integration**: How strong typing improves reliability in complex systems.  

Implementing token-based authentication reinforced the importance of following security best practices and rigorously testing edge cases. I’m now better prepared to build secure, scalable APIs for production applications.