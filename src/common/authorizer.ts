/* eslint-disable max-len */
import type {MergeableStoreEnhanced} from '../@types/index.d.ts';
import type {
  CellStamp,
  MergeableChanges,
  MergeableStore,
  RowHashes,
  RowStamp,
  TableHashes,
  TableStamp,
  TablesStamp,
  ValuesStamp,
} from '../@types/mergeable-store/index.d.ts';
import type {SchemaDefinition} from '../expanded-schema/schemaCreator.ts';
import type {
  AuthContext,
  AuthFunctionName,
} from '../expanded-schema/serverFunctions/authorization.ts';
import {getHlcFunctions} from './hlc.ts';
import {objForEach, objIsEmpty} from './obj.ts';

const createEmptyMergeableChanges = (): MergeableChanges<false> => {
  const emptyTables: TablesStamp<false> = [{}];
  const emptyValues: ValuesStamp<false> = [{}];
  return [emptyTables, emptyValues, 1];
};

export const filterMergeableChanges = <withHashes extends boolean>(
  changes: MergeableChanges<withHashes>,
  expandedSchema: Record<string, SchemaDefinition<any, any>>,
  serverFunctions: any,
  authContext: AuthContext,
  log?: (message: string, data?: any) => void,
): MergeableChanges<withHashes> => {
  const logger = log ?? (() => {});
  logger('filterMergeableChanges: Starting operation', {
    changes,
  });
  const [tablesStamp, valuesStamp, one] = changes;

  const authorizedTablesObj: any = {};
  objForEach(tablesStamp[0], (tableStamp, tableId) => {
    const tableSchemaDef = expandedSchema[tableId];
    if (!tableSchemaDef) {
      logger(
        `filterMergeableChanges: Table "${tableId}" has no schema, allowing`,
      );
      authorizedTablesObj[tableId] = tableStamp;
      return;
    }

    const tableAuthRule = tableSchemaDef.tableAuthorization?.read as
      | AuthFunctionName
      | undefined;
    if (
      tableAuthRule &&
      !serverFunctions.authorization[tableAuthRule]?.(authContext)
    ) {
      logger(
        `filterMergeableChanges: Table "${tableId}" blocked by auth rule "${tableAuthRule}"`,
      );
      return; // Skip table
    }
    if (tableAuthRule) {
      logger(
        `filterMergeableChanges: Table "${tableId}" authorized by rule "${tableAuthRule}"`,
      );
    }

    const [rowStampsObj, tableHlc, tableHash] = tableStamp as any;
    const authorizedRowStampsObj: any = {};
    objForEach(rowStampsObj, (rowStamp, rowId) => {
      const [cellStampsObj, rowHlc, rowHash] = rowStamp as any;
      const authorizedCellStampsObj: any = {};
      objForEach(cellStampsObj, (cellStamp, cellId) => {
        const cellSchema = tableSchemaDef.schema.schema[tableId]?.[cellId];
        const cellAuthRule = cellSchema?.authorization?.read as
          | AuthFunctionName
          | undefined;
        if (
          cellAuthRule &&
          !serverFunctions.authorization[cellAuthRule]?.(authContext)
        ) {
          logger(
            `filterMergeableChanges: Cell "${tableId}.${rowId}.${cellId}" blocked by auth rule "${cellAuthRule}"`,
          );
          return; // Skip cell
        }
        authorizedCellStampsObj[cellId] = cellStamp;
        logger('filterMergeableChanges: Cell authorized', {
          authorizedCellStampsObj: JSON.stringify(authorizedCellStampsObj),
        });
      });

      if (!objIsEmpty(authorizedCellStampsObj)) {
        authorizedRowStampsObj[rowId] =
          rowHash !== undefined && rowHash !== null
            ? [authorizedCellStampsObj, rowHlc, rowHash]
            : rowHlc !== undefined && rowHlc !== null
              ? [authorizedCellStampsObj, rowHlc]
              : [authorizedCellStampsObj];
        logger('filterMergeableChanges: Row authorized', {
          authorizedRowStampsObj: JSON.stringify(authorizedRowStampsObj),
        });
      }
    });

    if (!objIsEmpty(authorizedRowStampsObj)) {
      authorizedTablesObj[tableId] =
        tableHash !== undefined && tableHash !== null
          ? [authorizedRowStampsObj, tableHlc, tableHash]
          : tableHlc !== undefined && tableHlc !== null
            ? [authorizedRowStampsObj, tableHlc]
            : [authorizedRowStampsObj];
      logger('filterMergeableChanges: Table authorized', {
        authorizedTablesObj: JSON.stringify(authorizedTablesObj),
      });
    }
  });
  logger('filterMergeableChanges: Authorized tables stamp', {
    tablesStamp: JSON.stringify(tablesStamp),
    authorizedTablesObj: JSON.stringify(authorizedTablesObj),
  });
  const authorizedTablesStamp =
    tablesStamp.length > 2
      ? ([authorizedTablesObj, tablesStamp[1], tablesStamp[2]] as any)
      : tablesStamp.length > 1
        ? ([authorizedTablesObj, tablesStamp[1]] as any)
        : ([authorizedTablesObj] as any);

  logger('filterMergeableChanges: Authorization complete', {
    authorizedTableCount: Object.keys(authorizedTablesObj).length,
    authorizedTablesStamp: JSON.stringify(authorizedTablesStamp),
  });

  return [
    authorizedTablesStamp,
    valuesStamp,
    one,
  ] as MergeableChanges<withHashes>;
};

