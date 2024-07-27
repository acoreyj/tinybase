import type {
  PostgresPersister,
  createPostgresPersister as createPostgresPersisterDecl,
} from '../../@types/persisters/persister-postgres/index.d.ts';
import type {DatabasePersisterConfig} from '../../@types/persisters/index.d.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {Sql} from 'postgres';
import type {Store} from '../../@types/store/index.d.ts';
import {createPgPersister} from '../common/pg/create.ts';

export const createPostgresPersister = ((
  store: Store | MergeableStore,
  sql: Sql,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): PostgresPersister =>
  createPgPersister(
    store,
    configOrStoreTableName,
    sql.unsafe,
    () => 0,
    () => 0,
    onSqlCommand,
    onIgnoredError,
    3, // StoreOrMergeableStore,
    sql,
    'getSql',
  ) as PostgresPersister) as typeof createPostgresPersisterDecl;
