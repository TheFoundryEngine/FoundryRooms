import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { buildCorsOptions, resolveTrustProxy } from './http-config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api/v1');

  // Behind Render's proxy req.ip is the proxy address unless Express is told
  // how many hops to trust — without this, per-IP rate limiting collapses
  // into one shared bucket for all clients (THE-64 / #25).
  app.set('trust proxy', resolveTrustProxy(process.env));

  app.enableCors(buildCorsOptions(process.env));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`FoundryRooms API running on port ${port}`);
}

bootstrap();
