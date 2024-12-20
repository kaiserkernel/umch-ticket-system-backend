const express = require("express");
const fs = require("fs");
const https = require('https');
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const formRoutes = require("./routes/form");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");
const emailTemplateRoutes = require("./routes/emailTemplate");
const ticketGroupRoutes = require("./routes/ticketGroup");

const path = require("path");
const setupSwagger = require("./swagger/swagger");
const socketIo = require("socket.io");
const admin = require("firebase-admin");

dotenv.config();
connectDB();

const app = express();
const corsOptions = {
  // origin: ["https://ticket-system.umch.de:5000", "https://5.132.162.20:5000"], // Specify origin if needed (e.g., 'http://localhost:3000')
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true // Use true if sending cookies or auth headers is necessary
};

// Load your SSL certificate and key
const options = {
  key: fs.readFileSync('./ssl/private.key'),
  cert: fs.readFileSync('./ssl/certificate.crt')
};

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
// app.options("*", cors(corsOptions)); // Handle preflight requests
app.use(express.static(path.resolve(__dirname, "./public")));
app.use(express.static(path.resolve(__dirname, "build")));
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/form", formRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/emailTemplate", emailTemplateRoutes);
app.use("/api/ticket-group", ticketGroupRoutes);

// Catch-all route to serve React app's index.html for frontend navigation
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "build", "index.html"));
});

setupSwagger(app);

const PORT = process.env.PORT || 443;

// Store connected clients
let connectedUsers = {};

// 1. Socket.IO Setup with HTTPS server
const server = https.createServer(options, app); // create an HTTPS server
const io = socketIo(server);

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

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Start HTTPS server
server.listen(PORT, () => {
  console.log(`HTTPS server running on port ${PORT}`);
});