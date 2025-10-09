/// synchronizer-ws-server-durable-object-enhanced
import {DurableObject} from 'cloudflare:workers';
import type {
  AuthContext,
  Id,
  OptionalSchemas,
  SchemaDefinition,
} from '../../../with-schemas/index.d.ts';

/// WsServerDurableObjectEnhanced
export class WsServerDurableObjectEnhanced<
  Schemas extends OptionalSchemas,
  Env = unknown,
> extends DurableObject<Env> {
  setExpandedSchema(
    expandedSchema: Record<string, SchemaDefinition<any, any>>,
  ): void;
  setServerFunctions(serverFunctions: any): void;
  setGetAuthContext(fn: (clientId: Id) => AuthContext): void;
  getExpandedSchema(): Record<string, SchemaDefinition<any, any>>;
  getServerFunctions(): any;
  getAuthContext(clientId: Id): AuthContext;

  /// WsServerDurableObjectEnhanced.onMessageMutator
  onMessageMutator(
    fromClientId: Id,
    toClientId: Id,
    remainder: string,
  ): Promise<boolean | string>;
}

/// getWsServerDurableObjectEnhancedFetch
export function getWsServerDurableObjectEnhancedFetch<
  Schemas extends OptionalSchemas,
  Namespace extends string,
>(
  namespace: Namespace,
): (
  request: Request,
  env: {
    [namespace in Namespace]: DurableObjectNamespace<
      WsServerDurableObjectEnhanced<Schemas>
    >;
  },
) => Response;