export const filterTablesStampRead = (
  tablesStamp: TablesStamp,
  expandedSchema: Record<string, SchemaDefinition<any, any>>,
  serverFunctions: any,
  authContext: AuthContext,
  log?: (message: string, data?: any) => void,
): TablesStamp => {
  const logger = log ?? (() => {});
  const authorizedTablesObj: any = {};
  objForEach(tablesStamp[0], (tableStamp, tableId) => {
    const tableSchemaDef = expandedSchema[tableId];
    if (!tableSchemaDef) {
      logger(
        `filterTablesStampRead: Table "${tableId}" has no schema, allowing`,
      );
      authorizedTablesObj[tableId] = tableStamp;
      return;
    }

    const tableAuthRule = tableSchemaDef.tableAuthorization?.read as
      | AuthFunctionName
      | undefined;
    if (
      tableAuthRule &&
      !serverFunctions.authorization[tableAuthRule]?.(authContext)
    ) {
      logger(
        `filterTablesStampRead: Table "${tableId}" blocked by auth rule "${tableAuthRule}"`,
      );
      return;
    }

    const [rowStampsObj, tableHlc, tableHash] = tableStamp as any;
    const authorizedRowStampsObj: any = {};
    objForEach(rowStampsObj, (rowStamp, rowId) => {
      const [cellStampsObj, rowHlc, rowHash] = rowStamp as any;
      const authorizedCellStampsObj: any = {};
      objForEach(cellStampsObj, (cellStamp, cellId) => {
        const cellSchema = tableSchemaDef.schema.schema[tableId]?.[cellId];
        const cellAuthRule = cellSchema?.authorization?.read as
          | AuthFunctionName
          | undefined;
        if (
          cellAuthRule &&
          !serverFunctions.authorization[cellAuthRule]?.(authContext)
        ) {
          logger(
            `filterTablesStampRead: Cell "${tableId}.${rowId}.${cellId}" blocked by auth rule "${cellAuthRule}"`,
          );
          return;
        }
        authorizedCellStampsObj[cellId] = cellStamp;
      });

      if (!objIsEmpty(authorizedCellStampsObj)) {
        authorizedRowStampsObj[rowId] =
          rowHash !== undefined && rowHash !== null
            ? [authorizedCellStampsObj, rowHlc, rowHash]
            : rowHlc !== undefined && rowHlc !== null
              ? [authorizedCellStampsObj, rowHlc]
              : [authorizedCellStampsObj];
      }
    });

    if (!objIsEmpty(authorizedRowStampsObj)) {
      authorizedTablesObj[tableId] =
        tableHash !== undefined && tableHash !== null
          ? [authorizedRowStampsObj, tableHlc, tableHash]
          : tableHlc !== undefined && tableHlc !== null
            ? [authorizedRowStampsObj, tableHlc]
            : [authorizedRowStampsObj];
    }
  });

  const authorizedTablesStamp =
    (tablesStamp as any).length > 2
      ? ([
          authorizedTablesObj,
          (tablesStamp as any)[1],
          (tablesStamp as any)[2],
        ] as any)
      : ([authorizedTablesObj, (tablesStamp as any)[1]] as any);

  logger('filterTablesStampRead: Authorization complete', {
    authorizedTableCount: Object.keys(authorizedTablesObj).length,
  });
  return authorizedTablesStamp as TablesStamp;
};

