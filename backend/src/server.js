import server from './server/index.js';

const port = process.env.PORT;
const host = process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0';

server.listen(port, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
