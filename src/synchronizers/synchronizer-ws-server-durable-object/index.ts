import {DurableObject} from 'cloudflare:workers';
import type {Id, Ids} from '../../@types/common/index.d.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {Persister, Persists} from '../../@types/persisters/index.d.ts';
import type {IdAddedOrRemoved} from '../../@types/store/index.d.ts';
import type {Receive} from '../../@types/synchronizers/index.d.ts';
import {arrayForEach, arrayMap} from '../../common/array.ts';
import {weakMapNew} from '../../common/map.ts';
import {objValues} from '../../common/obj.ts';
import {
  ifNotUndefined,
  isEmpty,
  noop,
  size,
  startTimeout,
} from '../../common/other.ts';
import {EMPTY_STRING, strMatch} from '../../common/strings.ts';
import {
  type PayloadDecoder,
  createInvalidPayloadHandler,
  createPayload,
  createPayloadDecoder,
  createPayloadReceiver,
  createPayloads,
  createRawPayload,
  ifPayloadValid,
} from '../common.ts';
import {createCustomSynchronizer} from '../index.ts';

export type AuthContext = {
  userId?: string;
  [key: string]: unknown;
};

const PATH_REGEX = /\/([^?]*)/;
const SERVER_CLIENT_ID = 'S';

const getPathId = (request: Request): Id =>
  strMatch(new URL(request.url).pathname, PATH_REGEX)?.[1] ?? EMPTY_STRING;

const getClientId = (request: Request): Id | null =>
  request.headers.get('upgrade')?.toLowerCase() == 'websocket'
    ? request.headers.get('sec-websocket-key')
    : null;

const createResponse = (
  status: number,
  webSocket: WebSocket | null = null,
  body: string | null = null,
): Response => {
  const response = new Response(body, {status, webSocket} as any);
  if (webSocket) {
    Object.defineProperty(response, 'webSocket', {
      value: webSocket,
      configurable: true,
    });
  }
  return response;
};

const createUpgradeRequiredResponse = (): Response =>
  createResponse(426, null, 'Upgrade required');

