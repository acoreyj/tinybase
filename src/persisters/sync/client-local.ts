import {
  Client,
  ClientStats,
  MessageType,
  Receive,
  createLocalClient as createLocalClientDecl,
} from '../../types/persisters/persister-sync';
import {DEBUG, isUndefined} from '../../common/other';
import {Id, IdOrNull} from '../../types/common';
import {IdMap, mapForEach, mapGet, mapNew, mapSet} from '../../common/map';
import {IdObj, objDel, objNew} from '../../common/obj';
import {collDel} from '../../common/coll';

const clients: IdMap<Receive> = mapNew();

const sends: IdObj<number> = objNew();
const receives: IdObj<number> = objNew();

export const createLocalClient = (() => {
  const clientId: Id = '' + Math.random();

  const onReceive = (receive: Receive): void => {
    mapSet(
      clients,
      clientId,
      DEBUG
        ? (...args) => {
            receives[clientId] = (receives[clientId] ?? 0) + 1;
            receive(...args);
          }
        : receive,
    );
  };

  const send = (
    toClientId: IdOrNull,
    requestId: IdOrNull,
    messageType: MessageType,
    messageBody: any,
  ): void => {
    if (DEBUG) {
      sends[clientId] = (sends[clientId] ?? 0) + 1;
    }
    isUndefined(toClientId)
      ? mapForEach(clients, (otherClientId, receive) =>
          otherClientId != clientId
            ? receive(clientId, requestId, messageType, messageBody)
            : 0,
        )
      : mapGet(clients, toClientId)?.(
          clientId,
          requestId,
          messageType,
          messageBody,
        );
  };

  const destroy = (): void => {
    collDel(clients, clientId);
    if (DEBUG) {
      objDel(sends, clientId);
      objDel(receives, clientId);
    }
  };

  const getStats = (): ClientStats =>
    DEBUG
      ? {sends: sends[clientId] ?? 0, receives: receives[clientId] ?? 0}
      : {};

  return {send, onReceive, destroy, getStats} as Client;
}) as typeof createLocalClientDecl;
