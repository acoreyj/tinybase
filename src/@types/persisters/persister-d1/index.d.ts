/// persister-d1

import type {DatabasePersisterConfig, Persister} from '../index.d.ts';
import type {D1Database} from '@cloudflare/workers-types';
import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {Store} from '../../store/index.d.ts';
export interface D1Persister extends Persister {
  getDb(): D1Database;
}

/// createSqlite3Persister
export function createD1Persister(
  store: Store | MergeableStore,
  db: D1Database,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): D1Persister;
