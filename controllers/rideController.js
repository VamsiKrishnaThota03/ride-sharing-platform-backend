const RideShare = require('../models/RideShare');

// Save shared ride details
exports.saveRideShare = async (req, res) => {
  const { tripId, driverName, driverPhone, cabNumber, companionMobile } = req.body;
  const userId = req.user.id;
  console.log(tripId)
  try {
      const rideShare = await RideShare.create({
          tripId,
          driverName,
          driverPhone,
          cabNumber,
          companionMobile,
          userId,
          isActive: true,
      });

      return res.status(201).json({ message: 'Ride shared successfully', rideShare });
  } catch (error) {
      console.error('Error saving ride share:', error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Fetch rides shared by the user
exports.getUserRideShares = async (req, res) => {
    try {
        const rides = await RideShare.findAll({
            where: { userId: req.user.id},
            order: [['createdAt', 'DESC']],
        });
        return res.status(200).json(rides);
    } catch (error) {
        console.error('Error fetching rides:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Expire ride shares upon reaching destination
exports.expireRideShare = async (req, res) => {
    const { tripId } = req.body;

    try {
        const rideShare = await RideShare.findOne({ where: { tripId } });

        if (!rideShare) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        rideShare.isActive = false;
        await rideShare.save();

        return res.status(200).json({ message: 'Ride share expired successfully' });
    } catch (error) {
        console.error('Error expiring ride share:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


exports.getCompanionRideDetails = async (req, res) => {
  try {
      // Ensure the role of the user is 'companion'
    //   if (req.user.role !== 'traveler_companion') {
    //       return res.status(403).json({ message: 'Access forbidden: not a companion' });
    //   }

      // Fetch ride share details where companionMobile matches the logged-in user's mobile number
      console.log(req.user.mobile_number)
      const rideShareDetails = await RideShare.findAll({
          where: { companionMobile: req.user.mobile_number } // Assuming mobile_number is available in req.user
      });

      if (!rideShareDetails.length) {
          return res.status(404).json({ message: 'No ride share details found for this companion.' });
      }

      return res.status(200).json(rideShareDetails);
  } catch (error) {
      console.error('Error fetching companion ride details:', error);
      return res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};