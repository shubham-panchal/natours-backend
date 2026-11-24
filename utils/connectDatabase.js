const mongoose = require('mongoose');

let connectionPromise;

const connectDatabase = () => {
  if (mongoose.connection.readyState === 1) return Promise.resolve();

  if (!connectionPromise) {
    const { MONGODB_URI, DB_PASSWORD } = process.env;

    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    if (!DB_PASSWORD) {
      throw new Error('DB_PASSWORD environment variable is required');
    }

    if (!MONGODB_URI.includes('<PASSWORD>')) {
      throw new Error('MONGODB_URI must contain the <PASSWORD> placeholder');
    }

    const DB_URI = MONGODB_URI.replace('<PASSWORD>', DB_PASSWORD);

    connectionPromise = mongoose.connect(DB_URI).catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }

  return connectionPromise;
};

module.exports = connectDatabase;
