/**
 * Event Emitter Port Interface
 *
 * Defines the contract for emitting domain events.
 * Implementation may use NestJS EventEmitter, message queue, etc.
 */

/**
 * Domain event structure for identity events
 */
export interface DomainEvent {
  id: string;
  type: string;
  occurredAt: string;
  aggregateId: string;
  aggregateType: string;
  actorId: string | null;
  payload: Record<string, unknown>;
  metadata?: {
    correlationId?: string;
    causationId?: string;
    version?: number;
  };
}

/**
 * Port interface for domain event emission
 *
 * Abstracts the event publishing mechanism from the application layer.
 */
export interface EventEmitterPort {
  /**
   * Emits a domain event
   *
   * @param event - The domain event to emit
   */
  emit(event: DomainEvent): Promise<void>;

  /**
   * Emits multiple domain events
   *
   * @param events - The domain events to emit
   */
  emitMany(events: DomainEvent[]): Promise<void>;
}
