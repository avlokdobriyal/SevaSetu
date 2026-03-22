const dotenv = require("dotenv");
const app = require("./app");
const connectDB = require("./config/db");
const { startSlaOverdueJob } = require("./jobs/slaOverdueJob");

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  startSlaOverdueJob();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
