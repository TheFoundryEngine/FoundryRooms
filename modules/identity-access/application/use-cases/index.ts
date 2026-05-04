/**
 * Identity-Access Use Cases
 *
 * Application layer use cases for identity and access management.
 */

// Register User
export { RegisterUserUseCase } from './register-user.use-case';
export type {
  RegisterUserInput,
  RegisterUserOutput,
  RegisterUserDeps,
} from './register-user.use-case';
export {
  EmailAlreadyExistsError,
  InvalidPasswordError,
} from './register-user.use-case';

// Create Agent
export { CreateAgentUseCase } from './create-agent.use-case';
export type {
  CreateAgentInput,
  CreateAgentOutput,
  CreateAgentDeps,
} from './create-agent.use-case';
export {
  InvalidAgentNameError,
  InvalidApiKeyPrefixError,
} from './create-agent.use-case';

// Login
export { LoginUseCase } from './login.use-case';
export type { LoginInput, LoginOutput, LoginDeps } from './login.use-case';
export { InvalidCredentialsError, AccountDeactivatedError } from './login.use-case';

// Authenticate API Key
export { AuthenticateApiKeyUseCase } from './authenticate-api-key.use-case';
export type {
  AuthenticateApiKeyInput,
  AuthenticateApiKeyOutput,
  AuthenticateApiKeyDeps,
  AgentContext,
} from './authenticate-api-key.use-case';
export {
  InvalidApiKeyError,
  AgentDeactivatedError,
  MalformedApiKeyError,
} from './authenticate-api-key.use-case';

// Logout
export { LogoutUseCase } from './logout.use-case';
export type { LogoutInput, LogoutOutput, LogoutDeps } from './logout.use-case';

// Password Reset
export {
  RequestPasswordResetUseCase,
  CompletePasswordResetUseCase,
  generateResetToken,
  hashResetToken,
  RESET_TOKEN_DURATION_MS,
} from './reset-password.use-case';
export type {
  RequestPasswordResetInput,
  RequestPasswordResetOutput,
  RequestPasswordResetDeps,
  CompletePasswordResetInput,
  CompletePasswordResetOutput,
  CompletePasswordResetDeps,
} from './reset-password.use-case';
export {
  InvalidResetTokenError,
  ResetTokenExpiredError,
  ResetTokenAlreadyUsedError,
  AccountDeactivatedForResetError,
  WeakPasswordError,
  UserNotFoundForResetError,
} from './reset-password.use-case';
