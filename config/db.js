const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize with your PostgreSQL connection details
const sequelize = new Sequelize(
    process.env.DB_NAME, // Database name
    process.env.DB_USER, // Username
    process.env.DB_PASSWORD, // Password
    {
        host: process.env.DB_HOST,
        dialect: 'postgres', // Specify PostgreSQL
        port: process.env.DB_PORT,
    }
);

// Test the connection
sequelize.authenticate()
    .then(() => {
        console.log('Connection to the database has been established successfully.');
    })
    .catch((err) => {
        console.error('Unable to connect to the database:', err);
    });

module.exports = sequelize;
