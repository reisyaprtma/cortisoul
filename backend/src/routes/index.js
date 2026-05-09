import { Router } from 'express';
import users from '../services/users/routes/index.js';
import authentications from '../services/authentications/routes/index.js';

const routes = Router();

routes.use('/', users);
routes.use('/', authentications);

export default routes;
