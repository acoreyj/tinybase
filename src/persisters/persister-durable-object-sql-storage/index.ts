/* eslint-disable max-len */
import type {
  MergeableStore,
  RowStamp,
  TablesStamp,
  TableStamp,
  ValuesStamp,
} from '../../@types/mergeable-store/index.d.ts';
import type {
  DpcJson,
  PersistedChanges,
  PersistedContent,
  Persists as PersistsType,
} from '../../@types/persisters/index.d.ts';
import type {
  createDurableObjectSqlStoragePersister as createDurableObjectSqlStoragePersisterDecl,
  DpcFragmented,
  DurableObjectSqlStoragePersister,
  Options,
} from '../../@types/persisters/persister-durable-object-sql-storage/index.d.ts';
import {IdObj, objEnsure, objForEach} from '../../common/obj.ts';
import {noop} from '../../common/other.ts';
import {stampNewWithHash, stampUpdate} from '../../common/stamps.ts';
import {EMPTY_STRING, T} from '../../common/strings.ts';
import {createCustomPersister} from '../common/create.ts';
import {createCustomSqlitePersister} from '../common/database/sqlite.ts';

type UnsubscribeFunction = () => void;

export type DurableObjectSqlDatabasePersisterConfig = DpcJson | DpcFragmented;

export const createDurableObjectSqlStoragePersister = (
  store: MergeableStore,
  sqlStorage: SqlStorage,
  configOrStoreTableName?: DurableObjectSqlDatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
    options?: Options,
): DurableObjectSqlStoragePersister => {
  if (
    typeof configOrStoreTableName === 'object' &&
    configOrStoreTableName.mode === 'fragmented'
  ) {
    return createDurableObjectFragmentedSqlStoragePersister(
      store,
      sqlStorage,
      (configOrStoreTableName as DpcFragmented)?.storagePrefix ?? EMPTY_STRING,
      onSqlCommand,
      onIgnoredError,
      options,
    );
  }
  return createCustomSqlitePersister(
    store,
    configOrStoreTableName as DpcJson,
    async (sql: string, params: any[] = []): Promise<IdObj<any>[]> => {
      if (!['BEGIN', 'END'].includes(sql)) {
        //in sql replace $1, $2, $3, etc. with a question mark
        sql = sql.replace(/\$\d+/g, '?');
        return sqlStorage.exec(sql, ...params).toArray();
      }
      return [];
    },
    (): UnsubscribeFunction => noop,
    (unsubscribeFunction: UnsubscribeFunction): any => unsubscribeFunction(),
    onSqlCommand,
    onIgnoredError,
    noop,
    2, // MergeableStoreOnly,
    sqlStorage,
    'getSqlStorage',
  ) as DurableObjectSqlStoragePersister;
};

const stampNewObjectWithHash = () => stampNewWithHash({}, EMPTY_STRING, 0);

