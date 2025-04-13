import express from "express";
import "dotenv/config";
import cors from "cors";
import job from "./lib/cron.js";
//routes
import authRoute from "./routes/auth.route.js";
import bookRoute from "./routes/book.route.js";
import connectDB from "./lib/db.js";

//Variables
const app = express();
const PORT = process.env.PORT || 5000;

//Middlewares
app.use(express.json());
app.use(cors());
job.start();

//Routes
app.use("/api/auth", authRoute);
app.use("/api/books", bookRoute);

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
  connectDB();
});