export const filterTableHashesRead = (
  differingTableHashes: TableHashes,
  expandedSchema: Record<string, SchemaDefinition<any, any>>,
  serverFunctions: any,
  authContext: AuthContext,
  log?: (message: string, data?: any) => void,
): TableHashes => {
  const logger = log ?? (() => {});
  const finalDifferingTableHashes: TableHashes = {};
  objForEach(differingTableHashes, (hash, tableId) => {
    const tableSchemaDef = expandedSchema[tableId];
    if (tableSchemaDef) {
      const tableAuthRule = tableSchemaDef.tableAuthorization?.read as
        | AuthFunctionName
        | undefined;
      if (
        tableAuthRule &&
        !serverFunctions.authorization[tableAuthRule]?.(authContext)
      ) {
        logger(
          `filterTableHashesRead: Differing table "${tableId}" blocked by auth rule "${tableAuthRule}"`,
        );
        return;
      }
    }
    finalDifferingTableHashes[tableId] = hash;
  });
  logger('filterTableHashesRead: Authorization complete', {
    differingTableCount: Object.keys(finalDifferingTableHashes).length,
  });
  return finalDifferingTableHashes;
};

export const filterRowHashesRead = (
  differingRowHashes: RowHashes,
  expandedSchema: Record<string, SchemaDefinition<any, any>>,
  serverFunctions: any,
  authContext: AuthContext,
  log?: (message: string, data?: any) => void,
): RowHashes => {
  const logger = log ?? (() => {});
  const authorizedDifferingRowHashes: RowHashes = {};
  objForEach(differingRowHashes, (rowHashes, tableId) => {
    const tableSchemaDef = expandedSchema[tableId];
    if (tableSchemaDef) {
      const tableAuthRule = tableSchemaDef.tableAuthorization?.read as
        | AuthFunctionName
        | undefined;
      if (
        tableAuthRule &&
        !serverFunctions.authorization[tableAuthRule]?.(authContext)
      ) {
        logger(
          `filterRowHashesRead: Differing rows for table "${tableId}" blocked by auth rule "${tableAuthRule}"`,
        );
        return;
      }
    }
    authorizedDifferingRowHashes[tableId] = rowHashes;
  });
  logger('filterRowHashesRead: Authorization complete', {
    differingRowTableCount: Object.keys(authorizedDifferingRowHashes).length,
  });
  return authorizedDifferingRowHashes;
};

export const checkMergeableChanges = <withHashes extends boolean>(
  changes: MergeableChanges<withHashes>,
  expandedSchema: Record<string, SchemaDefinition<any, any>>,
  serverFunctions: any,
  authContext: AuthContext,
  log?: (message: string, data?: any) => void,
): boolean => {
  const logger = log ?? (() => {});
  const [tablesStamp] = changes;

  let authorized = true;

  objForEach(tablesStamp[0], (tableStamp, tableId) => {
    if (!authorized) {
      return;
    }
    const tableSchemaDef = expandedSchema[tableId];
    if (tableSchemaDef) {
      const tableAuthRule = tableSchemaDef.tableAuthorization?.create as
        | AuthFunctionName
        | undefined;
      if (
        tableAuthRule &&
        !serverFunctions.authorization[tableAuthRule]?.(authContext)
      ) {
        logger(
          `checkMergeableChanges: Table "${tableId}" blocked by write auth rule "${tableAuthRule}"`,
        );
        authorized = false;
        return;
      }

      const [rowStampsObj] = tableStamp as any;
      objForEach(rowStampsObj, (rowStamp, rowId) => {
        if (!authorized) {
          return;
        }
        const [cellStampsObj] = rowStamp as RowStamp;
        objForEach(cellStampsObj, (_cellStamp, cellId) => {
          const cellSchema = tableSchemaDef.schema.schema[tableId]?.[cellId];
          const cellAuthRule = cellSchema?.authorization?.write as
            | AuthFunctionName
            | undefined;
          if (
            cellAuthRule &&
            !serverFunctions.authorization[cellAuthRule]?.(authContext)
          ) {
            logger(
              `checkMergeableChanges: Cell "${tableId}.${rowId}.${cellId}" blocked by write auth rule "${cellAuthRule}"`,
            );
            authorized = false;
          }
        });
      });
    }
  });

  logger(`checkMergeableChanges: Authorization result: ${authorized}`);
  return authorized;
};

const getDefaultConfig = (fieldSchema: unknown) =>
  (
    fieldSchema as {
      defaultServerFunction?: {
        fn: string;
        updateType: ('insert' | 'update')[];
      };
    }
  )?.defaultServerFunction;

const storeHasRow = (
  store: MergeableStoreEnhanced | MergeableStore,
  tableId: string,
  rowId: string,
): boolean =>
  typeof (store as MergeableStoreEnhanced).hasRow === 'function'
    ? (store as MergeableStoreEnhanced).hasRow(tableId, rowId)
    : !!(store as MergeableStore).getRow?.(tableId, rowId);

