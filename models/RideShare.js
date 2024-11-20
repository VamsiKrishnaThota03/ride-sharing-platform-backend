const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Ensure this points to your database config

class RideShare extends Model {}

RideShare.init({
    tripId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    driverName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    driverPhone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cabNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    companionMobile: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    userId: {
        type: DataTypes.INTEGER, // Ensure this matches your user ID type
        allowNull: false,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true, // Default value set to true
        allowNull: false, // Not allowing null values
    }
}, {
    sequelize,
    modelName: 'RideShare',
    tableName: 'RideShares',
    timestamps: true,
});

module.exports = RideShare;
