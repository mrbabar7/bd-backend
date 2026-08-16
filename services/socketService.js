// const { Server } = require("socket.io");
// const admin = require("../config/firebaseAdmin"); // Integrated Firebase Admin

// let io;

// // Import models lazily to prevent circular dependencies
// const getUserModel = () => {
//   try {
//     return require("../models/userMode");
//   } catch (e) {
//     return require("../models/userMode");
//   }
// };

// const getDonorModel = () => {
//   try {
//     const donorModule = require("../models/formModel");
//     return donorModule.Donor || donorModule;
//   } catch (e) {
//     return null;
//   }
// };

// // Helper function to set online status in DB
// const setUserOnlineStatus = async (userId, isOnline) => {
//   if (!userId) return;
//   const now = new Date();

//   try {
//     const User = getUserModel();
//     const Donor = getDonorModel();

//     const updates = [
//       User.findByIdAndUpdate(userId, { isOnline, lastSeen: now }),
//     ];

//     if (Donor) {
//       updates.push(
//         Donor.findOneAndUpdate({ userId: userId }, { isOnline, lastSeen: now }),
//       );
//     }

//     await Promise.all(updates);

//     if (io) {
//       io.emit("donor_status_changed", {
//         userId: userId.toString(),
//         isOnline,
//         lastSeen: now,
//       });
//     }
//     console.log(
//       `🟢 User ${userId} status set to: ${isOnline ? "ONLINE" : "OFFLINE"}`,
//     );
//   } catch (err) {
//     console.error(`Error updating status for user ${userId}:`, err.message);
//   }
// };

// const initSocket = (server) => {
//   io = new Server(server, {
//     cors: {
//       origin: "*",
//       methods: ["GET", "POST", "PUT", "DELETE"],
//     },
//   });

//   io.on("connection", (socket) => {
//     console.log("⚡ New Client Connected:", socket.id);

//     const handleUserConnect = async (userId) => {
//       if (!userId) return;
//       const userRoom = userId.toString();
//       socket.join(userRoom);
//       socket.userId = userRoom;

//       console.log(`👤 User ${userId} registered in socket room ${userRoom}`);
//       await setUserOnlineStatus(userId, true);
//     };

//     socket.on("join_room", handleUserConnect);
//     socket.on("register_user", handleUserConnect);

//     socket.on("disconnect", async () => {
//       const userId = socket.userId;
//       console.log(
//         `❌ Client Disconnected: ${socket.id} (User: ${userId || "Guest"})`,
//       );

//       if (userId) {
//         const roomSockets = io.sockets.adapter.rooms.get(userId);
//         if (!roomSockets || roomSockets.size === 0) {
//           await setUserOnlineStatus(userId, false);
//         }
//       }
//     });
//   });

//   return io;
// };

// const getIO = () => {
//   if (!io) {
//     console.warn("⚠️ Warning: getIO() called before socket initialization!");
//   }
//   return io;
// };

// const emitToUser = (userId, event, payload) => {
//   if (io && userId) {
//     io.to(userId.toString()).emit(event, payload);
//   }
// };

// /**
//  * Sends a real-time push notification using Firebase Cloud Messaging (FCM)
//  */
// const sendPushNotification = async (fcmToken, title, body, data = {}) => {
//   if (!fcmToken) {
//     console.log("[Push Notification Skipped] Missing FCM Token");
//     return;
//   }

//   // FCM data values MUST strictly be strings
//   const formattedData = {};
//   for (const key in data) {
//     if (data[key] !== undefined && data[key] !== null) {
//       formattedData[key] =
//         typeof data[key] === "object"
//           ? JSON.stringify(data[key])
//           : String(data[key]);
//     }
//   }

//   const messagePayload = {
//     token: fcmToken,
//     notification: {
//       title: title || "Blood Donation Alert",
//       body: body || "",
//     },
//     data: formattedData,
//     android: {
//       priority: "high", // Forces immediate wake-up for cold/killed state
//       notification: {
//         sound: "default",
//         channelId: "default",
//       },
//     },
//     apns: {
//       payload: {
//         aps: {
//           sound: "default",
//           contentAvailable: true,
//         },
//       },
//     },
//   };

//   try {
//     const response = await admin.messaging().send(messagePayload);
//     console.log("🔥 FCM Push Notification Sent Successfully:", response);
//     return response;
//   } catch (error) {
//     console.error(
//       "❌ Error sending FCM push notification:",
//       error.message || error,
//     );
//   }
// };

