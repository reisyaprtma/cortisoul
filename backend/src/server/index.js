import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import routes from '../routes/index.js';
import ErrorHandler from '../middlewares/error.js';
import startCronJob from '../services/notifications/cron/notification-cron.js';

const app = express();
app.use(express.json());
app.use(cors({ origin: true }));
app.use(routes);
app.use(ErrorHandler);

// Mulai jalankan penjadwalan (cron job)
startCronJob();

export default app;
