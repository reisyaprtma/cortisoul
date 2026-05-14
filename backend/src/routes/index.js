import { Router } from 'express';
import users from '../services/users/routes/index.js';
import authentications from '../services/authentications/routes/index.js';
import journals from '../services/journals/routes/index.js';

const routes = Router();

routes.use('/users', users);
routes.use('/authentications', authentications);
routes.use('/journals', journals);

export default routes;
