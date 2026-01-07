const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const { canAcessChat } = require('./utils/chatAuth');
const Message = require('./models/Message');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());


const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

/* -------------------- SERVER -------------------- */
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true }
});

app.set('io', io);

/* -------------------- SOCKET AUTH -------------------- */
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) throw new Error('No token');

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    next(new Error('Authentication failed'));
  }
});


/* -------------------- SOCKET EVENTS -------------------- */
io.on('connection', (socket) => {
  console.log('User connected:', socket.user.id);

  
  socket.on('joinRoom', async ({ bookingId }) => {
    try {
      const { ok, reason } = await canAcessChat(socket.user, bookingId);
      if (!ok) return socket.emit('joinError', { message: reason });

      socket.join(`booking_${bookingId}`);
      socket.emit('joined', { bookingId });
    } catch {
      socket.emit('joinError', { message: 'Failed to join room' });
    }
  });

  // Send message
  socket.on('sendMessage', async ({ bookingId, text }) => {
    try {
      const { ok, reason } = await canAcessChat(socket.user, bookingId);
      if (!ok) return socket.emit('sendError', { message: reason });

      const message = await Message.create({
        bookingId,
        sender: socket.user.id,
        senderRole: socket.user.role || 'user',
        text,
      });

      io.to(`booking_${bookingId}`).emit('newMessage', message);
    } catch {
      socket.emit('sendError', { message: 'Message not sent' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user?.id);
  });
});

//-------------------- ROUTES -------------------- //
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/parking', require('./routes/parkingRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
