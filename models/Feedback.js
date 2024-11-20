// models/Feedback.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Ensure this points to your database config

class Feedback extends Model {}

Feedback.init({
    rideShareId: {
        type: DataTypes.STRING, // Assuming trip IDs are strings
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    rating: {
        type: DataTypes.INTEGER, // Adjust according to your rating system
        allowNull: false,
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true, // Optional comment
    },
}, {
    sequelize,
    modelName: 'Feedback',
    tableName: 'Feedbacks', // Ensure this matches your database table
    timestamps: true,
});

module.exports = Feedback;
