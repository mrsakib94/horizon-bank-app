import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://eb1488c0f7a221ea7537ed35eee9d7af@o4509330121752576.ingest.us.sentry.io/4509330306564096',

  integrations: [Sentry.replayIntegration()],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});
