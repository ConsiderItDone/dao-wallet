/**
 * Custom types for implementing injected wallet API.
 */

/**
 * Message type for interactions via window.postMessage between injectedAPI, contentscript and background scripts.
 */
export interface InjectedAPIMessage {
  target: string;
  method: string;
  params?: any;
  response?: any;
  id?: string;
}
