/* eslint-disable no-console */
/* eslint-disable no-console */
// No imports required from 'cloudflare:workers';
// types are available globally in Workers environment
import type {Id} from '../../@types/common/index.d.ts';
import type {MergeableChanges} from '../../@types/mergeable-store/index.d.ts';
import {
  checkMergeableChanges,
  filterMergeableChanges,
} from '../../common/authorizer.ts';
import {strMatch} from '../../common/strings.ts';
import type {SchemaDefinition} from '../../expanded-schema/schemaCreator.ts';
import type {AuthContext} from '../../expanded-schema/serverFunctions/authorization.ts';
import {WsServerDurableObject} from '../synchronizer-ws-server-durable-object/index.ts';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type Logger = (
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
) => void;

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

  async onMessageMutator(
    fromClientId: Id,
    toClientId: Id,
    remainder: string,
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
      body: JSON.stringify(body),
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

      if (fromClientId === SERVER_CLIENT_ID) {
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
          authorizerLog,
        );

        this.log('info', 'Authorized outbound content diff', {
          fromClientId,
          toClientId,
          requestId,
        });

        return JSON.stringify([requestId, message, filteredChanges]);
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