const createDurableObjectFragmentedSqlStoragePersister = ((
  store: MergeableStore,
  sqlStorage: SqlStorage,
  storagePrefix: string = EMPTY_STRING,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
  options?: Options,
): DurableObjectSqlStoragePersister => {

  options?.log?.('createDurableObjectFragmentedSqlStoragePersister');
  const execSql = (sql: string, ...bindings: any[]) => {
    onSqlCommand?.(sql, bindings);
    return sqlStorage.exec(sql, ...bindings);
  };
  const tablePrefix = storagePrefix.replace(/[^a-zA-Z0-9_]/g, '_');
  const tablesTable = `${tablePrefix}tinybase_tables`;
  const valuesTable = `${tablePrefix}tinybase_values`;

  // Initialize the SQL tables
  const initializeTables = () => {
    execSql(`
      CREATE TABLE IF NOT EXISTS ${tablesTable} (
        type TEXT NOT NULL,
        table_id TEXT,
        row_id TEXT,
        cell_id TEXT,
        value_data TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        hash INTEGER NOT NULL,
        PRIMARY KEY (type, table_id, row_id, cell_id)
      );
      
      CREATE TABLE IF NOT EXISTS ${valuesTable} (
        value_id TEXT,
        value_data TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        hash INTEGER NOT NULL
      );
    `);
  };

  options?.log?.('Initialized tables');
 
  initializeTables();

  options?.log?.('Loaded tables');

  const getPersisted = async (): Promise<
    PersistedContent<PersistsType.MergeableStoreOnly>
  > => {
    const tables: TablesStamp<true> = stampNewObjectWithHash();
    const values: ValuesStamp<true> = stampNewObjectWithHash();

    options?.log?.('Getting persisted');
    // Load tables data
    const tablesResult = execSql(`SELECT * FROM ${tablesTable}`);
    for (const row of tablesResult.toArray()) {
      const type = String(row.type);
      const table_id = row.table_id ? String(row.table_id) : null;
      const row_id = row.row_id ? String(row.row_id) : null;
      const cell_id = row.cell_id ? String(row.cell_id) : null;
      const value_data = String(row.value_data);
      const timestamp = String(row.timestamp);
      const hash = Number(row.hash);

      const [zeroOrCellOrValue] = JSON.parse(value_data);

      if (type === T) {
        if (table_id && row_id && cell_id) {
          // Cell level
          const table = objEnsure(
            tables[0],
            table_id,
            stampNewObjectWithHash,
          ) as TableStamp<true>;
          const tableRow = objEnsure(
            table[0],
            row_id,
            stampNewObjectWithHash,
          ) as RowStamp<true>;
          tableRow[0][cell_id] = [zeroOrCellOrValue, timestamp, hash];
        } else if (table_id && row_id) {
          // Row level
          const table = objEnsure(
            tables[0],
            table_id,
            stampNewObjectWithHash,
          ) as TableStamp<true>;
          const tableRow = objEnsure(
            table[0],
            row_id,
            stampNewObjectWithHash,
          ) as RowStamp<true>;
          stampUpdate(tableRow, timestamp, hash);
        } else if (table_id) {
          // Table level
          const table = objEnsure(
            tables[0],
            table_id,
            stampNewObjectWithHash,
          ) as TableStamp<true>;
          stampUpdate(table, timestamp, hash);
        } else {
          // Tables level
          stampUpdate(tables, timestamp, hash);
        }
      }
    }

    options?.log?.('Loaded tables');

    // Load values data
    const valuesResult = execSql(`SELECT * FROM ${valuesTable}`);
    for (const row of valuesResult.toArray()) {
      const value_id = row.value_id ? String(row.value_id) : null;
      const value_data = String(row.value_data);
      const timestamp = String(row.timestamp);
      const hash = Number(row.hash);

      const [zeroOrCellOrValue] = JSON.parse(value_data);

      if (value_id) {
        values[0][value_id] = [zeroOrCellOrValue, timestamp, hash];
      } else {
        stampUpdate(values, timestamp, hash);
      }
    }
    options?.log?.('Loaded values');

    return [tables, values];
  };

  const setPersisted = async (
    getContent: () => PersistedContent<PersistsType.MergeableStoreOnly>,
    [
      [tablesObj, tablesTime, tablesHash],
      [valuesObj, valuesTime, valuesHash],
    ]: PersistedChanges<
      PersistsType.MergeableStoreOnly,
      true
    > = getContent() as any,
  ): Promise<void> => {
    options?.log?.('Setting persisted');
    // Store the root tables metadata (timestamp and hash)
    execSql(
      `INSERT OR REPLACE INTO ${tablesTable} (type, table_id, row_id, cell_id, value_data, timestamp, hash) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      T,
      null,
      null,
      null,
      JSON.stringify([0]),
      tablesTime,
      tablesHash,
    );

    options?.log?.('Stored tables metadata');

    let execCount = 0;

    // Process each table in the store
    objForEach(tablesObj, ([tableObj, tableTime, tableHash], tableId) => {
      // Store table-level metadata
      execCount++;
      execSql(
        `INSERT OR REPLACE INTO ${tablesTable} (type, table_id, row_id, cell_id, value_data, timestamp, hash) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        T,
        tableId,
        null,
        null,
        JSON.stringify([0]),
        tableTime,
        tableHash,
      );

      // Process each row within the table
      objForEach(tableObj, ([rowObj, rowTime, rowHash], rowId) => {
        // Store row-level metadata
        execCount++;
        execSql(
          `INSERT OR REPLACE INTO ${tablesTable} (type, table_id, row_id, cell_id, value_data, timestamp, hash) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          T,
          tableId,
          rowId,
          null,
          JSON.stringify([0]),
          rowTime,
          rowHash,
        );

        // Store each cell value within the row
        objForEach(rowObj, (cellStamp, cellId) => {
          execCount++;
          execSql(
            `INSERT OR REPLACE INTO ${tablesTable} (type, table_id, row_id, cell_id, value_data, timestamp, hash) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            T,
            tableId,
            rowId,
            cellId,
            JSON.stringify([cellStamp[0]]),
            cellStamp[1],
            cellStamp[2],
          );
        });
      });
    });

    options?.log?.('Stored tables', {execCount});
    execCount = 0;

    // Store the root values metadata (timestamp and hash)
    execSql(
      `INSERT OR REPLACE INTO ${valuesTable} (value_id, value_data, timestamp, hash) VALUES (?, ?, ?, ?)`,
      null,
      JSON.stringify([0]),
      valuesTime,
      valuesHash,
    );

    options?.log?.('Stored values metadata', {execCount});
    execCount = 0;

    // Process each value in the store w
    objForEach(valuesObj, (valueStamp, valueId) => {
      execCount++;
      execSql(
        `INSERT OR REPLACE INTO ${valuesTable} (value_id, value_data, timestamp, hash) VALUES (?, ?, ?, ?)`,
        valueId,
        JSON.stringify([valueStamp[0]]),
        valueStamp[1],
        valueStamp[2],
      );
    });

    options?.log?.('Stored values', {execCount});
  };

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    noop,
    noop,
    onIgnoredError,
    2, // MergeableStoreOnly,
    {getSqlStorage: () => sqlStorage},
  ) as DurableObjectSqlStoragePersister;
}) as typeof createDurableObjectSqlStoragePersisterDecl;
