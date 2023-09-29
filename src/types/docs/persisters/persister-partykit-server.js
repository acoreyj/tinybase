/**
 * The persister-partykit-server module of the TinyBase project contains the
 * server portion of the PartyKit integration.
 *
 * It contains a class which, when run in a PartyKit server environment, lets
 * you save and load Store data from a client (that is using the complementary
 * persister-partykit-client module) to durable PartyKit cloud storage.
 *
 * This enables synchronization of the same Store across multiple clients in a
 * PartyKit party room.
 *
 * Note that both the client and server parts of this Persister are currently
 * experimental as PartyKit is new and still maturing.
 * @see Persisting Data guide
 * @see Todo App v6 (collaboration) demo
 * @packageDocumentation
 * @module persister-partykit-server
 * @since 4.3.0
 */
/// persister-partykit-server
/**
 * The TinyBasePartyKitServerConfig type describes the configuration of a
 * PartyKit Persister on the server side.
 *
 * The defaults (if used on both the server and client) will work fine, but if
 * you are building more complex PartyKit apps and you need to configure path
 * names, for example, then this is the type to use.
 * @example
 * When set as the config in a TinyBasePartyKitServer, this
 * TinyBasePartyKitServerConfig will expect clients to load and save their JSON
 * serialization from and to an end point in the room called `/my_tinybase`.
 * Note that this would require you to also add the matching storePath setting
 * to the PartyKitPersisterConfig on the client side.
 *
 * It will also store the data in the durable storage with a prefix of
 * 'tinybase_' in case you are worried about colliding with other data stored
 * in the room.
 *
 * ```js yolo
 * export default class extends TinyBasePartyServer {
 *   readonly config: TinyBasePartyKitServerConfig = {
 *     storePath: '/my_tinybase',
 *     storagePrefix: 'tinybase_',
 *   };
 * };
 * ```
 * @category Configuration
 * @since v4.3.9
 */
/// TinyBasePartyKitServerConfig
{
  /**
   * The path used to set and get the whole Store over HTTP(S) on the server.
   * This must match the storePath property of the PartyKitPersisterConfig used
   * on the client. Both default to '/store'.
   */
  /// TinyBasePartyKitServerConfig.storePath
  /**
   * The prefix used before all the keys in the server's durable storage. Use
   * this in case you are worried about the Store data colliding with other data
   * stored in the room. Defaults to an empty string.
   */
  /// TinyBasePartyKitServerConfig.storagePrefix
  /**
   * An object containing the extra HTTP(S) headers returned to the client from
   * this server. This defaults to the following three headers to allow CORS:
   *
   * ```
   * Access-Control-Allow-Origin: *
   * Access-Control-Allow-Methods: *
   * Access-Control-Allow-Headers: *
   * ```
   *
   * If you set this field, it will override the default completely. So, for
   * example, if you add another header but still want the CORS defaults, you
   * will need to explicitly set the Access-Control-Allow headers above again.
   */
  /// TinyBasePartyKitServerConfig.responseHeaders
}
///
/**
 * A TinyBasePartyKitServer is the server component for persisting the Store to
 * durable PartyKit storage, enabling synchronization of the same Store across
 * multiple clients.
 *
 * This extends the PartyKit Server class, which provides a selection of methods
 * you are expected to implement. The TinyBasePartyKitServer implements only two
 * of them, the onMessage method and the onRequest method, as well as the
 * constructor.
 *
 * If you wish to use TinyBasePartyKitServer as a general PartyKit server, you
 * can implement other methods. But you must remember to call the super
 * implementations of those methods to ensure the TinyBase synchronization stays
 * supported in addition to your own custom functionality. The same applies to
 * the constructor if you choose to implement that.
 *
 * ```js
 * // This is your PartyKit server entry point.
 *
 * export default class extends TinyBasePartyServer {
 *   constructor(party) {
 *     super(party);
 *     // custom constructor code
 *   }
 *
 *   async onStart() {
 *     // no need to call super.onStart()
 *     console.log('Server started');
 *   }
 *
 *   async onMessage(message, client) {
 *     await super.onMessage(message, client);
 *     // custom onMessage code
 *   }
 *
 *   async onRequest(request) {
 *     // custom onRequest code, else:
 *     return await super.onRequest(request);
 *   }
 * }
 * ```
 *
 * See the [PartyKit server API
 * documentation](https://docs.partykit.io/reference/partyserver-api/) for
 * more details.
 */
/// TinyBasePartyKitServer
{
  /**
   * The config property is used to optionally configure the server, using an
   * object of the TinyBasePartyKitServerConfig type.
   *
   * See the documentation for that type for more details.
   */
  /// TinyBasePartyKitServer.config
  /**
   * The onMessage method is called when the server receives a message from a
   * client.
   *
   * If you choose to implement additional functionality in this method, you
   * must remember to call the super implementation to ensure the TinyBase
   * synchronization stays supported:
   *
   * ```js
   * export default class extends TinyBasePartyServer {
   *   async onMessage(message, client) {
   *     await super.onMessage(message, client);
   *     // custom onMessage code
   *   }
   * }
   * ```
   *
   * See the [PartyKit server API
   * documentation](https://docs.partykit.io/reference/partyserver-api/) for
   * more details.
   */
  /// TinyBasePartyKitServer.onMessage
  /**
   * The onRequest method is called when a HTTP request is made to the party
   * URL.
   *
   * If you choose to implement additional functionality in this method, you
   * must remember to call the super implementation to ensure the TinyBase
   * synchronization stays supported:
   *
   * ```js
   * export default class extends TinyBasePartyServer {
   *   async onRequest(request) {
   *     // custom onRequest code, else:
   *     return await super.onRequest(request);
   *   }
   * }
   * ```
   *
   * See the [PartyKit server API
   * documentation](https://docs.partykit.io/reference/partyserver-api/) for
   * more details.
   */
  /// TinyBasePartyKitServer.onRequest
}
