import 'dotenv/config'; 
import express, { Request, Response } from "express";
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import cron from 'node-cron';
import router from './routes';
import errorHandler from './middleware/errorHandler';
import { changeCurrentToPast, changeFutureToCurrent, notificationForCheckout, notificationForLeaveReview } from './servers/cronJob';
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
// CORS options
const corsOptions = {
  origin: ['http://localhost:5173', 'http://192.168.1.57:9999'], // Replace with your frontend URLs
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "http://192.168.1.57:9999/uploads"],
        mediaSrc: ["'self'", "http://192.168.1.57:9999/uploads"],
        connectSrc: ["'self'", "http://192.168.1.57:9999"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resource sharing
  })
);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// // Apply the rate limiter to all routes
app.use(limiter);
app.get("/", (req:Request, res:Response) => {
    res.send("API is running");
  });
  app.use('/api/v1', router);
app.use("*", (req:Request, res:Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});
app.use(errorHandler);
cron.schedule('0 0 * * *', () => {
  changeFutureToCurrent();
  changeCurrentToPast();
});

cron.schedule('0 0 1 * * *', () => {
  notificationForLeaveReview();
  notificationForCheckout();
});



export  default app;