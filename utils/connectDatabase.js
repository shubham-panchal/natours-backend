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

    const DB_URI = MONGODB_URI.replace(
      '<PASSWORD>',
      () => encodeURIComponent(DB_PASSWORD),
    );

    if (DB_URI.includes('<PASSWORD>')) {
      throw new Error('MONGODB_URI still contains the <PASSWORD> placeholder');
    }

    if (/\s|["']/.test(DB_URI)) {
      throw new Error('MONGODB_URI must not contain whitespace or quotes');
    }

    try {
      decodeURIComponent(DB_URI);
      const parsedURI = new URL(DB_URI);
      if (
        !['mongodb:', 'mongodb+srv:'].includes(parsedURI.protocol) ||
        !parsedURI.hostname
      ) {
        throw new Error();
      }
    } catch (error) {
      throw new Error(
        'MONGODB_URI is malformed; verify the scheme, cluster host, and percent-encoding',
      );
    }

    connectionPromise = mongoose
      .connect(DB_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
      })
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  return connectionPromise;
};

module.exports = connectDatabase;
