import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocs from '../config/swagger.js';
import users from '../services/users/routes/index.js';
import authentications from '../services/authentications/routes/index.js';
import journals from '../services/journals/routes/index.js';
import notifications from '../services/notifications/routes/index.js';

const routes = Router();

routes.use('/users', users);
routes.use('/authentications', authentications);
routes.use('/journals', journals);
routes.use('/notifications', notifications);
routes.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

export default routes;
