/* eslint-disable no-console */
/* eslint-disable no-console */
// No imports required from 'cloudflare:workers';
// types are available globally in Workers environment
import type {Id} from '../../@types/common/index.d.ts';
import type {
  IdAddedOrRemoved,
  MergeableStoreEnhanced,
} from '../../@types/index.d.ts';
import type {
  CellStamp,
  MergeableChanges,
  MergeableStore,
  RowStamp,
  TablesStamp,
  TableStamp,
  ValuesStamp,
} from '../../@types/mergeable-store/index.d.ts';
import type {
  Logger,
  LogLevel,
} from '../../@types/synchronizers/synchronizer-ws-server-durable-object-enhanced/index.d.ts';
import {arrayIsEmpty} from '../../common/array.ts';
import {
  checkMergeableChanges,
  filterMergeableChanges,
  processDefaultServerFunctions,
} from '../../common/authorizer.ts';
import {getHlcFunctions} from '../../common/hlc.ts';
import {objValues} from '../../common/obj.ts';
import {ifNotUndefined} from '../../common/other.ts';
import {EMPTY_STRING, strMatch} from '../../common/strings.ts';
import type {SchemaDefinition} from '../../expanded-schema/schemaCreator.ts';
import type {AuthContext} from '../../expanded-schema/serverFunctions/authorization.ts';
import {createPayload, createRawPayload, ifPayloadValid} from '../common.ts';
import {WsServerDurableObject} from '../synchronizer-ws-server-durable-object/index.ts';

const PATH_REGEX = /\/([^?]*)/;
const SERVER_CLIENT_ID = 'S';

const getPathId = (request: Request): Id =>
  strMatch(new URL(request.url).pathname, PATH_REGEX)?.[1] ?? '';

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

export class WsServerDurableObjectEnhanced<
  Env = unknown,
