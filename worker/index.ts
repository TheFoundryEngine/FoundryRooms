/**
 * Worker entrypoint — bootstraps the background job processor.
 *
 * Wires the Redis connection, registers all handlers from every bounded
 * context, starts one BullMQ Worker per queue, and serves a health
 * endpoint. Shuts down gracefully on SIGTERM/SIGINT.
 */
import http from 'http';
import { createRedisConnection } from './src/bindings/redis-connection';
import { createQueueFactory } from './src/queues/queue-factory';
import { ALL_QUEUE_NAMES } from './src/queues/queue-names';
import { createHandlerRegistry } from './src/runtime/handler-registry';
import { createHealthCheck } from './src/runtime/health-check';
import { createWorkerBootstrap } from './src/bootstrap/worker-bootstrap';
import { createBullMQRunner } from './src/bootstrap/bullmq-runner';
import { createAllHandlers } from './src/handlers';

async function main(): Promise<void> {
  const redis = createRedisConnection();
  const connection = { connection: redis };

  const registry = createHandlerRegistry();
  const queueFactory = createQueueFactory(connection);

  // In production these services are real application service ports.
  // The worker only depends on the port interface, never adapters.
  const handlers = createAllHandlers({
    welcomeEmail: { sendWelcomeEmail: async () => ({ delivered: true }) },
    entitlementSync: { syncEntitlement: async () => ({ synced: true }) },
    eventReminder: { sendReminder: async () => ({ sent: true }) },
    inviteExpiration: { expireInvite: async () => ({ expired: true }) },
  });

  const bootstrap = createWorkerBootstrap({
    registry,
    handlers,
    queueNames: ALL_QUEUE_NAMES,
    createRunner: (queueName, deps) =>
      createBullMQRunner(queueName, deps, connection),
  });

  bootstrap.start();

  // Health endpoint
  const health = createHealthCheck({ ping: () => redis.ping() });
  const server = http.createServer((req, res) => {
    if (req.url === '/health' || req.url === '/healthz') {
      void health.httpHandler(req, res);
      return;
    }
    res.statusCode = 404;
    res.end();
  });
  server.listen(Number(process.env.WORKER_HEALTH_PORT ?? 9090));

  const shutdown = async (signal: string): Promise<void> => {
     
    console.log(`worker received ${signal}, draining…`);
    server.close();
    await bootstrap.shutdown();
    await queueFactory.close();
    redis.disconnect();
     
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

   
  console.log('worker up — queues:', ALL_QUEUE_NAMES.join(', '));
}

main().catch((err) => {
   
  console.error('worker failed to start:', err);
   
  process.exit(1);
});
