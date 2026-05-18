# ⚡ DevChat — Real-Time Chat Application

> A production-grade full-stack chat app built with the MERN stack + Socket.io.
> Real-time messaging, JWT authentication, Cloudinary image uploads, and live deployment.

---

## 🚀 Live Demo

| Service  | URL |
|----------|-----|
| Frontend | `https://devchat-app.vercel.app` *(replace with yours)* |
| Backend  | `https://devchat-api.onrender.com` *(replace with yours)* |

---

## ✨ Features

- 🔐 **JWT Authentication** — Signup, Login, Logout with HttpOnly cookies
- 💬 **Real-Time Messaging** — Instant delivery via Socket.io WebSockets
- ✍️ **Typing Indicators** — Live "user is typing..." with debounce
- 🟢 **Online/Offline Status** — Real-time presence broadcast to all clients
- 🖼️ **Image Sharing** — Upload & send images via Cloudinary
- 👤 **Profile Management** — Update name, bio, avatar
- 👥 **Group Chat** — Create rooms, socket.io room-based messaging
- 🔍 **User Search** — Debounced search across all users
- 📱 **Responsive Design** — Works on mobile and desktop
- 🔒 **Secure** — bcrypt hashing, JWT secrets, cookie security, input validation

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18 + Vite + Tailwind CSS      |
| State      | Zustand (persisted auth store)      |
| Backend    | Node.js + Express                   |
| Real-Time  | Socket.io (WebSocket + polling)     |
| Database   | MongoDB Atlas + Mongoose            |
| Auth       | JWT + bcrypt (HttpOnly cookies)     |
| Files      | Cloudinary (avatars + images)       |
| Deploy FE  | Vercel                              |
| Deploy BE  | Render                              |

---

## 📁 Project Structure

```
devchat/
├── client/                     ← React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx     ← User list, online status, search
│   │   │   └── ChatBox.jsx     ← Messages, typing, image upload
│   │   ├── pages/
│   │   │   ├── HomePage.jsx    ← Main chat layout
│   │   │   ├── LoginPage.jsx   ← Auth
│   │   │   ├── SignupPage.jsx  ← Auth
│   │   │   ├── ProfilePage.jsx ← Edit profile + avatar
│   │   │   └── NotFound.jsx    ← 404
│   │   ├── context/
│   │   │   └── SocketContext.jsx ← Socket.io connection lifecycle
│   │   ├── store/
│   │   │   ├── useAuthStore.js ← Auth state (Zustand + persist)
│   │   │   └── useChatStore.js ← Messages, users, online state
│   │   ├── hooks/
│   │   │   └── useTyping.js    ← Typing event emitter with debounce
│   │   └── utils/
│   │       └── axios.js        ← Axios instance + 401 interceptor
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── server/                     ← Node.js Backend
    ├── config/
    │   ├── db.js               ← MongoDB connection
    │   └── cloudinary.js       ← Cloudinary setup
    ├── models/
    │   ├── User.js             ← User schema (bcrypt pre-save hook)
    │   ├── Message.js          ← Message schema
    │   └── Conversation.js     ← 1-on-1 and group conversations
    ├── controllers/
    │   ├── auth.controller.js  ← signup, login, logout, getMe, updateProfile
    │   ├── message.controller.js ← send, get, markSeen, getConversations
    │   ├── user.controller.js  ← getUsers, getUserById
    │   └── group.controller.js ← createGroup, getGroups, groupMessages
    ├── routes/
    │   ├── auth.routes.js
    │   ├── message.routes.js
    │   ├── user.routes.js
    │   └── group.routes.js
    ├── middleware/
    │   └── auth.middleware.js  ← JWT verification (cookie + Bearer)
    ├── socket/
    │   └── socket.js           ← Socket.io server, events, userId→socketId map
    ├── utils/
    │   └── jwt.js              ← generateToken + verifyToken
    └── server.js               ← Express app + HTTP server entry point
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint                  | Auth | Description              |
|--------|---------------------------|------|--------------------------|
| POST   | `/api/auth/signup`        | No   | Register new user        |
| POST   | `/api/auth/login`         | No   | Login, returns JWT cookie|
| POST   | `/api/auth/logout`        | Yes  | Logout, clear cookie     |
| GET    | `/api/auth/me`            | Yes  | Get current user         |
| PUT    | `/api/auth/update-profile`| Yes  | Update name/bio/avatar   |

### Messages
| Method | Endpoint                    | Auth | Description              |
|--------|-----------------------------|------|--------------------------|
| GET    | `/api/messages/conversations` | Yes | All conversations        |
| GET    | `/api/messages/:id`         | Yes  | Chat history (paginated) |
| POST   | `/api/messages/:id`         | Yes  | Send a message           |
| PUT    | `/api/messages/:id/seen`    | Yes  | Mark messages as seen    |

### Users
| Method | Endpoint          | Auth | Description              |
|--------|-------------------|------|--------------------------|
| GET    | `/api/users`      | Yes  | All users (+ search)     |
| GET    | `/api/users/:id`  | Yes  | Single user profile      |

### Groups
| Method | Endpoint                      | Auth | Description              |
|--------|-------------------------------|------|--------------------------|
| POST   | `/api/groups`                 | Yes  | Create a group           |
| GET    | `/api/groups`                 | Yes  | My groups                |
| POST   | `/api/groups/:id/messages`    | Yes  | Send group message       |
| GET    | `/api/groups/:id/messages`    | Yes  | Group message history    |

---

## ⚡ Socket.io Events

| Event               | Direction         | Purpose                            |
|---------------------|-------------------|------------------------------------|
| `connection`        | Client → Server   | User connects, registers socketId  |
| `disconnect`        | Client → Server   | User offline, remove from map      |
| `getOnlineUsers`    | Server → Client   | Broadcast online user IDs          |
| `receiveMessage`    | Server → Client   | Deliver message to receiver        |
| `receiveGroupMessage` | Server → Room   | Deliver message to group room      |
| `typing`            | Client → Server   | User started typing                |
| `stopTyping`        | Client → Server   | User stopped typing                |
| `typing`            | Server → Client   | Notify receiver of typing          |
| `stopTyping`        | Server → Client   | Notify receiver stopped typing     |
| `messageSeen`       | Client → Server   | Message read event                 |
| `messagesSeen`      | Server → Client   | Notify sender messages were read   |
| `joinGroup`         | Client → Server   | Join a socket.io room              |
| `newGroup`          | Server → Client   | Notify members of new group        |

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier works)

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/devchat.git
cd devchat
```