> extends WsServerDurableObject<Env> {
  #expandedSchema: Record<string, SchemaDefinition<any, any>> = {};
  #serverFunctions: any = {authorization: {}};
  #getAuthContextFn: ((clientId: Id) => AuthContext) | null = null;
  #logger: Logger | null = null;
  store: MergeableStoreEnhanced | MergeableStore | null = null;

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
        const token = new URL(request.url).searchParams.get('token') || '';
        this.onClientIdWithToken(pathId, clientId, 1, token);
        this.onFetch(request, pathId, clientId);
        client.send(createPayload(SERVER_CLIENT_ID, null, 1, EMPTY_STRING));
        return createResponse(101, webSocket);
      },
      createUpgradeRequiredResponse,
    ) as Response;
  }

  onClientIdWithToken(
    _pathId: Id,
    _clientId: Id,
    _addedOrRemoved: IdAddedOrRemoved,
    _token: string,
  ) {}
  setLogger(logger: Logger | null) {
    this.#logger = logger ?? null;
  }

  protected log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ) {
    try {
      this.#logger?.(level, message, context);
    } catch {
      // Ignore logging errors to avoid affecting control flow
    }
  }

  setExpandedSchema(
    expandedSchema: Record<string, SchemaDefinition<any, any>>,
  ) {
    this.#expandedSchema = expandedSchema ?? {};
  }

  setServerFunctions(serverFunctions: any) {
    this.#serverFunctions = serverFunctions ?? {authorization: {}};
  }

  setGetAuthContext(fn: (clientId: Id) => AuthContext) {
    this.#getAuthContextFn = fn ?? null;
  }

  getExpandedSchema(): Record<string, SchemaDefinition<any, any>> {
    return this.#expandedSchema;
  }

  getServerFunctions(): any {
    return this.#serverFunctions;
  }

  getAuthContext(clientId: Id): AuthContext {
    return (this.#getAuthContextFn?.(clientId) ??
      null) as unknown as AuthContext;
  }

  handeNotificationMessage(
    clientId: Id,
    requestId: Id,
    userId: string,
    message: string,
    errorType: string,
    reason: string,
  ): MergeableChanges<true> {
    const tableId = `g-user-${userId}-notifications`;

    const [getNextHlc] = getHlcFunctions();
    const hlc = getNextHlc();
    const rowId =
      requestId && requestId !== (EMPTY_STRING as unknown as Id)
        ? `${requestId}`
        : hlc;
    const timestamp = new Date().toISOString();

    const createCellStamp = (value: string): CellStamp<true> => [value, hlc, 0];

    const rowCells: RowStamp<true>[0] = {
      clientId: createCellStamp(clientId),
      requestId: createCellStamp(requestId),
      message: createCellStamp(message),
      errorType: createCellStamp(errorType),
      timestamp: createCellStamp(timestamp),
      reason: createCellStamp(reason),
    };

    const rowStamp: RowStamp<true> = [rowCells, hlc, 0];
    const tableRows: TableStamp<true>[0] = {[rowId]: rowStamp};
    const tableStamp: TableStamp<true> = [tableRows, hlc, 0];
    const tablesObj: TablesStamp<true>[0] = {[tableId]: tableStamp};
    const tablesStamp: TablesStamp<true> = [tablesObj, hlc, 0];
    const valuesStamp: ValuesStamp<true> = [{}, hlc, 0];

    return [tablesStamp, valuesStamp, 1];
  }
  #handleMessage(
    fromClientId: Id,
    message: string,
    fromClient?: WebSocket,
    mutate = true,
  ) {
    ifPayloadValid(message.toString(), async (toClientId, remainder) => {
      console.log('handleMessage enhanced', {
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
            false,
            mutate,
          );
        }
        if (result !== false) {
          await this.#sendMessageToClients(
            this.#getClients(),
            fromClientId,
            fromClient,
            remainder,
            false,
            mutate,
          );
        }
      } else if (toClientId == SERVER_CLIENT_ID) {
        await this.#sendMessageToServer(
          toClientId,
          fromClientId,
          remainder,
          false,
          mutate,
        );
      } else if (toClientId != fromClientId) {
        await this.#sendMessageToClients(
          [this.#getClients(toClientId)[0]],
          fromClientId,
          fromClient,
          remainder,
          false,
          mutate,
        );
      }
    });
  }
  async #sendMessageToServer(
    toClientId: Id,
    fromClientId: Id,
    remainder: string,
    applyDefaults = true,
    mutate = true,
  ) {
    const result = mutate
      ? await this.onMessageMutator(
          fromClientId,
          toClientId,
          remainder,
          true,
          applyDefaults,
        )
      : true;
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
    applyDefaults = true,
    mutate = true,
  ) {
    const sendPromieses = clients
      .map(async (otherClient) => {
        if (otherClient != fromClient) {
          const toClientId = this.ctx.getTags(otherClient)[0];

          const result = mutate
            ? await this.onMessageMutator(
                fromClientId,
                toClientId,
                remainder,
                false,
                applyDefaults,
              )
            : true;
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

  async onMessageMutator(
    fromClientId: Id,
    toClientId: Id,
    remainder: string,
    isWrite: boolean,
    applyDefaults = true,
  ): Promise<boolean | string> {
    const [requestId, message, ...body] = JSON.parse(remainder);
    const requestIdStr = `${requestId ?? ''}` as Id;

    const baseLogContext = {
      fromClientId,
      toClientId,
      requestId,
      messageType: message,
    } as const;
    const authorizerLog = (logMessage: string, data?: unknown) => {
      const context: Record<string, unknown> = {...baseLogContext};
      if (data !== undefined) {
        context.details = data;
      }
      this.log('debug', logMessage, context);
    };

    const notifyBlockedMessage = (
      clientId: Id,
      errorType: string,
      reason: string,
      authContext?: AuthContext,
    ) => {
      this.log('debug', 'Notifying blocked message', {
        clientId,
        errorType,
        reason,
        authContext,
      });
      if (!clientId) {
        return;
      }

      try {
        const userId = authContext?.userId ?? 'guest';
        const changes = this.handeNotificationMessage(
          clientId,
          requestIdStr,
          userId,
          String(message),
          errorType,
          reason,
        );
        this.log('debug', 'Handled notification message', {
          clientId,
          requestId,
          changes: JSON.stringify([requestId + '_notification', 3, changes]),
        });
        this.#handleMessage(
          'notification',
          SERVER_CLIENT_ID +
            '\n' +
            JSON.stringify([requestId + '_notification', 3, changes]),
          undefined,
          false,
        );
        this.#handleMessage(
          'notification',
          clientId +
            '\n' +
            JSON.stringify([requestId + '_notification', 3, changes]),
          undefined,
          false,
        );
      } catch (error) {
        this.log('error', 'Failed to record blocked message notification', {
          requestId,
          errorType,
          clientId,
          error,
        });
      }
    };

    this.log('debug', 'Received message', {
      fromClientId,
      toClientId,
      requestId,
      message,
      isWrite,
      // body: JSON.stringify(body),
    });

    // Message 1: Server sending diffs to a client
    if (message === 1) {
      const authContext = this.getAuthContext(toClientId);
      if (!authContext) {
        this.log('warn', 'Missing auth context for outbound message', {
          requestId,
          toClientId,
        });
        notifyBlockedMessage(
          toClientId,
          'missing_auth_context_outbound',
          'Auth context not available for outbound message',
        );
        return false; // Block if no auth context
      }

      const [mergeableChanges] = body as [MergeableChanges<true>];
      const filteredChanges = filterMergeableChanges(
        mergeableChanges,
        this.getExpandedSchema(),
        this.getServerFunctions(),
        authContext,
        authorizerLog,
      );

      this.log('info', 'Authorized outbound mergeable changes', {
        fromClientId,
        toClientId,
        requestId,
        result: JSON.stringify([requestId, message, filteredChanges]),
        remainder,
      });

      return JSON.stringify([requestId, message, filteredChanges]);
    }

    // Message 2: Client pushing changes to the server
    if (message === 2) {
      const authContext = this.getAuthContext(fromClientId);
      if (!authContext) {
        this.log('warn', 'Missing auth context for inbound message', {
          fromClientId,
          requestId,
        });
        notifyBlockedMessage(
          fromClientId,
          'missing_auth_context_inbound',
          'Auth context not available for inbound message',
        );
        return false; // Block if no auth context
      }

      const [mergeableChanges] = body as [MergeableChanges<true>];
      this.log('debug', 'Checking mergeable changes');
      const checkResult = checkMergeableChanges(
        mergeableChanges,
        this.getExpandedSchema(),
        this.getServerFunctions(),
        authContext,
        authorizerLog,
      );

      if (checkResult === true) {
        this.log('info', 'Authorized inbound mergeable changes', {
          fromClientId,
          requestId,
          message,
        });
      } else {
        this.log('warn', 'Blocked inbound mergeable changes', {
          fromClientId,
          requestId,
          reason: checkResult,
        });
        notifyBlockedMessage(
          fromClientId,
          'unauthorized_inbound_mergeable_changes',
          String(checkResult),
          authContext,
        );
      }

      return checkResult;
    }

    // Message 3: Mergeable content diff broadcast
    if (message === 3 || message === 0) {
      const [mergeableChanges] = body as [
        MergeableChanges<true> | MergeableChanges<false>,
      ];

      if (!isWrite) {
        if (!toClientId) {
          this.log(
            'debug',
            'Broadcasting outbound content diff to all clients',
            {
              requestId,
            },
          );
          return true;
        }

        const authContext = this.getAuthContext(toClientId);
        if (!authContext) {
          this.log('warn', 'Missing auth context for outbound content diff', {
            requestId,
            toClientId,
          });
          notifyBlockedMessage(
            toClientId,
            'missing_auth_context_outbound_content_diff',
            'Auth context not available for outbound content diff',
          );
          return false;
        }

        const filteredChanges = filterMergeableChanges(
          mergeableChanges,
          this.getExpandedSchema(),
          this.getServerFunctions(),
          authContext,
          // authorizerLog,
        );

        this.log('info', 'Authorized outbound content diff', {
          fromClientId,
          toClientId,
          requestId,
        });
        const result = JSON.stringify([requestId, message, filteredChanges]);
        this.log('debug', 'Filtered outbound content diff', {
          requestId,
          message,
          // filteredChanges: JSON.stringify(filteredChanges),
          // body: JSON.stringify(body),
          // return: result,
          // remainder: remainder,
          same: result === remainder,
        });

        return result;
      }

      const authContext = this.getAuthContext(fromClientId);
      if (!authContext) {
        this.log('warn', 'Missing auth context for inbound content diff', {
          fromClientId,
          requestId,
        });
        notifyBlockedMessage(
          fromClientId,
          'missing_auth_context_inbound_content_diff',
          'Auth context not available for inbound content diff',
        );
        return false;
      }

      const isAuthorized = checkMergeableChanges(
        mergeableChanges,
        this.getExpandedSchema(),
        this.getServerFunctions(),
        authContext,
        authorizerLog,
      );

      if (!isAuthorized) {
        this.log('warn', 'Blocked inbound content diff', {
          fromClientId,
          requestId,
          message,
        });
        notifyBlockedMessage(
          fromClientId,
          'unauthorized_inbound_content_diff',
          'Authorization failed for inbound content diff',
          authContext,
        );
        return false;
      }

      this.log('info', 'Authorized inbound content diff', {
        fromClientId,
        requestId,
      });

      if (toClientId && toClientId !== SERVER_CLIENT_ID) {
        const targetAuthContext = this.getAuthContext(toClientId);
        if (!targetAuthContext) {
          this.log('warn', 'Missing auth context for outbound content diff', {
            toClientId,
            requestId,
          });
          notifyBlockedMessage(
            toClientId,
            'missing_auth_context_outbound_content_diff_target',
            'Auth context not available for outbound content diff target',
            targetAuthContext,
          );
          return false;
        }

        const filteredChanges = filterMergeableChanges(
          mergeableChanges,
          this.getExpandedSchema(),
          this.getServerFunctions(),
          targetAuthContext,
          authorizerLog,
        );

        this.log('info', 'Filtered outbound content diff for client', {
          fromClientId,
          toClientId,
          requestId,
        });

        return JSON.stringify([requestId, message, filteredChanges]);
      }
      if (isWrite && this.store && applyDefaults) {
        const [mergeableChanges] = body as [MergeableChanges<true>];
        const defaultChanges = processDefaultServerFunctions(
          mergeableChanges,
          this.getExpandedSchema(),
          this.store,
          this.getServerFunctions(),
        );
        if (
          defaultChanges[0][0] &&
          Object.keys(defaultChanges[0][0]).length > 0
        ) {
          this.#handleMessage(
            'default',
            '\n' +
              JSON.stringify([requestId + '_default', message, defaultChanges]),
            undefined,
            false,
          );
        }
      }

      return true;
    }

    this.log('debug', 'Passing through message without mutation', {
      message,
      requestId,
    });

    return true; // Allow other messages
  }
}

export const getWsServerDurableObjectEnhancedFetch =
  <Namespace extends string>(namespace: Namespace) =>
  (
    request: Request,
    env: {
      [namespace in Namespace]: DurableObjectNamespace<
        WsServerDurableObjectEnhanced<any>
      >;
    },
  ) =>
    getClientId(request)
      ? env[namespace]
          .get(env[namespace].idFromName(getPathId(request)))
          .fetch(request)
      : createUpgradeRequiredResponse();
