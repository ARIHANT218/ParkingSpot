const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const http = require('http');
const { canAcessChat } = require('./utils/chatAuth');

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('./models/Message');
const Booking = require('./models/Booking');
const User = require('./models/User');
const authMiddleware = require('./middleware/authMiddleware'); // existing

dotenv.config();
connectDB();

const app = express();


app.use(express.json());
const cors = require('cors');
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Chat message
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' } // change origin to your frontend in production
});
app.set('io', io);

// Middleware-style auth for socket
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = { id: payload.id, role: payload.role }; // adjust based on your token
    return next();
  } catch (err) {
    return next(new Error('Authentication error'));
  }
});


io.on('connection', (socket) => {
  console.log('Socket connected', socket.user.id);

  socket.on('joinRoom', async ({ bookingId }) => {
    console.log('joinRoom request:', { bookingId, userId: socket.user.id });
    try {
      const { ok, booking, reason } = await canAcessChat(socket.user, bookingId);
      console.log('canAcessChat result:', { ok, reason, bookingStatus: booking?.status });
      if (!ok) {
        socket.emit('joinError', { message: reason });
        return;
      }
      const room = `booking_${bookingId}`;
      socket.join(room);
      console.log('User joined room:', room);
      socket.emit('joined', { bookingId });
    } catch (err) {
      console.error('joinRoom error', err);
      socket.emit('joinError', { message: 'Server error joining room' });
    }
  });

  socket.on('sendMessage', async ({ bookingId, text }) => {
    console.log('sendMessage request:', { bookingId, text, userId: socket.user.id });
    try {
      const { ok, booking, reason } = await canAcessChat(socket.user, bookingId);
      if (!ok) {
        console.log('sendMessage access denied:', reason);
        socket.emit('sendError', { message: reason });
        return;
      }

      const msg = await Message.create({
        bookingId,
        sender: socket.user.id,
        senderRole: socket.user.role || 'user',
        text,
      });

      console.log('Message created:', msg);
      const room = `booking_${bookingId}`;
      io.to(room).emit('newMessage', msg);
      console.log('Message broadcasted to room:', room);
    } catch (err) {
      console.error('sendMessage error:', err);
      socket.emit('sendError', { message: 'Unable to send message' });
    }
  });



  socket.on('disconnect', () => {
    console.log('Socket disconnected', socket.user?.id);
  });
});

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/parking', require('./routes/parkingRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));