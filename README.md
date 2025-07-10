# Reddit Clone API

A full-featured **Reddit Clone RESTful API**, built with **Node.js**, **Express.js**, and **PostgreSQL**. It follows a **3-Tier Architecture** (Presentation, Business Logic, Data Access), supports authentication, posts, comments, votes, and notifications.

## 🌐 Live API Documentation

Check out the full API documentation here:  
👉 [Postman Docs](https://documenter.getpostman.com/view/38510576/2sB2xECook)

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Token), bcryptjs
- **Email Service:** Nodemailer
- **Notifications:** Socket.IO
- **Security:** Helmet, Rate Limiting
- **Environment Config:** dotenv
- **Logging:** Morgan
- **Development Tools:** Nodemon
- **File Upload:** Multer

## 📁 Project Structure

```
reddit-clone-api/
├── config/
| └── index.js
├── scripts/
| └── db-ddl.sql
├── src/
│ ├── controllers/
| ├── handlers/
│ ├── middlewares/
│ ├── models/
| ├── repositories/
│ ├── routes/
| ├── services/
│ ├── utils/
| ├── app.js
│ └── server.js
├── .gitignore
├── count_lines.sh
├── project_requirements.md
├── LICENSE
└── README.md
```

## 🚀 Features

### 🔐 Authentication
- Register new users
- Email verification
- Login with JWT
- Password reset via email
- Get current user info

### 📝 Posts
- Create/update/delete posts
- Pagination support
- Search by content
- Image support: upload up to 10 images per post

### 💬 Comments
- Add/update/delete comments & replies
- Paginated fetch
- Nested replies support

### 👍 Voting System
- Upvote/downvote posts and comments
- Get user-specific votes
- Remove vote

### 🔔 Notifications
- Real-time via Socket.IO
- Mark notifications as read
- Fetch all unread notifications


## 📦 Installation

```
git clone https://github.com/MohamedM216/reddit-clone-api.git
cd reddit-clone-api
npm install
```

Create a .env file in the root directory:

```
PORT=3000
DATABASE_URL=postgres://youruser:yourpassword@localhost:5432/reddit
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
BASE_URL=http://localhost:3000
```

## 🏃 Running the App

Development
```
npm run dev
```

Production
```
npm start
```

## 🔐 Security Features

- Rate Limiting (express-rate-limit)
- Input Sanitization
- JWT-based Auth
- Password Hashing with bcryptjs
- Helmet for setting HTTP headers


## ✅ Todo / Future Work

- Unit tests
- Sorting posts (New, Top, Controversial)
- Users update their profiles
- Notify users when other users mention them (@username)
- Notify when there are system updates
- Most active users, trending posts.


## 📄 License

This project is licensed under the [MIT License](https://github.com/MohamedM216/reddit-clone-api/blob/master/LICENSE).