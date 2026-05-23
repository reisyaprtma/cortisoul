import express from 'express';
import {
  subscribe,
  unsubscribe,
  testNotification,
} from '../controller/notifications-controller.js';
import { validate } from '../../../middlewares/validate.js';
import { subscribePayloadSchema } from '../validator/schema.js';
import authenticateToken from '../../../middlewares/auth.js';

const routes = express.Router();

routes.post(
  '/subscribe',
  authenticateToken,
  validate(subscribePayloadSchema),
  subscribe
);

routes.delete('/subscribe', authenticateToken, unsubscribe);

routes.post('/test', authenticateToken, testNotification);

export default routes;
