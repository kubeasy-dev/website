import { EventEmitter } from "events";

/**
 * Validation status emitted when a challenge objective is validated
 */
export interface ValidationEvent {
  userId: string;
  challengeSlug: string;
  objectiveKey: string;
  passed: boolean;
  timestamp: Date;
}

/**
 * Global event emitter for challenge validation events
 * Allows real-time updates across the application when validations occur
 *
 * ⚠️ SERVERLESS WARNING:
 * This in-memory EventEmitter works for single-instance deployments but has limitations
 * in serverless/multi-instance environments (Vercel, Lambda, etc.):
 * - Events only reach subscribers in the SAME serverless instance
 * - Memory leaks possible if listeners aren't cleaned up properly
 * - No persistence between cold starts
 *
 * For production multi-instance deployments, consider:
 * - Redis Pub/Sub (for real-time cross-instance events)
 * - Database-backed event channels (for persistence)
 * - Vercel KV or similar edge-compatible solutions
 *
 * Current mitigation:
 * - setMaxListeners(100) prevents warnings but doesn't solve cross-instance issues
 * - Unsubscribe functions ensure cleanup (always call returned function!)
 * - Works well for single-user real-time updates within same instance
 */
class ValidationEventEmitter extends EventEmitter {
  constructor() {
    super();
    // Set max listeners to prevent memory leak warnings
    // Each user subscription creates 1 listener per challenge
    this.setMaxListeners(100);
  }

  /**
   * Emit a validation event
   */
  emitValidation(event: ValidationEvent) {
    const eventKey = `validation:${event.userId}:${event.challengeSlug}`;
    this.emit(eventKey, event);
  }

  /**
   * Subscribe to validation events for a specific user and challenge
   * IMPORTANT: Always call the returned unsubscribe function to prevent memory leaks!
   */
  onValidation(
    userId: string,
    challengeSlug: string,
    callback: (event: ValidationEvent) => void,
  ) {
    const eventKey = `validation:${userId}:${challengeSlug}`;
    this.on(eventKey, callback);

    // Return unsubscribe function - MUST be called to cleanup!
    return () => {
      this.off(eventKey, callback);
    };
  }
}

// Singleton instance
export const validationEmitter = new ValidationEventEmitter();
