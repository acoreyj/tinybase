import type {
  D1Persister,
  createD1Persister as createD1PersisterDecl,
} from '../../@types/persisters/persister-d1/index.d.ts';
import type {D1Database} from '@cloudflare/workers-types';
import type {DatabasePersisterConfig} from '../../@types/persisters/index.d.ts';
import {IdObj} from '../../common/obj.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {UnsubscribeFunction} from 'electric-sql/notifiers';
import {createSqlitePersister} from '../common/sqlite/create.ts';

export const createD1Persister = ((
  store: Store | MergeableStore,
  db: D1Database,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): D1Persister =>
  createSqlitePersister(
    store,
    configOrStoreTableName,
    async (sql: string, args: any[] = []): Promise<IdObj<any>[]> =>
      (
        await db
          .prepare(sql)
          .bind(...args)
          .all()
      ).results,

    (): UnsubscribeFunction => () => 0,
    (unsubscribeFunction: UnsubscribeFunction): any => unsubscribeFunction(),
    onSqlCommand,
    onIgnoredError,
    1, // Store Only,
    db,
  ) as D1Persister) as typeof createD1PersisterDecl;
