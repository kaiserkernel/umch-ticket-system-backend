const express = require("express");
const fs = require("fs");
const https = require("https");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const socketIo = require("socket.io");
const admin = require("firebase-admin");
const connectDB = require("./config/db");
const setupSwagger = require("./swagger/swagger");
const routes = require("./routes");

dotenv.config();
connectDB();

const app = express();

// CORS Configuration
const corsOptions = {
  origin: [
    "https://ticket-system.umch.de:5000",
    "https://5.132.162.20:5000",
    "http://ticket-system.umch.de:3000",
    "http://5.132.162.20:3000"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

// Load SSL Certificates
const sslOptions = {
  key: fs.readFileSync("./ssl/private.key"),
  cert: fs.readFileSync("./ssl/certificate.crt"),
  ca: fs.readFileSync("./ssl/ca_bundle.crt")
};

// Initialize Firebase Admin
const serviceAccount = require("./config/firebase-admin-sdk.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.resolve(__dirname, "./public")));
app.use(express.static(path.resolve(__dirname, "build")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Routes
app.use("/api", routes);
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "build", "index.html"));
});

setupSwagger(app);

const PORT = process.env.PORT || 443;
const server = https.createServer(sslOptions, app);
const io = socketIo(server);

// Store connected users
const connectedUsers = {};

// Socket.IO Configuration
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("user-join", (userId) => {
    connectedUsers[userId] = socket.id;
  });

  socket.on("send-message", async ({ senderId, receiverId, message }) => {
    const receiverSocketId = connectedUsers[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive-message", { senderId, message });
    } else {
      await sendPushNotification(receiverId, message);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    Object.keys(connectedUsers).forEach((userId) => {
      if (connectedUsers[userId] === socket.id) delete connectedUsers[userId];
    });
  });
});

// Send Firebase Push Notification
async function sendPushNotification(userId, message) {
  const userToken = await getUserToken(userId);
  if (userToken) {
    try {
      await admin.messaging().sendToDevice(userToken, {
        notification: { title: "New Message", body: message }
      });
      console.log("Push notification sent successfully");
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  }
}

// Mock function to get FCM token
async function getUserToken(userId) {
  return "user-fcm-token"; // Replace with real DB query
}

// Start HTTPS server
server.listen(PORT, () => {
  console.log(`Server running on HTTPS port ${PORT}`);
});