### 2. Setup Backend
```bash
cd server
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

### 3. Setup Frontend
```bash
cd client
cp .env.example .env
# VITE_BACKEND_URL not needed for local dev (Vite proxy handles it)
npm install
npm run dev
```

### 4. Or run both together from root
```bash
npm install          # installs concurrently
npm run install:all  # installs server + client deps
npm run dev          # runs both simultaneously
```

Open `http://localhost:5173` in your browser.

---

## 🚢 Deployment

### Backend → Render
1. Push `server/` to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Set **Root Directory** to `server`
5. Set **Build Command**: `npm install`
6. Set **Start Command**: `npm start`
7. Add Environment Variables (copy from `.env.example`):
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `CLIENT_URL` = your Vercel frontend URL
   - `NODE_ENV` = `production`

### Frontend → Vercel
1. Push `client/` to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import the repo, set **Root Directory** to `client`
4. Add Environment Variable:
   - `VITE_BACKEND_URL` = your Render backend URL
5. Deploy

---

## 🔒 Security Checklist
- [x] Passwords hashed with bcrypt (salt rounds: 12)
- [x] JWT stored in HttpOnly cookie (no XSS access)
- [x] JWT verified on every protected route
- [x] `.env` in `.gitignore` — secrets never committed
- [x] Input validation on all routes
- [x] CORS restricted to frontend origin
- [x] Sensitive fields (`password`, `avatarPublicId`) excluded from API responses
- [x] 401 interceptor auto-redirects on expired sessions

---

## 📸 Screenshots

> Add your own screenshots here after deploying:
> `![Chat UI](./screenshots/chat.png)`

---

## 👨‍💻 Author

Built with ❤️ as a full-stack portfolio project.

**Stack:** React · Node.js · Socket.io · MongoDB · JWT · Cloudinary · Vercel · Render

---

## 📄 License

MIT — free to use, modify, and deploy.
