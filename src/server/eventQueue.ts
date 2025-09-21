import { logger } from '../utils/logger.js';

export interface MCPEvent {
  event: string;
  data: any;
  timestamp: number;
  id?: string;
}

export interface EventSubscriber {
  id: string;
  send: (event: MCPEvent) => void;
  close: () => void;
}

export class EventQueue {
  private events: MCPEvent[] = [];
  private subscribers: Map<string, EventSubscriber> = new Map();
  private maxEvents: number;
  private eventIdCounter = 0;

  constructor(maxEvents = 100) {
    this.maxEvents = maxEvents;
  }

  /**
   * Push a new event to the queue and notify subscribers
   */
  pushEvent(event: Omit<MCPEvent, 'timestamp' | 'id'>): void {
    const fullEvent: MCPEvent = {
      ...event,
      timestamp: Date.now(),
      id: (++this.eventIdCounter).toString()
    };

    // Add to queue
    this.events.push(fullEvent);

    // Maintain max size
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Notify all subscribers
    this.notifySubscribers(fullEvent);

    logger.debug({ eventId: fullEvent.id }, `Event pushed: ${fullEvent.event}`);
  }

  /**
   * Get recent events (for backlog on new connections)
   */
  getRecentEvents(limit?: number): MCPEvent[] {
    const events = limit ? this.events.slice(-limit) : this.events;
    return [...events]; // Return copy
  }

  /**
   * Subscribe to live events
   */
  subscribe(subscriber: EventSubscriber): void {
    this.subscribers.set(subscriber.id, subscriber);
    logger.debug(`Subscriber added: ${subscriber.id}`);

    // Send backlog to new subscriber
    const recentEvents = this.getRecentEvents();
    for (const event of recentEvents) {
      try {
        subscriber.send(event);
      } catch (error) {
        logger.error({ error, subscriberId: subscriber.id }, `Error sending backlog event to subscriber ${subscriber.id}`);
      }
    }
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriberId: string): void {
    const subscriber = this.subscribers.get(subscriberId);
    if (subscriber) {
      try {
        subscriber.close();
      } catch (error) {
        logger.error({ error, subscriberId }, `Error closing subscriber ${subscriberId}`);
      }
      this.subscribers.delete(subscriberId);
      logger.debug(`Subscriber removed: ${subscriberId}`);
    }
  }

  /**
   * Notify all subscribers of a new event
   */
  private notifySubscribers(event: MCPEvent): void {
    const deadSubscribers: string[] = [];

    for (const [id, subscriber] of this.subscribers) {
      try {
        subscriber.send(event);
      } catch (error) {
        logger.error({ error, subscriberId: id }, `Error sending event to subscriber ${id}`);
        deadSubscribers.push(id);
      }
    }

    // Clean up dead subscribers
    for (const id of deadSubscribers) {
      this.unsubscribe(id);
    }
  }

  /**
   * Get current stats
   */
  getStats(): { eventCount: number; subscriberCount: number; maxEvents: number } {
    return {
      eventCount: this.events.length,
      subscriberCount: this.subscribers.size,
      maxEvents: this.maxEvents
    };
  }

  /**
   * Clear all events and subscribers
   */
  clear(): void {
    // Close all subscribers
    for (const [id] of this.subscribers) {
      this.unsubscribe(id);
    }

    this.events = [];
    this.eventIdCounter = 0;
    logger.info('Event queue cleared');
  }
}

// Global event queue instance
export const globalEventQueue = new EventQueue();
