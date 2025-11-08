/* eslint-disable */
// @ts-nocheck
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { POST as WebhookPOST } from './webhook.mjs';
import { POST as StepPOST } from './steps.mjs';
import { POST as FlowPOST } from './workflows.mjs';

const app = new Hono();

const handlers = [
  ['/.well-known/workflow/v1/webhook/:token', (c) => WebhookPOST(c.req.raw)],
  ['/.well-known/workflow/v1/step', (c) => StepPOST(c.req.raw)],
  ['/.well-known/workflow/v1/flow', (c) => FlowPOST(c.req.raw)],
];

handlers.forEach(([path, handler]) => app.all(path, handler));

const port = process.env.PORT;

if (!port || isNaN(Number(port))) {
  throw new Error(
    'process.env.PORT must be set in order to use @commandkit/workflow plugin',
  );
}

serve({
  fetch: app.fetch,
  port: Number(port),
});
