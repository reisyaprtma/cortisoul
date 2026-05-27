import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import routes from '../routes/index.js';
import ErrorHandler from '../middlewares/error.js';
import startCronJob from '../services/notifications/cron/notification-cron.js';
import requestLogger from '../middlewares/request-logger.js';
import helmet from 'helmet';

const app = express();

// security middlewares
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json());

// logging middleware
app.use(requestLogger);

// routes
app.use(routes);

// error handling middleware
app.use(ErrorHandler);

// start cron job for notifications
startCronJob();

export default app;
