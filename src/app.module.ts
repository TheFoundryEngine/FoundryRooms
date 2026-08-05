import { Module, NestModule, MiddlewareConsumer, Controller, Get } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import cookieParser from 'cookie-parser';

@Controller('auth/health')
class HealthController {
  @Get()
  healthCheck() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}

import {
  AuthController,
  AgentController,
  AuthMiddleware,
  REGISTER_USER_USE_CASE,
  LOGIN_USE_CASE,
  LOGOUT_USE_CASE,
  CREATE_AGENT_USE_CASE,
  AGENT_REPOSITORY,
  SESSION_REPOSITORY,
  API_KEY_GENERATOR,
  AGENT_CONTROLLER_AGENT_REPOSITORY,
  AGENT_CONTROLLER_API_KEY_GENERATOR,
} from '../modules/identity-access/adapters/inbound';

import {
  BcryptPasswordHasher,
  CryptoApiKeyGenerator,
} from '../modules/identity-access/adapters/outbound';

import {
  UserRepositoryDrizzle,
  AgentRepositoryDrizzle,
  SessionRepositoryDrizzle,
} from '../modules/identity-access/adapters/outbound/drizzle';

import type { UserRepository } from '../modules/identity-access/application/ports/user.repository';
import type { SessionRepository } from '../modules/identity-access/application/ports/session.repository';
import type { AgentRepository } from '../modules/identity-access/application/ports/agent.repository';
import type { PasswordHasherPort } from '../modules/identity-access/application/ports/password-hasher.port';
import type { ApiKeyGeneratorPort } from '../modules/identity-access/application/ports/api-key-generator.port';
import type { EventEmitterPort, DomainEvent } from '../modules/identity-access/application/ports/event-emitter.port';

import { RegisterUserUseCase } from '../modules/identity-access/application/use-cases/register-user.use-case';
import { LoginUseCase } from '../modules/identity-access/application/use-cases/login.use-case';
import { LogoutUseCase } from '../modules/identity-access/application/use-cases/logout.use-case';
import { CreateAgentUseCase } from '../modules/identity-access/application/use-cases/create-agent.use-case';

import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../modules/identity-access/adapters/outbound/drizzle/schema';

class NoopEventEmitter implements EventEmitterPort {
  async emit(_event: DomainEvent): Promise<void> {}
  async emitMany(_events: DomainEvent[]): Promise<void> {}
}

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [HealthController, AuthController, AgentController],
  providers: [
    {
      provide: 'PG_POOL',
      useFactory: () => {
        const pool = new pg.Pool({
          connectionString: process.env.DATABASE_URL,
        });
        return drizzle(pool, { schema });
      },
    },
    {
      provide: AGENT_REPOSITORY,
      useFactory: (db: any) => new AgentRepositoryDrizzle(db),
      inject: ['PG_POOL'],
    },
    {
      provide: SESSION_REPOSITORY,
      useFactory: (db: any) => new SessionRepositoryDrizzle(db),
      inject: ['PG_POOL'],
    },
    {
      provide: 'USER_REPOSITORY',
      useFactory: (db: any) => new UserRepositoryDrizzle(db),
      inject: ['PG_POOL'],
    },
    {
      provide: 'PASSWORD_HASHER',
      useFactory: () => new BcryptPasswordHasher(),
    },
    {
      provide: API_KEY_GENERATOR,
      useFactory: () => new CryptoApiKeyGenerator(),
    },
    {
      provide: AGENT_CONTROLLER_AGENT_REPOSITORY,
      useFactory: (db: any) => new AgentRepositoryDrizzle(db),
      inject: ['PG_POOL'],
    },
    {
      provide: AGENT_CONTROLLER_API_KEY_GENERATOR,
      useFactory: () => new CryptoApiKeyGenerator(),
    },
    {
      provide: 'EVENT_EMITTER',
      useFactory: () => new NoopEventEmitter(),
    },
    {
      provide: REGISTER_USER_USE_CASE,
      useFactory: (userRepo: UserRepository, hasher: PasswordHasherPort, emitter: EventEmitterPort) =>
        new RegisterUserUseCase({ userRepository: userRepo, passwordHasher: hasher, eventEmitter: emitter }),
      inject: ['USER_REPOSITORY', 'PASSWORD_HASHER', 'EVENT_EMITTER'],
    },
    {
      provide: LOGIN_USE_CASE,
      useFactory: (userRepo: UserRepository, sessionRepo: SessionRepository, hasher: PasswordHasherPort) =>
        new LoginUseCase({ userRepository: userRepo, sessionRepository: sessionRepo, passwordHasher: hasher }),
      inject: ['USER_REPOSITORY', SESSION_REPOSITORY, 'PASSWORD_HASHER'],
    },
    {
      provide: LOGOUT_USE_CASE,
      useFactory: (sessionRepo: SessionRepository) =>
        new LogoutUseCase({ sessionRepository: sessionRepo }),
      inject: [SESSION_REPOSITORY],
    },
    {
      provide: CREATE_AGENT_USE_CASE,
      useFactory: (agentRepo: AgentRepository, keyGen: ApiKeyGeneratorPort, emitter: EventEmitterPort) =>
        new CreateAgentUseCase({ agentRepository: agentRepo, apiKeyGenerator: keyGen, eventEmitter: emitter }),
      inject: [AGENT_CONTROLLER_AGENT_REPOSITORY, AGENT_CONTROLLER_API_KEY_GENERATOR, 'EVENT_EMITTER'],
    },
    AuthMiddleware,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*');
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
