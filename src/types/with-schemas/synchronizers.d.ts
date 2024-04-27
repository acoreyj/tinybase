/// synchronizers

import {Content, OptionalSchemas} from './store.d';
import {Id, IdOrNull} from './common.d';
import {MergeableStore} from './mergeable-store.d';
import {Persister} from './persisters.d';

/// MessageType
export type MessageType = number;

/// Receive
export type Receive = (
  fromClientId: Id,
  requestId: Id,
  messageType: MessageType,
  messageBody: any,
) => void;

/// Send
export type Send = (
  toClientId: IdOrNull,
  requestId: Id,
  messageType: MessageType,
  messageBody: any,
) => void;

/// SynchronizerStats
export type SynchronizerStats = {
  sends?: number;
  receives?: number;
};

/// Synchronizer
export interface Synchronizer<Schemas extends OptionalSchemas>
  extends Persister<Schemas, 2> {
  /// Synchronizer.startSync
  startSync(initialContent?: Content<Schemas, true>): Promise<this>;
  /// Synchronizer.stopSync
  stopSync(): this;
  /// Synchronizer.getSynchronizerStats
  getSynchronizerStats(): SynchronizerStats;
}

/// createCustomSynchronizer
export function createCustomSynchronizer<Schemas extends OptionalSchemas>(
  store: MergeableStore<Schemas>,
  send: Send,
  onReceive: (receive: Receive) => void,
  destroy: () => void,
  requestTimeoutSeconds: number,
  onIgnoredError?: (error: any) => void,
): Synchronizer<Schemas>;
