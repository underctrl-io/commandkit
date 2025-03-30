import { Router } from 'express';

export const api: Router = Router();

api.get('/', (req, res) => {
  res.json({
    message: 'Hello from CommandKit Devtools API',
  });
});
