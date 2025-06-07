# 🤔 Practical 4: Connecting TikTok to PostgreSQL with Prisma ORM Reflection  

## 📋 Documentation: Main Concepts Applied  

### 🗄️ Database Design & Architecture  
- **Relational Schema**: Designed a normalized database with tables for `users`, `videos`, `comments`, `likes`, and `followers`, ensuring minimal data duplication.  
- **Relationships**: Implemented:  
  - One-to-Many: Users own multiple videos.  
  - Many-to-Many: Users can like multiple videos (via a junction table).  
- **Indexes**: Added indexes on `userId` and `videoId` for faster querying.  

### 🔄 Object-Relational Mapping (ORM)  
- **Prisma Schema**: Defined models in `schema.prisma` with declarative syntax:  
  ```prisma  
  model User {  
    id       String    @id @default(uuid())  
    username String    @unique  
    email    String    @unique  
    password String  
    videos   Video[]  
  }  
  
  model Video {  
    id        String   @id @default(uuid())  
    title     String  
    userId    String  
    user      User     @relation(fields: [userId], references: [id])  
    likes     Like[]  
  }  
  ```  
- **Migrations**: Used `prisma migrate` to version-control schema changes, ensuring database consistency.  
- **Prisma Client**: Generated type-safe queries for CRUD operations.  

### 🔐 Authentication & Security  
- **Password Hashing**: Used `bcrypt` to hash passwords with 10 salt rounds:  
  ```javascript  
  const hashedPassword = await bcrypt.hash(password, 10);  
  ```  
- **JWT Tokens**: Implemented stateless auth with `jsonwebtoken`:  
  ```javascript  
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {  
    expiresIn: '30d'  
  });  
  ```  
- **Auth Middleware**: Protected routes by verifying JWT tokens:  
  ```javascript  
  const protect = async (req, res, next) => {  
    try {  
      const token = req.headers.authorization?.split(' ')[1];  
      if (!token) throw new Error('Unauthorized');  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);  
      req.user = await prisma.user.findUnique({ where: { id: decoded.id } });  
      next();  
    } catch (error) {  
      res.status(401).json({ message: 'Invalid token' });  
    }  
  };  
  ```  

### 🌐 Database-Integrated API  
- **CRUD Operations**: Replaced in-memory data with Prisma Client queries.  
- **Transactions**: Ensured data consistency for multi-table operations (e.g., creating a video and updating user stats in one transaction).  


## 🎯 Reflection: What I Learned  

### Technical Skills Gained  
#### 1. Database Design Principles  
- **Normalization**: Avoided data redundancy by splitting entities into tables.  
- **Indexing**: Understood how indexes improve query performance (e.g., on `userId` for fetching user videos).  
- **Relationship Management**: Implemented complex relationships (many-to-many likes) with junction tables.  

#### 2. Prisma ORM Mastery  
- **Schema Syntax**: Learned Prisma's declarative model definitions and relationship syntax.  
- **Migrations**: Mastered the workflow of `schema.prisma` → migration → database update.  
- **Query Builder**: Used Prisma's `include` to fetch nested relationships in a single query:  
  ```javascript  
  const user = await prisma.user.findUnique({  
    where: { id: userId },  
    include: { videos: { include: { likes: true } } }  
  });  
  ```  

#### 3. Authentication Workflows  
- **Password Security**: Recognized the importance of salting and hashing (prevents rainbow table attacks).  
- **JWT Mechanics**: Understood how tokens enable stateless auth and session management.  
- **Error Handling**: Gracefully handled expired tokens and authentication failures.  

#### 4. Full-Stack Integration  
- **Data Flow**: Understood how requests move from the frontend, through the API, to the database and back.  
- **Transaction Management**: Used Prisma's `$transaction` for atomic operations.  


## 🚧 Challenges & Solutions  

### Challenge 1: Database Connection Failures  
**Problem**: Initial PostgreSQL connection errors due to invalid credentials.  
**Solution**:  
1. Verified PostgreSQL service was running: `sudo systemctl status postgresql`.  
2. Corrected `.env` database URL format:  
   ```env  
   DATABASE_URL="postgresql://tiktok_user:your_password@localhost:5432/tiktok_db?schema=public"  
   ```  
