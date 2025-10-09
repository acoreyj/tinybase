/// synchronizer-ws-server-durable-object-enhanced
import {DurableObject} from 'cloudflare:workers';
import type {
  AuthContext,
  SchemaDefinition,
} from '../../expanded-schema/index.d.ts';
import type {Id} from '../../index.d.ts';

/// WsServerDurableObjectEnhanced
export class WsServerDurableObjectEnhanced<
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
export function getWsServerDurableObjectEnhancedFetch<Namespace extends string>(
  namespace: Namespace,
): (
  request: Request,
  env: {
    [namespace in Namespace]: DurableObjectNamespace<WsServerDurableObjectEnhanced>;
  },
) => Response;


