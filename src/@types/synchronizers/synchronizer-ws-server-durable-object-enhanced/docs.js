/**
 * The synchronizer-ws-server-durable-object-enhanced module of the TinyBase
 * project provides a Durable Object server that performs authorization-aware
 * filtering of mergeable changes when synchronizing clients.
 * @see Cloudflare Durable Objects guide
 * @see Synchronization guide
 * @packageDocumentation
 * @module synchronizer-ws-server-durable-object-enhanced
 * @since vNEXT
 */
/// synchronizer-ws-server-durable-object-enhanced

/**
 * A WsServerDurableObjectEnhanced is the server component (running as a
 * Cloudflare Durable Object) for synchronization between clients that are using
 * WsSynchronizer instances, with built-in read/write authorization checks.
 *
 * This enhanced version extends the base Durable Object server with helpers
 * that filter outgoing diffs and validate incoming changes against your
 * schema-defined authorization functions.
 * @category Creation
 * @essential Synchronizing stores
 * @since vNEXT
 */
/// WsServerDurableObjectEnhanced
{
  /**
   * The onMessageMutator method is called before a message is forwarded by the
   * server. The enhanced server uses this hook to filter diffs when the server
   * reads to a client, and to validate writes from a client to the server.
   *
   * Return a promise that resolves to `true` to allow the message to be
   * forwarded, `false` to block it, or a modified remainder string to mutate the
   * message before forwarding.
   * @param fromClientId The Id of the client that sent the message.
   * @param toClientId The Id of the client to receive the message (or empty for
   * a broadcast).
   * @param remainder The remainder of the body of the message.
   * @returns Whether the message should be forwarded (or a modified remainder).
   * @category Event
   * @since vNEXT
   */
  /// WsServerDurableObjectEnhanced.onMessageMutator
}

/**
 * The getWsServerDurableObjectEnhancedFetch function returns a convenient
 * handler for a Cloudflare worker to route requests to the fetch handler of a
 * WsServerDurableObjectEnhanced for the given namespace.
 *
 * This requires the request to be a WebSocket 'Upgrade' request, and for the
 * client to have provided a `sec-websocket-key` header that the server can use
 * as a unique key for the client. The handler uses the request path to locate
 * the Durable Object instance to handle the WebSocket communication.
 * @param namespace A string for the namespace of the Durable Objects that you
 * want this worker to route requests to.
 * @returns A fetch handler that routes WebSocket upgrade requests to a Durable
 * Object.
 * @category Creation
 * @since vNEXT
 */
/// getWsServerDurableObjectEnhancedFetch




