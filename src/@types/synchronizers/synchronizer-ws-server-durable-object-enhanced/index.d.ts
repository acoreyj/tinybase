/* eslint-disable max-len */
/// synchronizer-ws-server-durable-object-enhanced
import {DurableObject} from 'cloudflare:workers';
import type {
  AuthContext,
  SchemaDefinition,
} from '../../expanded-schema/index.d.ts';
import type {
  Id,
  MergeableStore,
  MergeableStoreEnhanced,
} from '../../index.d.ts';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type Logger = (
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
) => void;
/// WsServerDurableObjectEnhanced
export class WsServerDurableObjectEnhanced<
  Env = unknown,
> extends DurableObject<Env> {
  store: MergeableStoreEnhanced | MergeableStore | null;
  setExpandedSchema(
    expandedSchema: Record<string, SchemaDefinition<any, any>>,
  ): void;
  setServerFunctions(serverFunctions: any): void;
  setGetAuthContext(fn: (clientId: Id) => AuthContext): void;
  getExpandedSchema(): Record<string, SchemaDefinition<any, any>>;
  getServerFunctions(): any;
  getAuthContext(clientId: Id): AuthContext;
  setLogger(logger: Logger | null): void;

  /// WsServerDurableObjectEnhanced.onMessageMutator
  onMessageMutator(
    fromClientId: Id,
    toClientId: Id,
    remainder: string,
    isWrite: boolean,
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
