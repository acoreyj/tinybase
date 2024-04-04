/// persister-powersync

import {DatabasePersisterConfig, Persister} from '../persisters';
import {OptionalSchemas, Store} from '../store';
import {AbstractPowerSyncDatabase} from '@journeyapps/powersync-sdk-common';

/// PowerSyncPersister
export interface PowerSyncPersister<Schemas extends OptionalSchemas>
  extends Persister<Schemas> {
  /// PowerSyncPersister.getPowerSync
  getPowerSync(): AbstractPowerSyncDatabase;
}

/// createPowerSyncPersister
export function createPowerSyncPersister<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
  db: AbstractPowerSyncDatabase,
  configOrStoreTableName?: DatabasePersisterConfig<Schemas> | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): PowerSyncPersister<Schemas>;
