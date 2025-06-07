# 📱 Practical 4: Connecting TikTok to PostgreSQL with Prisma ORM Reflection  

## 📚 Documentation: Main Concepts Applied  

### 1. Database Schema Design 🗄️  
- **Entity-Relationship Modeling**: Designed tables for users, videos, comments, likes, and follows.  
- **Relationship Types**:  
  - One-to-Many: Users have many videos.  
  - Many-to-Many: Users can like multiple videos (via a junction table).  
- **Data Integrity**: Used foreign keys to enforce referential integrity.  

**Schema Example (prisma/schema.prisma)**:  
```prisma  
model User {  
  id        String   @id @default(uuid())  
  username  String   @unique  
  email     String   @unique  
  password  String  
  videos    Video[]  
  comments  Comment[]  
  likes     Like[]  
  followers Follower[] @relation("FollowerUser")  
  following Follower[] @relation("FollowingUser")  
}  

model Video {  
  id          String    @id @default(uuid())  
  title       String  
  description String?  
  userId      String  
  user        User      @relation(fields: [userId], references: [id])  
  comments    Comment[]  
  likes       Like[]  
}  
```  

### 2. Prisma ORM Implementation ⚙️  
- **Data Modeling**: Defined database schema in `schema.prisma`.  
- **Migrations**: Used `prisma migrate` to version-control schema changes.  
- **CRUD Operations**: Leveraged Prisma Client for type-safe database queries.  
- **Transactions**: Ensured data consistency for multi-table operations (e.g., creating a video and updating user stats).  

**Query Example**:  
```javascript  
// Get user with their videos and likes  
const user = await prisma.user.findUnique({  
  where: { id: userId },  
  include: {  
    videos: {  
      include: { likes: true }  
    }  
  }  
});  
```  

### 3. Authentication & Security 🔐  
- **Password Hashing**: Used `bcrypt` to hash and salt passwords.  
- **JWT Tokens**: Generated tokens for authentication with `jsonwebtoken`.  
- **Protected Routes**: Middleware to verify JWT and authorize requests.  

**Security Implementation**:  
```javascript  
// Hash password before saving  
const hashedPassword = await bcrypt.hash(password, 10);  

// Generate JWT token  
const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {  
  expiresIn: process.env.JWT_EXPIRE  
});  

// Auth middleware  
const protect = async (req, res, next) => {  
  try {  
    const token = req.headers.authorization?.split(' ')[1];  
    if (!token) return res.status(401).send('Unauthorized');  
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  
    req.user = await prisma.user.findUnique({ where: { id: decoded.id } });  
    next();  
  } catch (error) {  
    res.status(401).send('Invalid token');  
  }  
};  
```  

### 4. Database Seeding 🌱  
- **Test Data Generation**: Created a `seed.js` script to populate the database with:  
  - 10 users  
  - 50 videos  
  - 200 comments  
  - 300 likes  
- **Data Relationships**: Ensured referential integrity during seeding (e.g., comments reference existing videos).  


## 🎯 Reflection: What I Learned  

### Technical Skills Gained 💻  
#### 1. ORM vs Raw SQL  
- **Prisma Advantages**:  
  - Type safety and auto-completion.  
  - Simplified relationship queries with `include`.  
  - Migrations that track schema changes.  
- **Trade-offs**: ORMs abstract SQL, which can be a drawback for complex queries.  

#### 2. Database Design Best Practices  
- **Normalization**: Avoided data duplication (e.g., comments table references videos via `videoId`).  
- **Indexing**: Added indexes to frequently queried fields (e.g., `userId` in videos).  
- **UUIDs vs Auto-increment IDs**: Chose UUIDs for distributed systems compatibility.  

#### 3. Authentication Workflows  
- **Stateless Auth**: JWT tokens eliminate server-side session storage.  
- **Password Security**: Learned why salting and hashing are essential (prevents rainbow table attacks).  
- **Error Handling**: How to gracefully handle expired or invalid tokens.  

#### 4. Prisma Migration Management  
- **Schema Versioning**: `prisma migrate` keeps the database in sync with the schema.  
- **Rollbacks**: Understood how to revert migrations in case of errors.  
- **Data Seeding**: Importance of test data for development and debugging.  


## 🚧 Challenges & Solutions  

