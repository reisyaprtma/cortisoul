import express from 'express';
import {
  createJournal,
  getJournals,
  getJournalById,
  editJournalById,
  deleteJournalById,
} from '../controller/journals-controller.js';
import { validate } from '../../../middlewares/validate.js';
import { journalPayloadSchema } from '../validator/schema.js';
import authenticateToken from '../../../middlewares/auth.js';

const routes = express.Router();

routes.post(
  '/',
  authenticateToken,
  validate(journalPayloadSchema),
  createJournal
);
routes.get('/', authenticateToken, getJournals);
routes.get('/:id', authenticateToken, getJournalById);
routes.put(
  '/:id',
  authenticateToken,
  validate(journalPayloadSchema),
  editJournalById
);
routes.delete('/:id', authenticateToken, deleteJournalById);
export default routes;
