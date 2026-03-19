/**
 * EventBus - Cross-component event communication for Vue apps
 *
 * A typed event bus that enables decoupled communication between components,
 * with support for automatic backend event delivery.
 */
import type { ApiClient } from '../api/ApiClient';
type EventCallback<T = unknown> = (payload: T) => void;
interface EventBusOptions {
    /** Enable debug logging */
    debug?: boolean;
    /** Maximum events to keep in history */
    maxHistory?: number;
    /** API client for backend event delivery */
    apiClient?: ApiClient;
    /** Backend endpoint for events (default: /events) */
    eventsEndpoint?: string;
    /** Enable automatic backend sending (default: true when apiClient is set) */
    autoSendToBackend?: boolean;
    /** Events to exclude from backend sending (local-only events) */
    localOnlyEvents?: string[];
}
interface EventHistoryEntry {
    event: string;
    payload: unknown;
    timestamp: Date;
    sentToBackend?: boolean;
}
export declare class EventBus {
    private listeners;
    private history;
    private options;
    private pendingEvents;
    private isSending;
    constructor(options?: EventBusOptions);
    /**
     * Configure the EventBus after construction.
     * Useful for setting ApiClient after app initialization.
     */
    configure(options: Partial<EventBusOptions>): void;
    /**
     * Emit an event with optional payload.
     * Automatically sends to backend if configured.
     * @param event - Event name
     * @param payload - Optional event data
     */
    emit<T>(event: string, payload?: T): void;
    /**
     * Check if event should be sent to backend
     */
    private shouldSendToBackend;
    /**
     * Queue an event for backend delivery
     */
    private queueBackendEvent;
    /**
     * Flush pending events to backend
     */
    private flushPendingEvents;
    /**
     * Manually send events to backend (for local-only events that need explicit sending)
     */
    sendToBackend<T>(event: string, payload?: T): Promise<boolean>;
    /**
     * Subscribe to an event
     * @param event - Event name
     * @param callback - Handler function
     * @returns Unsubscribe function
     */
    on<T>(event: string, callback: EventCallback<T>): () => void;
    /**
     * Unsubscribe from an event
     * @param event - Event name
     * @param callback - Handler function to remove
     */
    off<T>(event: string, callback: EventCallback<T>): void;
    /**
     * Subscribe to an event once (auto-unsubscribes after first emit)
     * @param event - Event name
     * @param callback - Handler function
     */
    once<T>(event: string, callback: EventCallback<T>): void;
    /**
     * Check if an event has any listeners
     * @param event - Event name
     */
    hasListeners(event: string): boolean;
    /**
     * Get count of listeners for an event
     * @param event - Event name
     */
    listenerCount(event: string): number;
    /**
     * Get event history for debugging
     * @param event - Optional filter by event name
     */
    getHistory(event?: string): EventHistoryEntry[];
    /**
     * Clear all listeners and history
     */
    clear(): void;
    /**
     * Clear only history (keep listeners)
     */
    clearHistory(): void;
    /**
     * Remove all listeners for a specific event
     * @param event - Event name
     */
    clearEvent(event: string): void;
    /**
     * Get pending event count (events not yet sent to backend)
     */
    getPendingCount(): number;
}
export declare const eventBus: EventBus;
/**
 * Configure the singleton eventBus instance.
 * Call this in main.ts after creating the API client.
 */
export declare function configureEventBus(options: Partial<EventBusOptions>): void;
export {};
//# sourceMappingURL=EventBus.d.ts.map