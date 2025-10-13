/* eslint-disable no-console */
/* eslint-disable no-console */
// No imports required from 'cloudflare:workers';
// types are available globally in Workers environment
import type {Id} from '../../@types/common/index.d.ts';
import type {MergeableStoreEnhanced} from '../../@types/index.d.ts';
import type {
  MergeableChanges,
  MergeableStore,
} from '../../@types/mergeable-store/index.d.ts';
import type {
  Logger,
  LogLevel,
} from '../../@types/synchronizers/synchronizer-ws-server-durable-object-enhanced/index.d.ts';
import {
  checkMergeableChanges,
  filterMergeableChanges,
  processDefaultServerFunctions,
} from '../../common/authorizer.ts';
import {EMPTY_STRING, strMatch} from '../../common/strings.ts';
import type {SchemaDefinition} from '../../expanded-schema/schemaCreator.ts';
import type {AuthContext} from '../../expanded-schema/serverFunctions/authorization.ts';
import {createRawPayload, ifPayloadValid} from '../common.ts';
import {WsServerDurableObject} from '../synchronizer-ws-server-durable-object/index.ts';

const defaultLogger: Logger = (level, message, context) => {
  const prefix = `[WsServerDurableObjectEnhanced] ${message}`;
  const args = context === undefined ? [prefix] : [prefix, context];
  if (level === 'error') {
    console.error(...args);
    return;
  }
  if (level === 'warn') {
    console.warn(...args);
    return;
  }
  if (level === 'info') {
    console.info(...args);
    return;
  }
  (console.debug ?? console.log)(...args);
};

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
  #logger: Logger = defaultLogger;
  store: MergeableStoreEnhanced | MergeableStore | null = null;
  setLogger(logger: Logger | null) {
    this.#logger = logger ?? defaultLogger;
  }

  protected log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ) {
    try {
      this.#logger(level, message, context);
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
  #handleMessage(fromClientId: Id, message: string, fromClient?: WebSocket) {
    ifPayloadValid(message.toString(), async (toClientId, remainder) => {
      // console.log('handleMessage enhanced', {
      //   fromClientId,
      //   message,
      //   fromClient,
      //   toClientId,
      // });
      if (toClientId == EMPTY_STRING) {
        let result: boolean | string = true;
        if (fromClientId != SERVER_CLIENT_ID) {
          result = await this.#sendMessageToServer(
            SERVER_CLIENT_ID,
            fromClientId,
            remainder,
            false,
          );
        }
        if (result !== false) {
          await this.#sendMessageToClients(
            this.#getClients(),
            fromClientId,
            fromClient,
            remainder,
            false,
          );
        }
      } else if (toClientId == SERVER_CLIENT_ID) {
        await this.#sendMessageToServer(
          toClientId,
          fromClientId,
          remainder,
          false,
        );
      } else if (toClientId != fromClientId) {
        await this.#sendMessageToClients(
          [this.#getClients(toClientId)[0]],
          fromClientId,
          fromClient,
          remainder,
          false,
        );
      }
    });
  }
  async #sendMessageToServer(
    toClientId: Id,
    fromClientId: Id,
    remainder: string,
    applyDefaults = true,
  ) {
    const result = await this.onMessageMutator(
      fromClientId,
      toClientId,
      remainder,
      true,
      applyDefaults,
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

  async #sendMessageToClients(
    clients: WebSocket[],
    fromClientId: Id,
    fromClient: WebSocket | null | undefined,
    remainder: string,
    applyDefaults = true,
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
            applyDefaults,
          );
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
        return false; // Block if no auth context
      }

      const [mergeableChanges] = body as [MergeableChanges<true>];
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
        });
      } else {
        this.log('warn', 'Blocked inbound mergeable changes', {
          fromClientId,
          requestId,
          reason: checkResult,
        });
      }

      return checkResult;
    }

    // Message 3: Mergeable content diff broadcast
    if (message === 3) {
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
        });
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