export const processDefaultServerFunctions = <withHashes extends boolean>(
  changes: MergeableChanges<withHashes>,
  schemas: Record<string, SchemaDefinition<any, any>>,
  store: MergeableStoreEnhanced | MergeableStore | null,
  serverFunctions: any,
): MergeableChanges<false> => {
  // console.log('processDefaultServerFunctions: invoked', {
  //   hasStore: !!store,
  //   changes: JSON.stringify(changes),
  // });
  if (!store) {
    // console.log(
    //   'processDefaultServerFunctions: no store provided, returning empty changes',
    // );
    return createEmptyMergeableChanges();
  }

  const resultTables: TablesStamp<false>[0] = {};
  const [getNextHlc] = getHlcFunctions();
  const hlc = getNextHlc();
  const resultTableStamp: TablesStamp<false> = [resultTables, hlc];

  const [tablesStamp] = changes;
  const [tablesObj] = tablesStamp;

  // console.log('processDefaultServerFunctions: processing tables', {
  //   tableIds: Object.keys(tablesObj),
  // });

  objForEach(tablesObj, (tableStamp, tableId) => {
    const schemaDefinition = schemas[tableId];
    const tableSchema = schemaDefinition?.schema.schema[tableId];
    if (!tableSchema) {
      // console.log(
      //   'processDefaultServerFunctions: skipping table with no schema',
      //   {tableId},
      // );
      return;
    }

    const [rowsObj] = tableStamp as TableStamp<withHashes>;
    let tableDefaults: TableStamp<false> | undefined;

    objForEach(rowsObj, (rowStamp, rowId) => {
      const [cellsObj] = rowStamp as RowStamp<withHashes>;
      const updatedFields = Object.keys(cellsObj);

      const rowDefaultCells: RowStamp<false>[0] = {};
      let rowDefaults: RowStamp<false> | undefined;

      objForEach(tableSchema, (fieldSchema, fieldKey) => {
        const defaultConfig = getDefaultConfig(fieldSchema);
        if (!defaultConfig) {
          return;
        }

        const defaultValueFn = serverFunctions?.defaults?.[defaultConfig.fn];
        if (typeof defaultValueFn !== 'function') {
          return;
        }

        const rowExists = storeHasRow(store, tableId, rowId);
        const currentValue = store.getCell(tableId, rowId, fieldKey);

        const updateTypes = defaultConfig.updateType ?? [];
        const shouldApplyDefault =
          rowExists &&
          typeof currentValue !== 'undefined' &&
          currentValue !== null &&
          currentValue !== ''
            ? !updatedFields.includes(fieldKey) &&
              updateTypes.includes('update')
            : updateTypes.includes('insert');

        // console.log('processDefaultServerFunctions: shouldApplyDefault', {
        //   shouldApplyDefault,
        //   rowExists,
        //   currentValue,
        //   updatedFields,
        //   updateTypes,
        // });
        if (!shouldApplyDefault) {
          return;
        }

        const defaultValue = defaultValueFn();
        if (typeof defaultValue === 'undefined') {
          return;
        }

        rowDefaultCells[fieldKey] = [defaultValue, hlc] as CellStamp<false>;
        rowDefaults = rowDefaults ?? [rowDefaultCells];
        // console.log('processDefaultServerFunctions: default applied', {
        //   tableId,
        //   rowId,
        //   fieldKey,
        //   defaultFn: defaultConfig.fn,
        // });
      });

      if (rowDefaults && !objIsEmpty(rowDefaultCells)) {
        if (!tableDefaults) {
          tableDefaults = [{}, undefined];
        }
        tableDefaults[0][rowId] = rowDefaults;
        // console.log('processDefaultServerFunctions: row defaults set', {
        //   tableId,
        //   rowId,
        //   fields: Object.keys(rowDefaultCells),
        // });
      }
    });

    if (tableDefaults) {
      resultTables[tableId] = tableDefaults;
      // console.log('processDefaultServerFunctions: table defaults collected', {
      //   tableId,
      // });
    }
  });

  if (objIsEmpty(resultTables)) {
    // console.log(
    //   'processDefaultServerFunctions: no defaults generated, returning empty changes',
    // );
    return createEmptyMergeableChanges();
  }

  const resultValues: ValuesStamp<false> = [{}];

  // console.log('processDefaultServerFunctions: defaults generated', {
  //   tablesWithDefaults: Object.keys(resultTables),
  // });

  return [resultTableStamp, resultValues, 1];
};