export class WsServerDurableObject<Env = unknown>
  extends DurableObject<Env>
  implements DurableObject<Env>
{
  // @ts-expect-error See blockConcurrencyWhile
  serverClientSend: (payload: string) => void;
  #payloadDecoders = weakMapNew<WebSocket, PayloadDecoder>();
  store?: MergeableStore;
  persister?: Persister<Persists.MergeableStoreOnly>;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.ctx.blockConcurrencyWhile(
      async () =>
        await ifNotUndefined(
          await this.createPersister(),
          async (persister) => {
            this.persister = persister;
            const store = persister.getStore();
            this.store = store;
            const requestTimeoutSeconds = this.getRequestTimeoutSeconds();
            const synchronizer = createCustomSynchronizer(
              store,
              (toClientId, requestId, message, body) =>
                arrayForEach(
                  createPayloads(
                    toClientId,
                    requestId,
                    message,
                    body,
                    this.getFragmentSize(),
                  ),
                  (payload) => this.handleMessage(SERVER_CLIENT_ID, payload),
                ),
              (receive: Receive) =>
                (this.serverClientSend = createPayloadReceiver(
                  receive,
                  requestTimeoutSeconds,
                )[0]),
              noop,
              requestTimeoutSeconds,
            );
            await persister.load();
            await persister.startAutoSave();
            // startSync needs other events to arrive, so execute after block.
            startTimeout(synchronizer.startSync);
          },
        ),
    );
  }

  async fetch(request: Request): Promise<Response> {
    const clientId = getClientId(request);
    if (clientId == null) {
      return createUpgradeRequiredResponse();
    }
    const pathId = getPathId(request);
    const auth = await this.onAuthenticate(request, pathId);
    if (auth instanceof Response) {
      return auth;
    }
    if (auth === false || auth === null) {
      return createResponse(401, null, 'Unauthorized');
    }
    const userId =
      typeof auth === 'object' && auth && 'userId' in auth && auth.userId
        ? String(auth.userId)
        : undefined;

    const [webSocket, client] = objValues(new WebSocketPair());
    if (isEmpty(this.getClients())) {
      this.onPathId(pathId, 1);
    }
    const tags = [clientId, pathId];
    if (userId) {
      tags.push(userId);
    }
    this.ctx.acceptWebSocket(client, tags);
    this.onClientId(pathId, clientId, 1);
    this.onFetch(request, pathId, clientId);
    client.send(createPayload(SERVER_CLIENT_ID, null, 1, EMPTY_STRING));
    return createResponse(101, webSocket);
  }

  webSocketMessage(client: WebSocket, message: ArrayBuffer | string) {
    ifNotUndefined(this.ctx.getTags(client)[0], (clientId) => {
      let decode = this.#payloadDecoders.get(client);
      if (!decode) {
        decode = createPayloadDecoder(
          (toClientId, remainders) =>
            arrayForEach(remainders, (remainder) =>
              this.handleMessage(
                clientId,
                createRawPayload(toClientId, remainder),
                client,
              ),
            ),
          this.getRequestTimeoutSeconds(),
          createInvalidPayloadHandler(client, (error) =>
            this.onIgnoredError(error),
          ),
        );
        this.#payloadDecoders.set(client, decode);
      }
      decode[0](message.toString());
    });
  }

  webSocketClose(client: WebSocket) {
    this.#payloadDecoders.get(client)?.[1]();
    this.#payloadDecoders.delete(client);
    const [clientId, pathId] = this.ctx.getTags(client);
    this.onClientId(pathId, clientId, -1);
    if (size(this.getClients()) == 1) {
      this.onPathId(pathId, -1);
    }
  }

  handleMessage(fromClientId: Id, message: string, fromClient?: WebSocket) {
    ifPayloadValid(message.toString(), (toClientId, remainder) => {
      this.sendMessage(fromClientId, toClientId, remainder, fromClient);
    });
  }

  sendMessage(
    fromClientId: Id,
    toClientId: Id,
    remainder: string,
    fromClient?: WebSocket,
  ) {
    if (toClientId == EMPTY_STRING) {
      let result: boolean | string = true;
      if (fromClientId != SERVER_CLIENT_ID) {
        result = this.sendMessageToServer(
          SERVER_CLIENT_ID,
          fromClientId,
          remainder,
        );
      }
      if (result !== false) {
        this.sendMessageToClients(
          this.getClients(),
          fromClientId,
          fromClient,
          remainder,
        );
      }
    } else if (toClientId == SERVER_CLIENT_ID) {
      this.sendMessageToServer(toClientId, fromClientId, remainder);
    } else if (toClientId != fromClientId) {
      this.sendMessageToClients(
        this.getClients(toClientId),
        fromClientId,
        fromClient,
        remainder,
      );
    }
  }

  sendMessageToServer(toClientId: Id, fromClientId: Id, remainder: string) {
    const result = this.onMessageMutator(
      fromClientId,
      toClientId,
      remainder,
      true,
    );
    if (result !== false) {
      if (typeof result === 'string') {
        remainder = result;
      }
      const forwardedPayload = createRawPayload(fromClientId, remainder);
      this.onMessage(fromClientId, toClientId, remainder);
      this.serverClientSend?.(forwardedPayload);
    }
    return result;
  }

  sendMessageToClients(
    clients: WebSocket[],
    fromClientId: Id,
    fromClient: WebSocket | null | undefined,
    remainder: string,
  ) {
    arrayForEach(clients, (otherClient) => {
      if (otherClient != fromClient) {
        const toClientId = this.ctx.getTags(otherClient)[0];

        const result = this.onMessageMutator(
          fromClientId,
          toClientId,
          remainder,
          false,
        );
        if (result !== false) {
          if (typeof result === 'string') {
            remainder = result;
          }
          const forwardedPayload = createRawPayload(fromClientId, remainder);
          this.onMessage(fromClientId, toClientId, remainder);

          otherClient.send(forwardedPayload);
        }
      }
    });
  }

  getClients(tag?: Id): WebSocket[] {
    return this.ctx.getWebSockets(tag);
  }

  getStore(): MergeableStore | undefined {
    return this.store;
  }

  getPersister(): Persister<Persists.MergeableStoreOnly> | undefined {
    return this.persister;
  }

  // --

  createPersister():
    | Persister<Persists.MergeableStoreOnly>
    | Promise<Persister<Persists.MergeableStoreOnly>>
    | undefined {
    return undefined;
  }

  getPathId(): Id {
    return (
      ifNotUndefined(
        this.getClients()[0],
        (client) => this.ctx.getTags(client)?.[1] ?? EMPTY_STRING,
      ) ?? EMPTY_STRING
    );
  }

  getClientIds(): Ids {
    return arrayMap(this.getClients(), (client) => this.ctx.getTags(client)[0]);
  }

  getFragmentSize(): number | undefined {
    return undefined;
  }

  getRequestTimeoutSeconds(): number {
    return 1;
  }

  onIgnoredError(_error: any) {}

  onPathId(_pathId: Id, _addedOrRemoved: IdAddedOrRemoved) {}

  getUserId(client: WebSocket): Id | undefined {
    return this.ctx.getTags(client)?.[2];
  }

  getUserClients(userId: Id): WebSocket[] {
    return this.getClients(userId);
  }

  onAuthenticate(
    _request: Request,
    _pathId: Id,
  ):
    | Promise<AuthContext | boolean | null | Response>
    | AuthContext
    | boolean
    | null
    | Response {
    return true;
  }

  onClientId(_pathId: Id, _clientId: Id, _addedOrRemoved: IdAddedOrRemoved) {}
  onFetch(_request: Request, _pathId: Id, _clientId: Id) {}

  onMessageMutator(
    _fromClientId: Id,
    _toClientId: Id,
    _remainder: string,
    _isWrite: boolean,
  ): boolean | string {
    return true;
  }

  onMessage(_fromClientId: Id, _toClientId: Id, _remainder: string) {}
}

export const getWsServerDurableObjectFetch =
  <Namespace extends string>(namespace: Namespace) =>
  (
    request: Request,
    env: {
      [namespace in Namespace]: DurableObjectNamespace<WsServerDurableObject>;
    },
  ) =>
    getClientId(request)
      ? env[namespace]
          .get(env[namespace].idFromName(getPathId(request)))
          .fetch(request)
      : createUpgradeRequiredResponse();
