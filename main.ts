import { Application } from 'jsr:@oak/oak/application';
import { Router } from 'jsr:@oak/oak/router';

import { setUpNotificationServerCredentials } from './src/notifications/webpush-server.ts';
import { addSubscription } from './src/routes/subscription.ts';
import {
  addNotification,
  getPublicVapidKey,
  updateNotification,
} from './src/routes/notifications.ts';

setUpNotificationServerCredentials();

const app = new Application();
app.use((ctx, next) => {
  ctx.response.headers.set('Access-Control-Allow-Origin', '*');
  return next();
});

const router = new Router();
// Subscription routes
router.post('/subscription', addSubscription);

// Notification routes
router.get('/notification/public-vapid-key', getPublicVapidKey);
router.post('/notification', addNotification);
router.patch('/notification', updateNotification);

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener('listen', ({ hostname, port, secure }) => {
  console.log(
    `Listening on: ${secure ? 'https://' : 'http://'}${
      hostname ?? 'localhost'
    }:${port}`
  );
});

await app.listen({ port: 8080 });