// const notifyUser = async ({
//   userId,
//   fcmToken,
//   title,
//   body,
//   data,
//   socketEvent,
//   socketPayload,
// }) => {
//   if (socketEvent) {
//     emitToUser(userId, socketEvent, socketPayload);
//   }
//   if (fcmToken) {
//     await sendPushNotification(fcmToken, title, body, data);
//   }
// };

// module.exports = {
//   initSocket,
//   getIO,
//   emitToUser,
//   sendPushNotification,
//   notifyUser,
// };

// const { Server } = require("socket.io");
// const admin = require("../config/firebaseAdmin");

// let io;

// const getUserModel = () => {
//   try {
//     return require("../models/userMode");
//   } catch (e) {
//     return require("../models/userMode");
//   }
// };

// const getDonorModel = () => {
//   try {
//     const donorModule = require("../models/formModel");
//     return donorModule.Donor || donorModule;
//   } catch (e) {
//     return null;
//   }
// };

// const setUserOnlineStatus = async (userId, isOnline) => {
//   if (!userId) return;
//   const now = new Date();

//   try {
//     const User = getUserModel();
//     const Donor = getDonorModel();

//     const updates = [
//       User.findByIdAndUpdate(userId, { isOnline, lastSeen: now }),
//     ];

//     if (Donor) {
//       updates.push(
//         Donor.findOneAndUpdate({ userId: userId }, { isOnline, lastSeen: now }),
//       );
//     }

//     await Promise.all(updates);

//     if (io) {
//       io.emit("donor_status_changed", {
//         userId: userId.toString(),
//         isOnline,
//         lastSeen: now,
//       });
//     }
//   } catch (err) {
//     console.error(`Error updating status for user ${userId}:`, err.message);
//   }
// };

// const initSocket = (server) => {
//   io = new Server(server, {
//     cors: {
//       origin: "*",
//       methods: ["GET", "POST", "PUT", "DELETE"],
//     },
//   });

//   io.on("connection", (socket) => {
//     console.log("⚡ New Client Connected:", socket.id);

//     const handleUserConnect = async (userId) => {
//       if (!userId) return;
//       const userRoom = userId.toString();
//       socket.join(userRoom);
//       socket.userId = userRoom;
//       await setUserOnlineStatus(userId, true);
//     };

//     socket.on("join_room", handleUserConnect);
//     socket.on("register_user", handleUserConnect);

//     socket.on("disconnect", async () => {
//       const userId = socket.userId;
//       if (userId) {
//         const roomSockets = io.sockets.adapter.rooms.get(userId);
//         if (!roomSockets || roomSockets.size === 0) {
//           await setUserOnlineStatus(userId, false);
//         }
//       }
//     });
//   });

//   return io;
// };

// const getIO = () => {
//   if (!io) {
//     console.warn("⚠️ Warning: getIO() called before socket initialization!");
//   }
//   return io;
// };

// const emitToUser = (userId, event, payload) => {
//   if (io && userId) {
//     io.to(userId.toString()).emit(event, payload);
//   }
// };

// /**
//  * Sends a real-time push notification using Firebase Cloud Messaging (FCM)
//  */
// const sendPushNotification = async (fcmToken, title, body, data = {}) => {
//   if (!fcmToken) {
//     console.log("[Push Notification Skipped] Missing FCM Token");
//     return;
//   }

//   // FCM data values MUST strictly be strings
//   const formattedData = {};
//   for (const key in data) {
//     if (data[key] !== undefined && data[key] !== null) {
//       formattedData[key] =
//         typeof data[key] === "object"
//           ? JSON.stringify(data[key])
//           : String(data[key]);
//     }
//   }

//   const pushTitle = title || "Blood Donation Alert";
//   const pushBody = body || "";

//   const messagePayload = {
//     token: fcmToken,
//     notification: {
//       title: pushTitle,
//       body: pushBody,
//     },
//     data: formattedData,
//     android: {
//       priority: "high", // Delivers immediately across lock/doze states
//       notification: {
//         title: pushTitle,
//         body: pushBody,
//         sound: "default",
//         channelId: "default", // Must match frontend channel ID
//         priority: "max", // Enables Android heads-up drop-down banner
//         visibility: "public", // Displays on locked screen
//         defaultVibrateTimings: true,
//         defaultLightSettings: true,
//       },
//     },
//     apns: {
//       payload: {
//         aps: {
//           sound: "default",
//           contentAvailable: true,
//         },
//       },
//     },
//   };