3. Granted user permissions via SQL:  
   ```sql  
   GRANT ALL PRIVILEGES ON DATABASE tiktok_db TO tiktok_user;  
   ```  
**Learning**: Always test database connections manually with `psql` before coding.  

### Challenge 2: Many-to-Many Relationships  
**Problem**: Difficulty implementing likes and follows as many-to-many relations.  
**Solution**:  
- Used Prisma's implicit junction tables for `likes`:  
  ```prisma  
  model Like {  
    id     String @id @default(uuid())  
    userId String  
    videoId String  
    user   User   @relation(fields: [userId], references: [id])  
    video  Video  @relation(fields: [videoId], references: [id])  
    @@unique([userId, videoId])  
  }  
  ```  
**Learning**: Junction tables are essential for many-to-many relationships in relational databases.  

### Challenge 3: JWT Middleware Bugs  
**Problem**: Protected routes allowed unauthenticated access.  
**Solution**:  
- Debugged token extraction from headers:  
  ```javascript  
  const token = req.headers.authorization?.split(' ')[1];  
  ```  
- Added explicit error handling for missing tokens:  
  ```javascript  
  if (!token) return res.status(401).json({ message: 'Authentication required' });  
  ```  
**Learning**: Middleware must handle edge cases (e.g., missing headers) gracefully.  

### Challenge 4: Migration Conflicts  
**Problem**: Schema changes caused migration errors.  
**Solution**:  
- Reset migrations and applied a clean schema:  
  ```bash  
  npx prisma migrate reset  
  npx prisma migrate dev --name init  
  ```  
**Learning**: Prisma migrations are version-controlled, but complex changes may require manual intervention.  


## 🎓 Key Takeaways  

### 1. Database Design Drives Application Stability  
- **Schema First**: Designing the database before coding prevents rework.  
- **Relationships**: Clear entity relations simplify complex queries (e.g., fetching a user's videos with likes).  

### 2. ORM Enhances Productivity  
- **Type Safety**: Prisma's auto-generated types catch errors at compile time.  
- **Migrations**: Version-controlled schema changes are crucial for team development.  

### 3. Security Is Non-Negotiable  
- **Passwords**: Hashing with bcrypt is mandatory; never store plain text.  
- **Tokens**: JWTs require secure secrets and proper expiry policies.  

### 4. Test Data Is Essential  
- **Seeding**: Pre-populated data (users, videos, likes) speeds up development and testing.  
- **Referential Integrity**: Seed scripts must maintain database relationships (e.g., comments for existing videos).  


## 🚀 Future Improvements  

### 1. Performance Optimization  
- **Query Caching**: Implement Redis to cache popular queries (e.g., trending videos).  
- **Indexing**: Add indexes for frequently joined fields (e.g., `videoId` in comments).  
- **Query Analysis**: Use PostgreSQL's `EXPLAIN ANALYZE` to optimize slow queries.  

### 2. Advanced Features  
- **Video Processing**: Integrate FFmpeg for transcoding and thumbnail generation.  
- **Cloud Storage**: Migrate videos to S3/GCS for scalability.  
- **Real-time Notifications**: Use WebSockets for live likes/comments.  

### 3. Security Enhancements  
- **Rate Limiting**: Prevent brute-force attacks with `express-rate-limit`.  
- **OAuth Integration**: Add Google/Facebook login options.  
- **2FA**: Implement two-factor authentication with TOTP.  

### 4. Monitoring & Analytics  
- **Database Metrics**: Track query performance with pgAdmin.  
- **Error Reporting**: Send database errors to Sentry/Datadog.  


## 💡 Personal Growth  

This project solidified my understanding of:  
- **Full-Stack Development**: From frontend requests to database storage.  
- **ORM Workflows**: How Prisma bridges JavaScript and SQL.  
- **Security Practices**: Building robust authentication systems.  

The hands-on experience with PostgreSQL and Prisma will be invaluable for future projects, especially those requiring complex data models and secure user management. I now appreciate the importance of thoughtful database design and the role of ORMs in accelerating development while maintaining best practices.