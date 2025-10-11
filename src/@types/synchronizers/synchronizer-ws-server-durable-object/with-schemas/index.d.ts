/// synchronizer-ws-server-durable-object
import {DurableObject} from 'cloudflare:workers';
import type {
  Persister,
  Persists,
} from '../../../persisters/with-schemas/index.d.ts';
import type {
  Id,
  IdAddedOrRemoved,
  Ids,
  OptionalSchemas,
} from '../../../with-schemas/index.d.ts';

/// WsServerDurableObject
export class WsServerDurableObject<
  Schemas extends OptionalSchemas,
  Env = unknown,
> extends DurableObject<Env> {
  /// WsServerDurableObject.constructor
  constructor(ctx: DurableObjectState, env: Env);

  /// WsServerDurableObject.createPersister
  createPersister():
    | Persister<Schemas, Persists.MergeableStoreOnly>
    | Promise<Persister<Schemas, Persists.MergeableStoreOnly>>
    | undefined;

  /// WsServerDurableObject.getPathId
  getPathId(): Id;

  /// WsServerDurableObject.getClientIds
  getClientIds(): Ids;

  /// WsServerDurableObject.onPathId
  onPathId(pathId: Id, addedOrRemoved: IdAddedOrRemoved): void;

  /// WsServerDurableObject.onClientId
  onClientId(pathId: Id, clientId: Id, addedOrRemoved: IdAddedOrRemoved): void;

  /// WsServerDurableObject.onFetch
  onFetch(request: Request, pathId: Id, clientId: Id): void;

  /// WsServerDurableObject.onMessageMutator
  onMessageMutator(
    fromClientId: Id,
    toClientId: Id,
    remainder: string,
    isWrite: boolean,
  ): Promise<boolean | string>;

  /// WsServerDurableObject.onMessage
  onMessage(fromClientId: Id, toClientId: Id, remainder: string): void;
}

/// getWsServerDurableObjectFetch
export function getWsServerDurableObjectFetch<
  Schemas extends OptionalSchemas,
  Namespace extends string,
>(
  namespace: Namespace,
): (
  request: Request,
  env: {
    [namespace in Namespace]: DurableObjectNamespace<
      WsServerDurableObject<Schemas>
    >;
  },
) => Response;
