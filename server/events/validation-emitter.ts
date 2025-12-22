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
 */
class ValidationEventEmitter extends EventEmitter {
  /**
   * Emit a validation event
   */
  emitValidation(event: ValidationEvent) {
    const eventKey = `validation:${event.userId}:${event.challengeSlug}`;
    this.emit(eventKey, event);
  }

  /**
   * Subscribe to validation events for a specific user and challenge
   */
  onValidation(
    userId: string,
    challengeSlug: string,
    callback: (event: ValidationEvent) => void,
  ) {
    const eventKey = `validation:${userId}:${challengeSlug}`;
    this.on(eventKey, callback);

    // Return unsubscribe function
    return () => {
      this.off(eventKey, callback);
    };
  }
}

// Singleton instance
export const validationEmitter = new ValidationEventEmitter();
