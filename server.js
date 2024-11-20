const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/db'); // Database connection
const cors = require('cors');
const RideShare = require('./models/RideShare'); // Import the RideShare model
const WebSocket = require('ws');
const authRoutes = require('./routes/authRoutes'); 
const rideRoutes = require('./routes/rideRoutes'); // Import ride routes
const feedbackRoutes = require('./routes/feedbackRoutes'); // Import feedback routes
const adminRoutes = require('./routes/adminRoutes'); // Adjust the path as necessary
const authMiddleware = require('./middleware/authMiddleware'); // Import auth middleware
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);

// WebSocket setup
const server = app.listen(5001, () => {
    console.log('Server running on port 5001');
});
const wss = new WebSocket.Server({ server });

// Store WebSocket clients by tripId
const clientsByTripId = {};

// Geofence radius (in degrees, approximate)
const GEOFENCE_RADIUS = 0.01; // Approx. 1 km

// Helper function to calculate distance
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    return Math.sqrt((lat2 - lat1) ** 2 + (lon2 - lon1) ** 2);
};

// WebSocket connection logic
wss.on('connection', async (ws, req) => {
  console.log('New client connected');
//   const tripId = req.url.split('?tripId=')[1];
const url = new URL(req.url, `http://${req.headers.host}`);
    const tripId = url.searchParams.get('tripId');

    console.log('Parsed tripId:', tripId); // Should log the tripId correctly

    if (!tripId) {
        console.log('Connection rejected: tripId not provided');
        ws.close();
        return;
    }

    const trip = await RideShare.findOne({ where: { tripId: tripId,isActive: true } });
    console.log(trip)
    if (!trip || !trip.isActive) {
        console.log(`Connection rejected: trip ${tripId} is inactive`);
        ws.close();
        return;
    }

  // Notify companion about the current status
//   ws.send(JSON.stringify({
//       type: 'statusUpdate',
//       status: trip.status, // Assuming you have a status field in your trip model
//       estimatedTime: trip.estimatedTime // Assuming you have estimatedTime in your trip model
//   }));

  if (!clientsByTripId[tripId]) {
      clientsByTripId[tripId] = [];
  }

  clientsByTripId[tripId].push(ws);

  ws.on('message', (message) => {
      const msg = JSON.parse(message);
      if (msg.type === 'destinationReached') {
          trip.isActive = false; // Mark trip as inactive
          trip.save();
          console.log(`Trip ${tripId} has reached the destination.`);
      }
  });

  ws.on('close', () => {
      console.log('Client disconnected');
      clientsByTripId[tripId] = clientsByTripId[tripId].filter(client => client !== ws);
      if (clientsByTripId[tripId].length === 0) {
          delete clientsByTripId[tripId]; // Clean up if no clients left
      }
  });
});

// Sync database and start the server
sequelize.sync({ force: false })
    .then(() => {
        console.log('Database synchronized');
    })
    .catch((error) => {
        console.error('Error synchronizing the database:', error);
    });
