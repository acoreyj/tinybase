import {DurableObject} from 'cloudflare:workers';
import type {Id, Ids} from '../../@types/common/index.d.ts';
import type {Persister, Persists} from '../../@types/persisters/index.d.ts';
import type {IdAddedOrRemoved} from '../../@types/store/index.d.ts';
import type {Receive} from '../../@types/synchronizers/index.d.ts';
import {arrayIsEmpty, arrayMap} from '../../common/array.ts';
import {objValues} from '../../common/obj.ts';
import {ifNotUndefined, noop, size, startTimeout} from '../../common/other.ts';
import {EMPTY_STRING, strMatch} from '../../common/strings.ts';
import {
  createPayload,
  createRawPayload,
  ifPayloadValid,
  receivePayload,
} from '../common.ts';
import {createCustomSynchronizer} from '../index.ts';

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
): Response => new Response(body, {status, webSocket});

const createUpgradeRequiredResponse = (): Response =>
  createResponse(426, null, 'Upgrade required');

export class WsServerDurableObject<Env = unknown>
  extends DurableObject<Env>
  implements DurableObject<Env>
{
  // @ts-expect-error See blockConcurrencyWhile
  serverClientSend: (payload: string) => void;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.ctx.blockConcurrencyWhile(
      async () =>
        await ifNotUndefined(
          await this.createPersister(),
          async (persister) => {
            const synchronizer = createCustomSynchronizer(
              persister.getStore(),
              (toClientId, requestId, message, body) =>
                this.#handleMessage(
                  SERVER_CLIENT_ID,
                  createPayload(toClientId, requestId, message, body),
                ),
              (receive: Receive) => {
                console.log('receive', receive);
                this.serverClientSend = (payload: string) => {
                  console.log('serverClientSend', {
                    payload,
                  });
                  receivePayload(payload, receive);
                };
              },
              noop,
              1,
            );
            await persister.load();
            await persister.startAutoSave();
            // startSync needs other events to arrive, so execute after block.
            startTimeout(synchronizer.startSync);
          },
        ),
    );
  }

  fetch(request: Request): Response {
    const pathId = getPathId(request);
    return ifNotUndefined(
      getClientId(request),
      (clientId) => {
        const [webSocket, client] = objValues(new WebSocketPair());
        if (arrayIsEmpty(this.#getClients())) {
          this.onPathId(pathId, 1);
        }
        this.ctx.acceptWebSocket(client, [clientId, pathId]);
        this.onClientId(pathId, clientId, 1);
        this.onFetch(request, pathId, clientId);
        client.send(createPayload(SERVER_CLIENT_ID, null, 1, EMPTY_STRING));
        return createResponse(101, webSocket);
      },
      createUpgradeRequiredResponse,
    ) as Response;
  }

  webSocketMessage(client: WebSocket, message: ArrayBuffer | string) {
    ifNotUndefined(this.ctx.getTags(client)[0], (clientId) =>
      this.#handleMessage(clientId, message.toString(), client),
    );
  }

  webSocketClose(client: WebSocket) {
    const [clientId, pathId] = this.ctx.getTags(client);
    this.onClientId(pathId, clientId, -1);
    if (size(this.#getClients()) == 1) {
      this.onPathId(pathId, -1);
    }
  }

  #handleMessage(fromClientId: Id, message: string, fromClient?: WebSocket) {
    ifPayloadValid(message.toString(), async (toClientId, remainder) => {
      console.log('handleMessage original', {
        fromClientId,
        message,
        fromClient,
        toClientId,
      });
      if (toClientId == EMPTY_STRING) {
        let result: boolean | string = true;
        if (fromClientId != SERVER_CLIENT_ID) {
          result = await this.#sendMessageToServer(
            SERVER_CLIENT_ID,
            fromClientId,
            remainder,
          );
        }
        if (result !== false) {
          await this.#sendMessageToClients(
            this.#getClients(),
            fromClientId,
            fromClient,
            remainder,
          );
        }
      } else if (toClientId == SERVER_CLIENT_ID) {
        await this.#sendMessageToServer(toClientId, fromClientId, remainder);
      } else if (toClientId != fromClientId) {
        await this.#sendMessageToClients(
          [this.#getClients(toClientId)[0]],
          fromClientId,
          fromClient,
          remainder,
        );
      }
    });
  }
  async #sendMessageToServer(
    toClientId: Id,
    fromClientId: Id,
    remainder: string,
  ) {
    const result = await this.onMessageMutator(
      fromClientId,
      toClientId,
      remainder,
      true,
    );
    console.log('sendMessageToServer result', {
      fromClientId,
      toClientId,
      result,
    });
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

  async #sendMessageToClients(
    clients: WebSocket[],
    fromClientId: Id,
    fromClient: WebSocket | null | undefined,
    remainder: string,
  ) {
    const sendPromieses = clients
      .map(async (otherClient) => {
        if (otherClient != fromClient) {
          const toClientId = this.ctx.getTags(otherClient)[0];

          const result = await this.onMessageMutator(
            fromClientId,
            toClientId,
            remainder,
            false,
          );
          console.log('sendMessageToClients result', {
            fromClientId,
            toClientId,
            result,
          });
          if (result !== false) {
            if (typeof result === 'string') {
              remainder = result;
            }
            const forwardedPayload = createRawPayload(fromClientId, remainder);
            this.onMessage(fromClientId, toClientId, remainder);

            return otherClient.send(forwardedPayload);
          }
        }
      })
      .filter(Boolean);
    await Promise.allSettled(sendPromieses);
  }

  #getClients(tag?: Id) {
    return this.ctx.getWebSockets(tag);
  }

  // --

  createPersister():
    | Persister<Persists.MergeableStoreOnly>
    | Promise<Persister<Persists.MergeableStoreOnly>>
    | undefined {
    return undefined;
  }

  getPathId(): Id {
    return this.ctx.getTags(this.#getClients()[0])?.[1];
  }

  getClientIds(): Ids {
    return arrayMap(
      this.#getClients(),
      (client) => this.ctx.getTags(client)[0],
    );
  }

  onPathId(_pathId: Id, _addedOrRemoved: IdAddedOrRemoved) {}

  onClientId(_pathId: Id, _clientId: Id, _addedOrRemoved: IdAddedOrRemoved) {}
  onFetch(_request: Request, _pathId: Id, _clientId: Id) {}

  async onMessageMutator(
    _fromClientId: Id,
    _toClientId: Id,
    _remainder: string,
    _isWrite: boolean,
  ): Promise<boolean | string> {
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
