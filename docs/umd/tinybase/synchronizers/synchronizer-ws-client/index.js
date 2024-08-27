(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports)
    : typeof define === 'function' && define.amd
      ? define(['exports'], factory)
      : ((global =
          typeof globalThis !== 'undefined' ? globalThis : global || self),
        factory((global.TinyBaseSynchronizerWsClient = {})));
})(this, function (exports) {
  'use strict';

  const EMPTY_STRING = '';
  const UTF8 = 'utf8';
  const UNDEFINED = '\uFFFC';

  const promise = Promise;
  const GLOBAL = globalThis;
  const math = Math;
  const mathFloor = math.floor;
  const isUndefined = (thing) => thing == void 0;
  const ifNotUndefined = (value, then, otherwise) =>
    isUndefined(value) ? otherwise?.() : then(value);
  const isArray = (thing) => Array.isArray(thing);
  const slice = (arrayOrString, start, end) => arrayOrString.slice(start, end);
  const size = (arrayOrString) => arrayOrString.length;
  const promiseNew = (resolver) => new promise(resolver);
  const errorNew = (message) => {
    throw new Error(message);
  };

  const arrayForEach = (array, cb) => array.forEach(cb);
  const arrayMap = (array, cb) => array.map(cb);
  const arrayReduce = (array, cb, initial) => array.reduce(cb, initial);
  const arrayClear = (array, to) => array.splice(0, to);
  const arrayPush = (array, ...values) => array.push(...values);
  const arrayShift = (array) => array.shift();

  const object = Object;
  const getPrototypeOf = (obj) => object.getPrototypeOf(obj);
  const objEntries = object.entries;
  const isObject = (obj) =>
    !isUndefined(obj) &&
    ifNotUndefined(
      getPrototypeOf(obj),
      (objPrototype) =>
        objPrototype == object.prototype ||
        isUndefined(getPrototypeOf(objPrototype)),

      /* istanbul ignore next */
      () => true,
    );
  const objIds = object.keys;
  const objFreeze = object.freeze;
  const objNew = (entries = []) => object.fromEntries(entries);
  const objHas = (obj, id) => id in obj;
  const objForEach = (obj, cb) =>
    arrayForEach(objEntries(obj), ([id, value]) => cb(value, id));
  const objSize = (obj) => size(objIds(obj));
  const objIsEmpty = (obj) => isObject(obj) && objSize(obj) == 0;
  const objEnsure = (obj, id, getDefaultValue) => {
    if (!objHas(obj, id)) {
      obj[id] = getDefaultValue();
    }
    return obj[id];
  };

  const jsonString = JSON.stringify;
  const jsonParse = JSON.parse;
  const jsonStringWithUndefined = (obj) =>
    jsonString(obj, (_key, value) => (value === void 0 ? UNDEFINED : value));
  const jsonParseWithUndefined = (str) =>
    jsonParse(str, (_key, value) => (value === UNDEFINED ? void 0 : value));

  const MESSAGE_SEPARATOR = '\n';
  const ifPayloadValid = (payload, then) => {
    const splitAt = payload.indexOf(MESSAGE_SEPARATOR);
    if (splitAt !== -1) {
      then(slice(payload, 0, splitAt), slice(payload, splitAt + 1));
    }
  };
  const receivePayload = (payload, receive) =>
    ifPayloadValid(payload, (fromClientId, remainder) =>
      receive(fromClientId, ...jsonParseWithUndefined(remainder)),
    );
  const createPayload = (toClientId, ...args) =>
    createRawPayload(toClientId ?? EMPTY_STRING, jsonStringWithUndefined(args));
  const createRawPayload = (toClientId, remainder) =>
    toClientId + MESSAGE_SEPARATOR + remainder;

  const collHas = (coll, keyOrValue) => coll?.has(keyOrValue) ?? false;
  const collDel = (coll, keyOrValue) => coll?.delete(keyOrValue);

  const mapNew = (entries) => new Map(entries);
  const mapGet = (map, key) => map?.get(key);
  const mapSet = (map, key, value) =>
    isUndefined(value) ? (collDel(map, key), map) : map?.set(key, value);
  const mapEnsure = (map, key, getDefaultValue, hadExistingValue) => {
    if (!collHas(map, key)) {
      mapSet(map, key, getDefaultValue());
    }
    return mapGet(map, key);
  };

  new GLOBAL.TextEncoder();

  const newStamp = (value, time) => (time ? [value, time] : [value]);
  const getLatestTime = (time1, time2) =>
    /* istanbul ignore next */
    ((time1 ?? '') > (time2 ?? '') ? time1 : time2) ?? '';
  const stampNewObj = (time = EMPTY_STRING) => newStamp(objNew(), time);

  const scheduleRunning = mapNew();
  const scheduleActions = mapNew();
  const getStoreFunctions = (persist = 1 /* StoreOnly */, store) =>
    persist != 1 /* StoreOnly */ && store.isMergeable()
      ? [
          1,
          store.getMergeableContent,
          store.getTransactionMergeableChanges,
          ([[changedTables], [changedValues]]) =>
            !objIsEmpty(changedTables) || !objIsEmpty(changedValues),
          store.setDefaultContent,
        ]
      : persist != 2 /* MergeableStoreOnly */
        ? [
            0,
            store.getContent,
            store.getTransactionChanges,
            ([changedTables, changedValues]) =>
              !objIsEmpty(changedTables) || !objIsEmpty(changedValues),
            store.setContent,
          ]
        : errorNew('Store type not supported by this Persister');
  const createCustomPersister = (
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    persist,
    extra = {},
    scheduleId = [],
  ) => {
    let loadSave = 0;
    let loads = 0;
    let saves = 0;
    let action;
    let autoLoadHandle;
    let autoSaveListenerId;
    mapEnsure(scheduleRunning, scheduleId, () => 0);
    mapEnsure(scheduleActions, scheduleId, () => []);
    const [
      isMergeableStore,
      getContent,
      getChanges,
      hasChanges,
      setDefaultContent,
    ] = getStoreFunctions(persist, store);
    const run = async () => {
      /* istanbul ignore else */
      if (!mapGet(scheduleRunning, scheduleId)) {
        mapSet(scheduleRunning, scheduleId, 1);
        while (
          !isUndefined(
            (action = arrayShift(mapGet(scheduleActions, scheduleId))),
          )
        ) {
          try {
            await action();
          } catch (error) {
            /* istanbul ignore next */
            onIgnoredError?.(error);
          }
        }
        mapSet(scheduleRunning, scheduleId, 0);
      }
    };
    const setContentOrChanges = (contentOrChanges) => {
      (isMergeableStore && isArray(contentOrChanges?.[0])
        ? contentOrChanges?.[2] === 1
          ? store.applyMergeableChanges
          : store.setMergeableContent
        : contentOrChanges?.[2] === 1
          ? store.applyChanges
          : store.setContent)(contentOrChanges);
    };
    const load = async (initialContent) => {
      /* istanbul ignore else */
      if (loadSave != 2) {
        loadSave = 1;
        loads++;
        await schedule(async () => {
          try {
            const content = await getPersisted();
            if (isArray(content)) {
              setContentOrChanges(content);
            } else {
              errorNew(`Content is not an array ${content}`);
            }
          } catch (error) {
            onIgnoredError?.(error);
            if (initialContent) {
              setDefaultContent(initialContent);
            }
          }
          loadSave = 0;
        });
      }
      return persister;
    };
    const startAutoLoad = async (initialContent) => {
      await stopAutoLoad().load(initialContent);
      try {
        autoLoadHandle = await addPersisterListener(
          async (content, changes) => {
            if (changes || content) {
              /* istanbul ignore else */
              if (loadSave != 2) {
                loadSave = 1;
                loads++;
                setContentOrChanges(changes ?? content);
                loadSave = 0;
              }
            } else {
              await load();
            }
          },
        );
      } catch (error) {
        /* istanbul ignore next */
        onIgnoredError?.(error);
      }
      return persister;
    };
    const stopAutoLoad = () => {
      if (autoLoadHandle) {
        delPersisterListener(autoLoadHandle);
        autoLoadHandle = void 0;
      }
      return persister;
    };
    const isAutoLoading = () => !isUndefined(autoLoadHandle);
    const save = async (changes) => {
      /* istanbul ignore else */
      if (loadSave != 1) {
        loadSave = 2;
        saves++;
        await schedule(async () => {
          try {
            await setPersisted(getContent, changes);
          } catch (error) {
            /* istanbul ignore next */
            onIgnoredError?.(error);
          }
          loadSave = 0;
        });
      }
      return persister;
    };
    const startAutoSave = async () => {
      await stopAutoSave().save();
      autoSaveListenerId = store.addDidFinishTransactionListener(() => {
        const changes = getChanges();
        if (hasChanges(changes)) {
          save(changes);
        }
      });
      return persister;
    };
    const stopAutoSave = () => {
      ifNotUndefined(autoSaveListenerId, store.delListener);
      autoSaveListenerId = void 0;
      return persister;
    };
    const isAutoSaving = () => !isUndefined(autoSaveListenerId);
    const schedule = async (...actions) => {
      arrayPush(mapGet(scheduleActions, scheduleId), ...actions);
      await run();
      return persister;
    };
    const getStore = () => store;
    const destroy = () => {
      arrayClear(mapGet(scheduleActions, scheduleId));
      return stopAutoLoad().stopAutoSave();
    };
    const getStats = () => ({loads, saves});
    const persister = {
      load,
      startAutoLoad,
      stopAutoLoad,
      isAutoLoading,
      save,
      startAutoSave,
      stopAutoSave,
      isAutoSaving,
      schedule,
      getStore,
      destroy,
      getStats,
      ...extra,
    };
    return objFreeze(persister);
  };

  const MASK6 = 63;
  const ENCODE =
    '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz'.split(
      EMPTY_STRING,
    );
  mapNew(arrayMap(ENCODE, (char, index) => [char, index]));
  const encode = (num) => ENCODE[num & MASK6];

  const getRandomValues = GLOBAL.crypto
    ? (array) => GLOBAL.crypto.getRandomValues(array)
    : /* istanbul ignore next */
      (array) => arrayMap(array, () => mathFloor(math.random() * 256));
  const getUniqueId = (length = 16) =>
    arrayReduce(
      getRandomValues(new Uint8Array(length)),
      (uniqueId, number) => uniqueId + encode(number),
      '',
    );

  const createCustomSynchronizer = (
    store,
    send,
    registerReceive,
    destroyImpl,
    requestTimeoutSeconds,
    onSend,
    onReceive,
    onIgnoredError,
    extra = {},
  ) => {
    let persisterListener;
    let sends = 0;
    let receives = 0;
    const pendingRequests = mapNew();
    const sendImpl = (toClientId, requestId, message, body) => {
      sends++;
      onSend?.(toClientId, requestId, message, body);
      send(toClientId, requestId, message, body);
    };
    const request = async (toClientId, message, body = EMPTY_STRING) =>
      promiseNew((resolve, reject) => {
        const requestId = getUniqueId();
        const timeout = setTimeout(() => {
          collDel(pendingRequests, requestId);
          reject(
            `No response from ${toClientId ?? 'anyone'} to ${requestId}, ` +
              message,
          );
        }, requestTimeoutSeconds * 1e3);
        mapSet(pendingRequests, requestId, [
          toClientId,
          (response, fromClientId) => {
            clearTimeout(timeout);
            collDel(pendingRequests, requestId);
            resolve([response, fromClientId]);
          },
        ]);
        sendImpl(toClientId, requestId, message, body);
      });
    const mergeTablesStamps = (tablesStamp, [tableStamps2, tablesTime2]) => {
      objForEach(tableStamps2, ([rowStamps2, tableTime2], tableId) => {
        const tableStamp = objEnsure(tablesStamp[0], tableId, stampNewObj);
        objForEach(rowStamps2, ([cellStamps2, rowTime2], rowId) => {
          const rowStamp = objEnsure(tableStamp[0], rowId, stampNewObj);
          objForEach(
            cellStamps2,
            ([cell2, cellTime2], cellId) =>
              (rowStamp[0][cellId] = newStamp(cell2, cellTime2)),
          );
          rowStamp[1] = getLatestTime(rowStamp[1], rowTime2);
        });
        tableStamp[1] = getLatestTime(tableStamp[1], tableTime2);
      });
      tablesStamp[1] = getLatestTime(tablesStamp[1], tablesTime2);
    };
    const getChangesFromOtherStore = async (
      otherClientId = null,
      otherContentHashes,
    ) => {
      if (isUndefined(otherContentHashes)) {
        [otherContentHashes, otherClientId] = await request(
          otherClientId,
          1 /* GetContentHashes */,
        );
      }
      const [otherTablesHash, otherValuesHash] = otherContentHashes;
      const [tablesHash, valuesHash] = store.getMergeableContentHashes();
      let tablesChanges = stampNewObj();
      if (tablesHash != otherTablesHash) {
        const [newTables, differentTableHashes] = (
          await request(
            otherClientId,
            4 /* GetTableDiff */,
            store.getMergeableTableHashes(),
          )
        )[0];
        tablesChanges = newTables;
        if (!objIsEmpty(differentTableHashes)) {
          const [newRows, differentRowHashes] = (
            await request(
              otherClientId,
              5 /* GetRowDiff */,
              store.getMergeableRowHashes(differentTableHashes),
            )
          )[0];
          mergeTablesStamps(tablesChanges, newRows);
          if (!objIsEmpty(differentRowHashes)) {
            const newCells = (
              await request(
                otherClientId,
                6 /* GetCellDiff */,
                store.getMergeableCellHashes(differentRowHashes),
              )
            )[0];
            mergeTablesStamps(tablesChanges, newCells);
          }
        }
      }
      return [
        tablesChanges,
        valuesHash == otherValuesHash
          ? stampNewObj()
          : (
              await request(
                otherClientId,
                7 /* GetValueDiff */,
                store.getMergeableValueHashes(),
              )
            )[0],
        1,
      ];
    };
    const getPersisted = async () => {
      const changes = await getChangesFromOtherStore();
      return !objIsEmpty(changes[0][0]) || !objIsEmpty(changes[1][0])
        ? changes
        : void 0;
    };
    const setPersisted = async (_getContent, changes) =>
      changes
        ? sendImpl(null, null, 3 /* ContentDiff */, changes)
        : sendImpl(
            null,
            null,
            2 /* ContentHashes */,
            store.getMergeableContentHashes(),
          );
    const addPersisterListener = (listener) => (persisterListener = listener);
    const delPersisterListener = () => (persisterListener = void 0);
    const startSync = async (initialContent) =>
      await (await persister.startAutoLoad(initialContent)).startAutoSave();
    const stopSync = () => persister.stopAutoLoad().stopAutoSave();
    const destroy = () => {
      destroyImpl();
      return persister.stopSync();
    };
    const getSynchronizerStats = () => ({sends, receives});
    const persister = createCustomPersister(
      store,
      getPersisted,
      setPersisted,
      addPersisterListener,
      delPersisterListener,
      onIgnoredError,
      2,
      // MergeableStoreOnly
      {startSync, stopSync, destroy, getSynchronizerStats, ...extra},
    );
    registerReceive((fromClientId, requestId, message, body) => {
      receives++;
      onReceive?.(fromClientId, requestId, message, body);
      if (message == 0 /* Response */) {
        ifNotUndefined(
          mapGet(pendingRequests, requestId),
          ([toClientId, handleResponse]) =>
            isUndefined(toClientId) || toClientId == fromClientId
              ? handleResponse(body, fromClientId)
              : /* istanbul ignore next */
                0,
        );
      } else if (
        message == 2 /* ContentHashes */ &&
        persister.isAutoLoading()
      ) {
        getChangesFromOtherStore(fromClientId, body).then((changes) => {
          persisterListener?.(void 0, changes);
        });
      } else if (message == 3 /* ContentDiff */ && persister.isAutoLoading()) {
        persisterListener?.(void 0, body);
      } else {
        ifNotUndefined(
          message == 1 /* GetContentHashes */ && persister.isAutoSaving()
            ? store.getMergeableContentHashes()
            : message == 4 /* GetTableDiff */
              ? store.getMergeableTableDiff(body)
              : message == 5 /* GetRowDiff */
                ? store.getMergeableRowDiff(body)
                : message == 6 /* GetCellDiff */
                  ? store.getMergeableCellDiff(body)
                  : message == 7 /* GetValueDiff */
                    ? store.getMergeableValueDiff(body)
                    : void 0,
          (response) => {
            sendImpl(fromClientId, requestId, 0 /* Response */, response);
          },
        );
      }
    });
    return persister;
  };

  const createWsSynchronizer = async (
    store,
    webSocket,
    requestTimeoutSeconds = 1,
    onSend,
    onReceive,
    onIgnoredError,
  ) => {
    const addEventListener = (event, handler) =>
      webSocket.addEventListener(event, handler);
    const registerReceive = (receive) =>
      addEventListener('message', ({data}) =>
        receivePayload(data.toString(UTF8), receive),
      );
    const send = (toClientId, ...args) =>
      webSocket.send(createPayload(toClientId, ...args));
    const destroy = () => {
      webSocket.close();
    };
    const synchronizer = createCustomSynchronizer(
      store,
      send,
      registerReceive,
      destroy,
      requestTimeoutSeconds,
      onSend,
      onReceive,
      onIgnoredError,
      {getWebSocket: () => webSocket},
    );
    return promiseNew((resolve, reject) => {
      if (webSocket.readyState != webSocket.OPEN) {
        addEventListener('error', reject);
        addEventListener('open', () => resolve(synchronizer));
      } else {
        resolve(synchronizer);
      }
    });
  };

  exports.createWsSynchronizer = createWsSynchronizer;
});
