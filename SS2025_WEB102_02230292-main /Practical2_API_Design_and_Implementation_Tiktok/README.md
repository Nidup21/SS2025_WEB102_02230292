# Practical 2: API Design and Implementation (TikTok)  

## 🚀 Overview  
This project implements a RESTful API for a TikTok-like application using Express.js and Node.js. The API provides endpoints for managing videos, users, and comments, adhering to RESTful principles and featuring in-memory data storage for demonstration purposes.  


## 📋 API Design  

### Resources & Endpoints  
| **Resource** | **Endpoint** | **GET** | **POST** | **PUT** | **DELETE** |  
|--------------|-----------------------------|------------------------|------------------------|------------------------|------------------------|  
| **Videos** 🎥 | `/api/videos` | Get all videos | Create video | - | - |  
|  | `/api/videos/:id` | Get video by ID | - | Update video | Delete video |  
|  | `/api/videos/:id/comments` | Get video comments | - | - | - |  
|  | `/api/videos/:id/likes` | Get video likes | Like video | - | Unlike video |  
| **Users** 👤 | `/api/users` | Get all users | Create user | - | - |  
|  | `/api/users/:id` | Get user by ID | - | Update user | Delete user |  
|  | `/api/users/:id/videos` | Get user videos | - | - | - |  
|  | `/api/users/:id/followers` | Get followers | Follow user | - | Unfollow user |  
|  | `/api/users/:id/following` | Get following users | - | - | - |  
| **Comments** 💬 | `/api/comments` | Get all comments | Create comment | - | - |  
|  | `/api/comments/:id` | Get comment by ID | - | Update comment | Delete comment |  
|  | `/api/comments/:id/likes` | Get comment likes | Like comment | - | Unlike comment |  


## 🛠️ Installation & Setup  

### Prerequisites  
- Node.js (v14+)  
- npm/yarn  

### Steps  
1. **Initialize Project**:  
   ```bash  
   mkdir -p server && cd server  
   npm init -y  
   ```  

2. **Install Dependencies**:  
   ```bash  
   npm install express cors morgan body-parser dotenv  
   npm install --save-dev nodemon  
   ```  

3. **Project Structure**:  
   ```  
   server/  
   ├── src/  
   │   ├── controllers/  
   │   ├── routes/  
   │   ├── models/  
   │   ├── middleware/  
   │   ├── utils/  
   │   ├── app.js  
   │   └── server.js  
   ├── .env  
   └── package.json  
   ```  

4. **Environment Config** (`.env`):  
   ```env  
   PORT=3000  
   NODE_ENV=development  
   ```  

5. **Scripts** (`package.json`):  
   ```json  
   {  
     "scripts": {  
       "start": "node src/server.js",  
       "dev": "nodemon src/server.js"  
     }  
   }  
   ```  


## 🔧 Implementation Details  

### Express Setup (`src/app.js`)  
```javascript  
const express = require('express');  
const cors = require('cors');  
const morgan = require('morgan');  
const bodyParser = require('body-parser');  

const app = express();  

// Middleware  
app.use(cors());  
app.use(morgan('combined'));  
app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({ extended: true }));  

// Routes  
app.use('/api/videos', require('./routes/videos'));  
app.use('/api/users', require('./routes/users'));  
app.use('/api/comments', require('./routes/comments'));  

module.exports = app;  
```  

### Server Entry (`src/server.js`)  
```javascript  
require('dotenv').config();  
const app = require('./app');  

const PORT = process.env.PORT || 3000;  

app.listen(PORT, () => {  
  console.log(`🚀 Server running on port ${PORT}`);  
});  
```  

### Data Models (In-Memory)  
- **Videos**: Array of video objects with metadata.  
- **Users**: Array of user profiles.  
- **Comments**: Array of comment objects linked to videos.  


## 🧪 Testing the API  

### cURL Examples  
- **Get All Users**:  
  ```bash  
  curl -X GET http://localhost:3000/api/users  
  ```  

- **Get User Videos**:  
  ```bash  
  curl -X GET http://localhost:3000/api/users/1/videos  
  ```  

- **Like a Video**:  
  ```bash  
  curl -X POST http://localhost:3000/api/videos/1/likes  
  ```  

### Postman Testing  
1. Import endpoints into Postman.  
2. Set base URL: `http://localhost:3000`.  
3. Test endpoints with appropriate HTTP methods.  


## 🚀 Running the App  

### Development Mode  
```bash  
npm run dev  
```  

### Production Mode  
```bash  
npm start  
```  


## 📝 Implemented Features  

✅ **Video Management**:  
- CRUD operations for videos.  
- Retrieve comments and likes.  

✅ **User Management**:  
- User profile CRUD.  
- Follow/unfollow functionality.  

✅ **Comment System**:  
- CRUD operations for comments.  
- Like/unlike comments.  

✅ **RESTful Design**:  
- Proper HTTP methods and URL patterns.  
- JSON responses.  


## 🔮 Future Enhancements  

1. **Database Integration**:  
   - MongoDB/PostgreSQL for persistent storage.  
   - ORM (e.g., Mongoose/Sequelize) for data modeling.  

2. **Authentication**:  
   - JWT-based authentication.  
   - Role-based access control (RBAC).  

3. **File Upload**:  
   - Video/file storage (AWS S3, Google Cloud Storage).  

4. **Real-time Features**:  
   - WebSockets for live interactions (likes, comments).  

5. **Security**:  
   - Rate limiting (Express Rate Limit).  
   - Input validation (Joi).  

6. **Testing**:  
   - Unit tests (Jest).  
   - Integration tests (Supertest).  


## 🤝 Contributing  

1. Fork the repository.  
2. Create a feature branch (`git checkout -b feature/new-endpoint`).  
3. Commit changes (`git commit -m "Add new endpoint"`).  
4. Push to branch (`git push origin feature/new-endpoint`).  
5. Open a Pull Request.  

 

This API provides a solid foundation for a TikTok-like application, with room for expansion into more complex features like real-time interactions and advanced security measures.