import 'dotenv/config'; 
import express, { Request, Response } from "express";
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import router from './routes';
import errorHandler from './middleware/errorHandler';
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
// CORS options
const corsOptions = {
  origin: "*",
  "Access-Control-Allow-Origin": "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use("/uploads",express.static(path.join(__dirname, '../uploads')));
// Routes

app.get("/", (req:Request, res:Response) => {
    res.send("API is running");
  });
  app.use('/api/v1',router);
app.use("*", (req:Request, res:Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});
app.use(errorHandler)

export  default app;