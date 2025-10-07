/// persister-durable-object-sql-storage
import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {DpcJson, Persister, Persists} from '../index.d.ts';

/// DpcFragmented
export type DpcFragmented = {
  /// DpcFragmented.mode
  mode: 'fragmented';
  /// DpcFragmented.storagePrefix
  storagePrefix?: string;
};
/// Options
export type Options = {
  /// Options.log
  log?: (...message: unknown[]) => void;
};
/// DurableObjectSqlDatabasePersisterConfig
export type DurableObjectSqlDatabasePersisterConfig = DpcJson | DpcFragmented;

/// DurableObjectSqlStoragePersister
export interface DurableObjectSqlStoragePersister
  extends Persister<Persists.MergeableStoreOnly> {
  /// DurableObjectSqlStoragePersister.getSqlStorage
  getSqlStorage(): SqlStorage;
  /// DurableObjectSqlStoragePersister.getLog
  getLog(): Array<{sql: string; params?: any[]; type: string}>;
}

/// createDurableObjectSqlStoragePersister
export function createDurableObjectSqlStoragePersister(
  store: MergeableStore,
  sqlStorage: SqlStorage,
  configOrStoreTableName?: DurableObjectSqlDatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
  options?: Options,
): DurableObjectSqlStoragePersister;
