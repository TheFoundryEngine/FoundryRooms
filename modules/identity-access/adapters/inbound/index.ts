/**
 * Identity-Access Inbound Adapters
 *
 * HTTP layer components: controllers, middleware, guards, and DTOs.
 */

// Controllers
export { AuthController, REGISTER_USER_USE_CASE, LOGIN_USE_CASE, LOGOUT_USE_CASE, REFRESH_SESSION_USE_CASE } from './auth.controller';
export { AgentController, CREATE_AGENT_USE_CASE, AGENT_REPOSITORY as AGENT_CONTROLLER_AGENT_REPOSITORY, API_KEY_GENERATOR as AGENT_CONTROLLER_API_KEY_GENERATOR } from './agent.controller';

// Middleware and Guards
export {
  AuthMiddleware,
  AuthGuard,
  Actor,
  SESSION_REPOSITORY,
  AGENT_REPOSITORY,
  API_KEY_GENERATOR,
  type AuthenticatedRequest,
} from './auth.middleware';
export {
  RequestAuthenticator,
  AuthenticationInfrastructureError,
  TOUCH_INTERVAL_MS,
} from './request-authenticator';
export {
  RateLimitGuard,
  InMemoryRateLimitStore,
  RATE_LIMIT_OPTIONS,
  type RateLimitOptions,
} from './rate-limit.middleware';

// DTOs
export {
  // Auth DTOs
  RegisterUserDto,
  RegisterUserResponseDto,
  LoginDto,
  LoginResponseDto,
  LogoutDto,
  LogoutResponseDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
  // Actor DTOs
  ActorSummaryDto,
  // Agent DTOs
  CreateAgentDto,
  CreateAgentResponseDto,
  AgentSummaryDto,
  AgentResponseDto,
  RotateApiKeyResponseDto,
  // Error DTOs
  ErrorResponseDto,
  // Types
  type ActorContext,
} from './dto';
