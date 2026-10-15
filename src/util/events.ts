/**
 * Somewhere to report events. Producers only push, so a list of a wider event type
 * (e.g. every match event) can collect the narrower events of one subsystem.
 */
export interface EventSink<E> {
  push(event: E): unknown;
}
