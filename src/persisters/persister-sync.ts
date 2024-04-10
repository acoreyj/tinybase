import {
  Bus,
  BusStats,
  Receive,
  Send,
  SyncPersister,
  createLocalBus as createLocalBusDecl,
  createSyncPersister as createSyncPersisterDecl,
} from '../types/persisters/persister-sync';
import {
  ContentDelta,
  MergeableChanges,
  MergeableStore,
} from '../types/mergeable-store';
import {DEBUG, ifNotUndefined, isUndefined, promiseNew} from '../common/other';
import {Id, IdOrNull, Ids} from '../types/common';
import {IdMap, mapGet, mapNew, mapSet} from '../common/map';
import {collDel, collForEach, collSize} from '../common/coll';
import {objMap, objNew} from '../common/obj';
import {EMPTY_STRING} from '../common/strings';
import {PersisterListener} from '../types/persisters';
import {arrayMap} from '../common/array';
import {createCustomPersister} from '../persisters';
import {getHlcFunctions} from '../mergeable-store/hlc';

export const createSyncPersister = ((
  store: MergeableStore,
  bus: Bus,
  requestTimeoutSeconds = 1,
  onIgnoredError?: (error: any) => void,
): SyncPersister => {
  let persisterListener: PersisterListener | undefined;

  const [join] = bus;
  const [getHlc] = getHlcFunctions(store.getId());
  const pendingRequests: IdMap<
    [
      toStoreId: IdOrNull,
      handlePayload: (payload: any, fromStoreId: Id) => void,
    ]
  > = mapNew();

  const receive = (
    requestId: IdOrNull,
    fromStoreId: Id,
    message: string,
    ...parts: any[]
  ) => {
    if (message == EMPTY_STRING) {
      ifNotUndefined(
        mapGet(pendingRequests, requestId),
        ([toStoreId, handlePayload]) =>
          message == EMPTY_STRING &&
          (isUndefined(toStoreId) || toStoreId == fromStoreId)
            ? handlePayload(parts[0], fromStoreId)
            : 0,
      );
    } else if (message == 'contentHashes') {
      persister.isAutoLoading()
        ? getChangesFromOtherStore(fromStoreId, true).then((changes: any) =>
            persisterListener?.(undefined, () => changes),
          )
        : 0;
    } else {
      const responsePayload =
        (message == 'getContentDelta' && persister.isAutoSaving()) ||
        message == 'getContentDelta!'
          ? store.getMergeableContentDelta(parts[0])
          : message == 'getTablesDelta'
            ? store.getMergeableTablesDelta(parts[0])
            : message == 'getTableDelta'
              ? store.getMergeableTableDelta(parts[0])
              : message == 'getRowDeltaIds'
                ? objMap(parts[0], (tableHashes: any, tableId: Id) =>
                    objMap(tableHashes, (rowHashes: any, rowId) =>
                      store.getMergeableRowDeltaIds(tableId, rowId, rowHashes),
                    ),
                  )
                : message == 'getValuesDeltaIds'
                  ? store.getMergeableValuesDeltaIds(parts[0])
                  : message == 'getMergeableContentAsChanges'
                    ? store.getMergeableContentAsChanges(parts[0])
                    : 0;
      responsePayload === 0
        ? 0
        : send(requestId, fromStoreId, EMPTY_STRING, responsePayload);
    }
  };

  const [send] = join(store.getId(), receive);

  const request = async <Payload>(
    toStoreId: IdOrNull,
    message: string,
    ...parts: any[]
  ): Promise<[payload: Payload, fromStoreId: Id]> =>
    promiseNew((resolve, reject) => {
      const requestId = getHlc();
      const timeout = setTimeout(() => {
        collDel(pendingRequests, requestId);
        reject(`No response from ${toStoreId ?? 'anyone'} to '${message}'`);
      }, requestTimeoutSeconds * 1000);
      mapSet(pendingRequests, requestId, [
        toStoreId,
        (payload: any, fromStoreId: Id) => {
          clearTimeout(timeout);
          collDel(pendingRequests, requestId);
          resolve([payload, fromStoreId]);
        },
      ]);
      send(requestId, toStoreId, message, ...parts);
    });

  const getChangesFromOtherStore = async (
    knownOtherStoreId: IdOrNull = null,
    forceOtherToSave = false,
  ): Promise<MergeableChanges> => {
    const [contentDelta, otherStoreId] = await request<ContentDelta>(
      knownOtherStoreId,
      'getContentDelta' + (forceOtherToSave ? '!' : ''),
      store.getMergeableContentHashes(),
    );

    const contentSelectors = [{}, []];

    if (!isUndefined(contentDelta)) {
      const [_, [tablesHash, valuesHash]] = contentDelta;

      if (!isUndefined(tablesHash)) {
        const [deltaTableIds] = await request<Ids>(
          otherStoreId,
          'getTablesDelta',
          store.getMergeableTablesHashes(),
        );

        const [deltaRowIds] = await request<{[tableId: Id]: Ids}>(
          otherStoreId,
          'getTableDelta',
          store.getMergeableTableHashes(deltaTableIds),
        );

        const [deltaCellIds] = await request<{
          [tableId: Id]: {[rowId: Id]: Ids};
        }>(
          otherStoreId,
          'getRowDeltaIds',
          objMap(deltaRowIds, (rowIds, tableId) =>
            objNew(
              arrayMap(rowIds, (rowId) => [
                rowId,
                store.getMergeableRowHashes(tableId, rowId),
              ]),
            ),
          ),
        );
        contentSelectors[0] = deltaCellIds;
      }

      if (!isUndefined(valuesHash)) {
        contentSelectors[1] = (
          await request<Ids>(
            otherStoreId,
            'getValuesDeltaIds',
            store.getMergeableValuesHashes(),
          )
        )[0];
      }
    }

    const [changes] = await request<MergeableChanges>(
      otherStoreId,
      'getMergeableContentAsChanges',
      contentSelectors,
    );

    return changes;
  };

  const getPersisted = async (): Promise<any> => {
    const changes = await getChangesFromOtherStore();
    return changes[0] != EMPTY_STRING ? changes : undefined;
  };

  const setPersisted = async (): Promise<void> => {
    send(null, null, 'contentHashes', store.getMergeableContentHashes());
  };

  const addPersisterListener = (listener: PersisterListener) =>
    (persisterListener = listener);

  const delPersisterListener = () => (persisterListener = undefined);

  const persister = createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    true,
    {
      getBus: () => bus,
      startSync: async () =>
        await (await persister.startAutoLoad()).startAutoSave(),
      stopSync: () => persister.destroy,
    },
  ) as SyncPersister;
  return persister;
}) as typeof createSyncPersisterDecl;

export const createLocalBus = (() => {
  let sends = 0;
  let receives = 0;
  const stores: IdMap<Receive> = mapNew();
  return [
    (storeId: Id, receive: Receive): [Send, () => void] => {
      mapSet(stores, storeId, receive);
      const send = (
        requestId: IdOrNull,
        toStoreId: IdOrNull,
        message: string,
        ...parts: any[]
      ): void => {
        if (DEBUG) {
          sends++;
          receives += isUndefined(toStoreId) ? collSize(stores) - 1 : 1;
        }
        isUndefined(toStoreId)
          ? collForEach(stores, (receive, otherStoreId) =>
              otherStoreId != storeId
                ? receive(requestId, storeId, message, ...parts)
                : 0,
            )
          : mapGet(stores, toStoreId)?.(requestId, storeId, message, ...parts);
      };
      const leave = (): void => {
        collDel(stores, storeId);
      };
      return [send, leave];
    },
    (): BusStats => (DEBUG ? {sends, receives} : {}),
  ];
}) as typeof createLocalBusDecl;