//   try {
//     const response = await admin.messaging().send(messagePayload);
//     console.log("🔥 FCM Push Notification Sent Successfully:", response);
//     return response;
//   } catch (error) {
//     console.error(
//       "❌ Error sending FCM push notification:",
//       error.message || error,
//     );
//   }
// };

// const notifyUser = async ({
//   userId,
//   fcmToken,
//   title,
//   body,
//   data,
//   socketEvent,
//   socketPayload,
// }) => {
//   if (socketEvent) {
//     emitToUser(userId, socketEvent, socketPayload);
//   }
//   if (fcmToken) {
//     await sendPushNotification(fcmToken, title, body, data);
//   }
// };

// module.exports = {
//   initSocket,
//   getIO,
//   emitToUser,
//   sendPushNotification,
//   notifyUser,
// };

const { Server } = require("socket.io");
const { messaging } = require("../config/firebaseAdmin");

let io;

const getUserModel = () => {
  try {
    return require("../models/userMode");
  } catch (e) {
    return require("../models/userMode");
  }
};

const getDonorModel = () => {
  try {
    const donorModule = require("../models/formModel");
    return donorModule.Donor || donorModule;
  } catch (e) {
    return null;
  }
};

const setUserOnlineStatus = async (userId, isOnline) => {
  if (!userId) return;
  const now = new Date();

  try {
    const User = getUserModel();
    const Donor = getDonorModel();

    const updates = [
      User.findByIdAndUpdate(userId, { isOnline, lastSeen: now }),
    ];

    if (Donor) {
      updates.push(
        Donor.findOneAndUpdate({ userId: userId }, { isOnline, lastSeen: now }),
      );
    }

    await Promise.all(updates);

    if (io) {
      io.emit("donor_status_changed", {
        userId: userId.toString(),
        isOnline,
        lastSeen: now,
      });
    }
  } catch (err) {
    console.error(`Error updating status for user ${userId}:`, err.message);
  }
};

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    console.log("⚡ New Client Connected:", socket.id);

    const handleUserConnect = async (userId) => {
      if (!userId) return;
      const userRoom = userId.toString();
      socket.join(userRoom);
      socket.userId = userRoom;
      await setUserOnlineStatus(userId, true);
    };

    socket.on("join_room", handleUserConnect);
    socket.on("register_user", handleUserConnect);

    socket.on("disconnect", async () => {
      const userId = socket.userId;
      if (userId) {
        const roomSockets = io.sockets.adapter.rooms.get(userId);
        if (!roomSockets || roomSockets.size === 0) {
          await setUserOnlineStatus(userId, false);
        }
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    console.warn("⚠️ Warning: getIO() called before socket initialization!");
  }
  return io;
};

const emitToUser = (userId, event, payload) => {
  if (io && userId) {
    io.to(userId.toString()).emit(event, payload);
  }
};

/**
 * Sends a real-time push notification using Firebase Cloud Messaging (FCM)
 */
const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  if (!fcmToken) {
    console.log("[Push Notification Skipped] Missing FCM Token");
    return;
  }

  // FCM data values MUST strictly be strings
  const formattedData = {};
  for (const key in data) {
    if (data[key] !== undefined && data[key] !== null) {
      formattedData[key] =
        typeof data[key] === "object"
          ? JSON.stringify(data[key])
          : String(data[key]);
    }
  }

  const pushTitle = title || "Blood Donation Alert";
  const pushBody = body || "";

  const messagePayload = {
    token: fcmToken,
    notification: {
      title: pushTitle,
      body: pushBody,
    },
    data: formattedData,
    android: {
      priority: "high", // Delivers immediately across lock/doze states
      notification: {
        title: pushTitle,
        body: pushBody,
        sound: "default",
        channelId: "high_importance_v1", // High priority channel for drop-down banner
        priority: "max", // Enables Android heads-up drop-down banner
        visibility: "public", // Displays on locked screen
        defaultVibrateTimings: true,
        defaultLightSettings: true,
      },
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
          contentAvailable: true,
        },
      },
    },
  };

  try {
    const response = await messaging.send(messagePayload);
    console.log("🔥 FCM Push Notification Sent Successfully:", response);
    return response;
  } catch (error) {
    console.error(
      "❌ Error sending FCM push notification:",
      error.message || error,
    );
  }
};

const notifyUser = async ({
  userId,
  fcmToken,
  title,
  body,
  data,
  socketEvent,
  socketPayload,
}) => {
  if (socketEvent) {
    emitToUser(userId, socketEvent, socketPayload);
  }
  if (fcmToken) {
    await sendPushNotification(fcmToken, title, body, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  sendPushNotification,
  notifyUser,
};
