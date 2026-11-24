const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');
const connectDatabase = require('./utils/connectDatabase');

const startServer = async () => {
  await connectDatabase();
  console.log('DB connection successful');

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`App running on http://localhost:${port}`);
  });
};

startServer().catch((error) => {
  console.error('Unable to start server:', error);
  process.exitCode = 1;
});
