const host = process.env.HOST;
const port = process.env.PORT;

const swaggerDocs = {
  openapi: '3.0.0',
  info: {
    title: 'Cortisoul API',
    version: '1.0.0',
  },
  servers: [{ url: `http://${host}:${port}` }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  paths: {
    '/users': {
      post: {
        tags: ['Users'],
        summary: 'Register user',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string' },
                  fullname: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Created' } },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by id',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/authentications': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Created' } },
      },
      put: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { refreshToken: { type: 'string' } },
              },
            },
          },
        },
        responses: { 200: { description: 'OK' } },
      },
      delete: {
        tags: ['Auth'],
        summary: 'Logout',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { refreshToken: { type: 'string' } },
              },
            },
          },
        },
        responses: { 200: { description: 'OK' } },
      },
    },
    '/journals': {
      get: {
        tags: ['Journals'],
        summary: 'List journals',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'OK' } },
      },
      post: {
        tags: ['Journals'],
        summary: 'Create journal',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  content: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Created' } },
      },
    },
    '/journals/stress-levels': {
      get: {
        tags: ['Journals'],
        summary: 'Weekly stress levels',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/journals/emotions': {
      get: {
        tags: ['Journals'],
        summary: 'Weekly emotions',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/journals/{id}': {
      get: {
        tags: ['Journals'],
        summary: 'Get journal',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: { 200: { description: 'OK' } },
      },
      put: {
        tags: ['Journals'],
        summary: 'Update journal',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  content: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'OK' } },
      },
      delete: {
        tags: ['Journals'],
        summary: 'Delete journal',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: { 200: { description: 'OK' } },
      },
    },
  },
};

export default swaggerDocs;
