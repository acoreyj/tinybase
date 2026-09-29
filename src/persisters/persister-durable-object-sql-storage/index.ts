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
import {
  arrayForEach,
  arrayHas,
  arrayJoin,
  arrayMap,
  arrayPush,
} from '../../common/array.ts';
import {collHas} from '../../common/coll.ts';
import {
  jsonParseWithUndefined,
  jsonString,
  jsonStringWithUndefined,
} from '../../common/json.ts';
import {
  IdObj,
  isObject,
  objEnsure,
  objForEach,
  objNew,
  objSet,
} from '../../common/obj.ts';
import {
  isNull,
  isNullish,
  noop,
  number,
  slice,
  string,
  test,
} from '../../common/other.ts';
import {setAdd, setNew} from '../../common/set.ts';
import {stampNewWithHash, stampUpdate} from '../../common/stamps.ts';
import {EMPTY_STRING, strSplit, T} from '../../common/strings.ts';
import {createCustomPersister} from '../common/create.ts';
import {escapeId} from '../common/database/common.ts';
import {createCustomSqlitePersister} from '../common/database/sqlite.ts';

type UnsubscribeFunction = () => void;

export type DurableObjectSqlDatabasePersisterConfig = DpcJson | DpcFragmented;

const getSqlRows = (
  sqlStorage: SqlStorage,
  sql: string,
  ...params: any[]
): IdObj<any>[] => sqlStorage.exec(sql, ...params).toArray();