### Challenge 1: Complex Relationship Queries  
**Problem**: Retrieving a user's videos with their likes and comments was initially slow.  
**Solution**:  
- Used Prisma's `include` to fetch related data in a single query:  
  ```javascript  
  const user = await prisma.user.findUnique({  
    where: { id: userId },  
    include: {  
      videos: {  
        include: {  
          comments: true,  
          likes: true  
        }  
      }  
    }  
  });  
  ```  
**Learning**: N+1 query problems are avoided with proper relationship inclusion.  

### Challenge 2: Password Hashing & Verification  
**Problem**: Comparing hashed passwords incorrectly led to authentication failures.  
**Solution**:  
- Ensured consistent salt rounds and hashing algorithms:  
  ```javascript  
  // Hash password  
  const hashed = await bcrypt.hash(password, 10);  
  
  // Verify password  
  const isMatch = await bcrypt.compare(enteredPassword, user.password);  
  ```  
**Learning**: Always use the same salt rounds and algorithm for hashing and verification.  

### Challenge 3: Database Migration Conflicts  
**Problem**: Changing a field's data type caused migration errors.  
**Solution**:  
- Used Prisma's schema diffing to generate safe migrations:  
  ```bash  
  npx prisma migrate dev --name update_video_description  
  ```  
**Learning**: Prisma migrations handle schema changes safely, but manual adjustments may be needed for complex changes.  

### Challenge 4: JWT Token Expiry Handling  
**Problem**: Users faced sudden token expiry without clear feedback.  
**Solution**:  
- Added token refresh logic and clear error messages:  
  ```javascript  
  // Frontend: Refresh token on 401  
  if (response.status === 401) {  
    await refreshToken();  
    return axios.request(config);  
  }  
  ```  
**Learning**: Token expiry should be handled gracefully with refresh mechanisms.  


## 🎓 Key Insights  

### 1. Database Design Drives Application Architecture  
- **Schema First**: Designing the database schema before writing code prevents rework.  
- **Relationships**: Clear entity relationships simplify complex queries.  

### 2. ORM as a Productivity Tool  
- **Development Speed**: Prisma reduces boilerplate SQL code.  
- **Type Safety**: Compiler errors catch database-related bugs early.  
- **Migrations**: Version-controlled schema changes are essential for team development.  

### 3. Security Is a Layered Approach  
- **Passwords**: Hashing + salting is mandatory; never store plain text.  
- **Tokens**: JWTs require secure secrets and proper expiry policies.  
- **Authorization**: Role-based access control (RBAC) should be layered on top of authentication.  

### 4. Test Data Is Critical  
- **Seeding**: Pre-populated data helps developers test features without manual setup.  
- **Data Relationships**: Seeding must maintain referential integrity (e.g., comments for existing videos).  


## 🚀 Future Improvements  

### 1. Performance Optimization  
- **Query Caching**: Implement Redis to cache popular queries.  
- **Indexing**: Add indexes for frequently joined fields.  
- **Query Optimization**: Analyze slow queries with `EXPLAIN ANALYZE`.  

### 2. Advanced Authentication  
- **OAuth Integration**: Add Google/Facebook login options.  
- **Two-Factor Authentication (2FA)**: Enhance security with TOTP.  
- **Rate Limiting**: Prevent brute-force attacks on login endpoints.  

### 3. Video Processing  
- **Transcoding**: Convert uploaded videos to multiple formats for compatibility.  
- **Thumbnail Generation**: Automatically create video thumbnails.  
- **Storage Migration**: Move videos to cloud storage (S3, GCS) for scalability.  

### 4. Real-time Features  
- **WebSockets**: Notifications for likes, comments, and follows.  
- **Live Streaming**: Implement live video functionality.  

### 5. Monitoring & Analytics  
- **Database Monitoring**: Track query performance with tools like pgAdmin.  
- **Error Reporting**: Send database errors to Sentry or Datadog.  
- **Usage Metrics**: Track API requests and database operations.  


## 💡 Personal Growth  

This project deepened my understanding of:  
- **Full-Stack Data Flow**: From frontend requests to database storage and back.  
- **ORM Internals**: How Prisma translates model queries to efficient SQL.  
- **Security Trade-offs**: Balancing usability with robust authentication.  

The hands-on experience with Prisma and PostgreSQL will be invaluable for building production-grade applications, especially those requiring complex data relationships and secure user management. I now appreciate the importance of thoughtful database design and the role of ORMs in accelerating development while maintaining best practices.