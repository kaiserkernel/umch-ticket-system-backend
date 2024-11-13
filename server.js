const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const formRoutes = require("./routes/form");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");
const emailTemplateRoutes = require("./routes/emailTemplate");
const path = require("path");
const setupSwagger = require("./swagger/swagger");
const socketIo = require("socket.io");
const admin = require("firebase-admin");
dotenv.config();

connectDB();

const app = express();
const corsOptions = {
  origin: "*", // Specify origin if needed (e.g., 'http://localhost:3000')
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: true // Use true if sending cookies or auth headers is necessary
};
// socket
const server = http.createServer(app);
const io = socketIo(server);

// Initialize Firebase Admin
const serviceAccount = require(path.join(
  __dirname,
  "config",
  "firebase-admin-sdk.json"
));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight requests
app.use(express.static(path.resolve("./public")));

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/form", formRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/emailTemplate", emailTemplateRoutes);

setupSwagger(app);

const PORT = process.env.PORT || 5000;

// Store connected clients
let connectedUsers = {};

// 1. Socket.IO Setup
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Listen for a user joining with their ID
  socket.on("user-join", (userId) => {
    connectedUsers[userId] = socket.id;
  });

  // Listen for a new message
  socket.on("send-message", async (data) => {
    const { senderId, receiverId, message } = data;

    // Emit the message to the receiver if they are online
    const receiverSocketId = connectedUsers[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive-message", { senderId, message });
    } else {
      // Send push notification if the user is offline
      await sendPushNotification(receiverId, message);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    for (let userId in connectedUsers) {
      if (connectedUsers[userId] === socket.id) {
        delete connectedUsers[userId];
        break;
      }
    }
  });
});

// 2. Firebase Push Notification Function
async function sendPushNotification(userId, message) {
  // Fetch user's FCM token from your database (e.g., MongoDB, Firebase Firestore, etc.)
  const userToken = await getUserToken(userId);

  if (userToken) {
    const payload = {
      notification: {
        title: "New Message",
        body: message
      }
    };

    try {
      await admin.messaging().sendToDevice(userToken, payload);
      console.log("Push notification sent successfully");
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  }
}

// Mock function to get the user's FCM token (replace this with actual DB logic)
async function getUserToken(userId) {
  // Implement your logic to retrieve the FCM token for the user from your database
  return "user-fcm-token";
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