export const createDurableObjectSqlStoragePersister = (
  store: MergeableStore,
  sqlStorage: SqlStorage,
  configOrStoreTableName?: DurableObjectSqlDatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
  options?: Options,
): DurableObjectSqlStoragePersister => {
  if ((configOrStoreTableName as DpcFragmented)?.mode == 'fragmented') {
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
      if (!arrayHas(['BEGIN', 'END'], sql)) {
        return getSqlRows(sqlStorage, sql, ...params);
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

const stampNewObjectWithHash = <Thing>() =>
  stampNewWithHash(objNew<Thing>(), EMPTY_STRING, 0);

const escapeGeneratedId = (id: string) =>
  test(/^[a-zA-Z_][a-zA-Z0-9_]*$/, id) ? id : escapeId(id);

const encodeStoragePrefix = (storagePrefix: string) =>
  arrayJoin(
    arrayMap(
      strSplit(storagePrefix),
      (character) =>
        '$' + slice((0x10000 + character.charCodeAt(0)).toString(16), 1),
    ),
  );

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
  const tablePrefix = test(/^[a-z0-9_]*$/, storagePrefix)
    ? storagePrefix
    : `$tinybase$${encodeStoragePrefix(storagePrefix)}$`;
  const tablesTableId = `${tablePrefix}tinybase_tables`;
  const valuesTableId = `${tablePrefix}tinybase_values`;
  const tablesTable = escapeGeneratedId(tablesTableId);
  const valuesTable = escapeGeneratedId(valuesTableId);
  const insertTableSql = `INSERT INTO ${tablesTable} (type, table_id, row_id, cell_id, value_data, timestamp, hash) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const insertValueSql = `INSERT INTO ${valuesTable} (value_id, value_data, timestamp, hash) VALUES (?, ?, ?, ?)`;
  const getRowKey = (tableId: string, rowId: string) =>
    jsonString([tableId, rowId]);

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

  const getCondition = (params: any[], column: string, value: any): string =>
    isNull(value)
      ? `${column} IS NULL`
      : (arrayPush(params, value), `${column} = ?`);

  const delTablesRow = (
    tableId: string | null,
    rowId: string | null,
    cellId: string | null,
  ) => {
    const params = [T];
    execSql(
      `DELETE FROM ${tablesTable} WHERE type = ? AND ` +
        getCondition(params, 'table_id', tableId) +
        ` AND ` +
        getCondition(params, 'row_id', rowId) +
        ` AND ` +
        getCondition(params, 'cell_id', cellId),
      ...params,
    );
  };

  const setTablesRow = (
    tableId: string | null,
    rowId: string | null,
    cellId: string | null,
    valueData: string,
    timestamp: string,
    hash: number,
  ) => {
    delTablesRow(tableId, rowId, cellId);
    execSql(
      insertTableSql,
      T,
      tableId,
      rowId,
      cellId,
      valueData,
      timestamp,
      hash,
    );
  };

  const delCellRows = (tableId: string, rowId: string) =>
    execSql(
      `DELETE FROM ${tablesTable} WHERE type = ? AND table_id = ? AND row_id = ? AND cell_id IS NOT NULL`,
      T,
      tableId,
      rowId,
    );

  const delValuesRow = (valueId: string | null) => {
    const params: any[] = [];
    execSql(
      `DELETE FROM ${valuesTable} WHERE ` +
        getCondition(params, 'value_id', valueId),
      ...params,
    );
  };

  const setValuesRow = (
    valueId: string | null,
    valueData: string,
    timestamp: string,
    hash: number,
  ) => {
    delValuesRow(valueId);
    execSql(insertValueSql, valueId, valueData, timestamp, hash);
  };

  const getPersisted = async (): Promise<
    PersistedContent<PersistsType.MergeableStoreOnly>
  > => {
    const tables: TablesStamp<true> = stampNewObjectWithHash();
    const values: ValuesStamp<true> = stampNewObjectWithHash();
    const rowDataKeys = setNew<string>();

    options?.log?.('Getting persisted');
    // Load tables data
    const tablesRows = execSql(`SELECT * FROM ${tablesTable}`).toArray();
    arrayForEach(tablesRows, (row) => {
      const table_id = isNullish(row.table_id) ? null : string(row.table_id);
      const row_id = isNullish(row.row_id) ? null : string(row.row_id);
      const cell_id = isNullish(row.cell_id) ? null : string(row.cell_id);
      const value_data = string(row.value_data);
      const timestamp = string(row.timestamp);
      const hash = number(row.hash);
      const [zeroOrCells] = jsonParseWithUndefined(value_data);

      if (
        !isNull(table_id) &&
        !isNull(row_id) &&
        isNull(cell_id) &&
        isObject(zeroOrCells)
      ) {
        const table = objEnsure(
          tables[0],
          table_id,
          stampNewObjectWithHash,
        ) as TableStamp<true>;
        objSet(table[0], row_id, [
          zeroOrCells as RowStamp<true>[0],
          timestamp,
          hash,
        ]);
        setAdd(rowDataKeys, getRowKey(table_id, row_id));
      }
    });

    arrayForEach(tablesRows, (row) => {
      const type = string(row.type);
      const table_id = isNullish(row.table_id) ? null : string(row.table_id);
      const row_id = isNullish(row.row_id) ? null : string(row.row_id);
      const cell_id = isNullish(row.cell_id) ? null : string(row.cell_id);
      const value_data = string(row.value_data);
      const timestamp = string(row.timestamp);
      const hash = number(row.hash);

      const [zeroOrCellOrValue] = jsonParseWithUndefined(value_data);

      if (type === T) {
        if (!isNull(table_id) && !isNull(row_id) && !isNull(cell_id)) {
          // Cell level
          if (!collHas(rowDataKeys, getRowKey(table_id, row_id))) {
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
            objSet(tableRow[0], cell_id, [zeroOrCellOrValue, timestamp, hash]);
          }
        } else if (!isNull(table_id) && !isNull(row_id)) {
          // Row level
          if (!isObject(zeroOrCellOrValue)) {
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
          }
        } else if (!isNull(table_id)) {
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
    });

    options?.log?.('Loaded tables');

    // Load values data
    arrayForEach(execSql(`SELECT * FROM ${valuesTable}`).toArray(), (row) => {
      const value_id = isNullish(row.value_id) ? null : string(row.value_id);
      const value_data = string(row.value_data);
      const timestamp = string(row.timestamp);
      const hash = number(row.hash);

      const [zeroOrCellOrValue] = jsonParseWithUndefined(value_data);

      if (!isNull(value_id)) {
        objSet(values[0], value_id, [zeroOrCellOrValue, timestamp, hash]);
      } else {
        stampUpdate(values, timestamp, hash);
      }
    });
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
    const [fullTablesObj] = getContent()[0];
    // Store the root tables metadata (timestamp and hash)
    setTablesRow(
      null,
      null,
      null,
      jsonStringWithUndefined([0]),
      tablesTime,
      tablesHash,
    );

    options?.log?.('Stored tables metadata');

    let execCount = 0;

    // Process each table in the store
    objForEach(tablesObj, ([tableObj, tableTime, tableHash], tableId) => {
      // Store table-level metadata
      execCount++;
      setTablesRow(
        tableId,
        null,
        null,
        jsonStringWithUndefined([0]),
        tableTime,
        tableHash,
      );

      // Process each row within the table
      objForEach(tableObj, ([rowObj, rowTime, rowHash], rowId) => {
        execCount++;
        const fullRowObj = fullTablesObj[tableId]?.[0]?.[rowId]?.[0] ?? rowObj;
        delCellRows(tableId, rowId);
        setTablesRow(
          tableId,
          rowId,
          null,
          jsonStringWithUndefined([fullRowObj]),
          rowTime,
          rowHash,
        );
      });
    });

    options?.log?.('Stored tables', {execCount});
    execCount = 0;

    // Store the root values metadata (timestamp and hash)
    setValuesRow(null, jsonStringWithUndefined([0]), valuesTime, valuesHash);

    options?.log?.('Stored values metadata', {execCount});
    execCount = 0;

    // Process each value in the store
    objForEach(valuesObj, (valueStamp, valueId) => {
      execCount++;
      setValuesRow(
        valueId,
        jsonStringWithUndefined([valueStamp[0]]),
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
