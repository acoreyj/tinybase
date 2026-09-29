import type {Id} from '../../@types/common/index.d.ts';
import type {IdAddedOrRemoved} from '../../@types/index.d.ts';
import type {
  Logger,
  LogLevel,
} from '../../@types/synchronizers/synchronizer-ws-server-durable-object-enhanced/index.d.ts';
import type {SchemaDefinition} from '../../expanded-schema/schemaCreator.ts';
import {
  type AuthContext,
  WsServerDurableObject,
  getClientId,
  getPathId,
  createUpgradeRequiredResponse,
} from '../synchronizer-ws-server-durable-object/index.ts';

export class WsServerDurableObjectEnhanced<
  Env = unknown,
> extends WsServerDurableObject<Env> {
  #expandedSchema: Record<string, SchemaDefinition<any, any>> = {};
  #serverFunctions: any = {authorization: {}};
  #getAuthContextFn: ((clientId: Id) => AuthContext) | null = null;
  #logger: Logger | null = null;

  override onFetch(request: Request, pathId: Id, clientId: Id) {
    super.onFetch(request, pathId, clientId);
    const token = new URL(request.url).searchParams.get('token') || '';
    this.onClientIdWithToken(pathId, clientId, 1, token);
  }

  override async onAuthenticate(
    request: Request,
    pathId: Id,
  ): Promise<AuthContext | boolean | null | Response> {
    const clientId = getClientId(request);
    if (this.#getAuthContextFn && clientId) {
      const auth = this.#getAuthContextFn(clientId);
      if (auth) {
        return auth;
      }
    }
    return super.onAuthenticate(request, pathId);
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

  override onMessageMutator(
    fromClientId: Id,
    toClientId: Id,
    remainder: string,
    isWrite: boolean,
  ): boolean | string {
    if (this.#logger) {
      try {
        const [requestId, message] = JSON.parse(remainder) as [Id, number];
        this.log('debug', 'Received message', {
          fromClientId,
          toClientId,
          requestId,
          messageType: message,
          isWrite,
        });
      } catch {
        // Ignore parse error
      }
    }
    return true;
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
  ): Promise<Response> | Response =>
    getClientId(request)
      ? env[namespace]
          .get(env[namespace].idFromName(getPathId(request)))
          .fetch(request)
      : createUpgradeRequiredResponse();
