const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Database connection

const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    mobile_number: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('traveler', 'traveler_companion', 'admin'),
        allowNull: false,
    },
});

module.exports = User;
