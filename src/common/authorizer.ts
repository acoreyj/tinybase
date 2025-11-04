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
import {isObject, objForEach, objIsEmpty} from './obj.ts';

const createEmptyMergeableChanges = (): MergeableChanges<false> => {
  const emptyTables: TablesStamp<false> = [{}];
  const emptyValues: ValuesStamp<false> = [{}];
  return [emptyTables, emptyValues, 1];
};

const findTableSchemaDef = (
  tableId: string,
  expandedSchema: Record<string, SchemaDefinition<any, any>>,
): SchemaDefinition<any, any> | undefined =>
  expandedSchema[tableId] ??
  Object.values(expandedSchema).find((schema) => schema.nameMatcher?.(tableId));

export const filterMergeableChanges = <withHashes extends boolean>(
  changes: MergeableChanges<withHashes>,
  expandedSchema: Record<string, SchemaDefinition<any, any>>,
  serverFunctions: any,
  authContext: AuthContext,
  log?: (message: string, data?: any) => void,
): MergeableChanges<withHashes> => {
  const logger = log ?? (() => {});
  logger('filterMergeableChanges: Starting operation', {
    changes: JSON.stringify(changes),
  });
  const [tablesStamp, valuesStamp, one] = changes;

  const authorizedTablesObj: any = {};

  try {
    if (!tablesStamp || !Array.isArray(tablesStamp)) {
      if (
        typeof tablesStamp === 'number' ||
        tablesStamp === undefined ||
        (typeof tablesStamp === 'object' &&
          Object.keys(tablesStamp).length === 0)
      ) {
        logger(
          'filterMergeableChanges: tablesStamp is a number or undefined or empty object',
          {
            tablesStamp,
            tablesStampType: typeof tablesStamp,
            isArray: Array.isArray(tablesStamp),
            isObject: typeof tablesStamp === 'object',
            isEmpty:
              typeof tablesStamp === 'object' &&
              Object.keys(tablesStamp).length === 0,
          },
        );
        return changes;
      }
      logger('filterMergeableChanges: Invalid tablesStamp structure', {
        tablesStamp,
        tablesStampType: typeof tablesStamp,
        isArray: Array.isArray(tablesStamp),
      });
      return createEmptyMergeableChanges() as MergeableChanges<withHashes>;
    }

    const tablesObj = tablesStamp[0];
    if (!isObject(tablesObj)) {
      logger('filterMergeableChanges: tablesStamp[0] is not a valid object', {
        tablesObj,
        tablesObjType: typeof tablesObj,
      });
      return createEmptyMergeableChanges() as MergeableChanges<withHashes>;
    }

    logger('filterMergeableChanges: Processing tables', {
      tableCount: Object.keys(tablesObj).length,
    });

    objForEach(tablesObj, (tableStamp, tableId) => {
      logger('filterMergeableChanges: Processing table', {tableId});
      const tableSchemaDef = findTableSchemaDef(tableId, expandedSchema);
      if (!tableSchemaDef) {
        logger(
          `filterMergeableChanges: Table "${tableId}" has no schema, denying`,
        );
        return; // Default deny when no schema
      }

      const tableAuthRule = tableSchemaDef.tableAuthorization?.read as
        | AuthFunctionName
        | undefined;
      const tableAuthorized = tableAuthRule
        ? !!serverFunctions.authorization[tableAuthRule]?.(authContext, {
            tablesStamp,
            tableStamp,
            tableId,
          })
        : false;
      if (tableAuthRule && !tableAuthorized) {
        logger(
          `filterMergeableChanges: Table "${tableId}" blocked by auth rule "${tableAuthRule}"`,
        );
        return; // Skip table
      }
      if (tableAuthorized) {
        logger(
          `filterMergeableChanges: Table "${tableId}" authorized by rule "${tableAuthRule}"`,
        );
      }

      const [rowStampsObj, tableHlc, tableHash] = tableStamp as any;
      if (!isObject(rowStampsObj)) {
        logger('filterMergeableChanges: rowStampsObj is not a valid object', {
          tableId,
          rowStampsObj,
          rowStampsObjType: typeof rowStampsObj,
        });
        return; // Skip table
      }

      const authorizedRowStampsObj: any = {};
      objForEach(rowStampsObj, (rowStamp, rowId) => {
        const [cellStampsObj, rowHlc, rowHash] = rowStamp as any;
        if (!isObject(cellStampsObj)) {
          logger(
            'filterMergeableChanges: cellStampsObj is not a valid object',
            {
              tableId,
              rowId,
              cellStampsObj,
              cellStampsObjType: typeof cellStampsObj,
            },
          );
          return; // Skip row
        }

        const authorizedCellStampsObj: any = {};
        objForEach(cellStampsObj, (cellStamp, cellId) => {
          const cellSchema = tableSchemaDef.schema.schema[tableId]?.[cellId];
          const cellAuthRule = cellSchema?.authorization?.read as
            | AuthFunctionName
            | undefined;
          const cellAuthorized =
            tableAuthorized ||
            (cellAuthRule
              ? !!serverFunctions.authorization[cellAuthRule]?.(authContext, {
                  tablesStamp,
                  tableStamp,
                  tableId,
                  rowStamp,
                  rowId,
                  rowStampsObj,
                  rowHlc,
                  rowHash,
                  cellStampsObj,
                  cellStamp,
                  cellId,
                })
              : false);
          if (!cellAuthorized) {
            logger(
              `filterMergeableChanges: Cell "${tableId}.${rowId}.${cellId}" blocked (no matching allow rule)`,
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
  } catch (error) {
    logger('filterMergeableChanges: Error during operation', {
      error: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    });
    return createEmptyMergeableChanges() as MergeableChanges<withHashes>;
  }
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
    const tableSchemaDef = findTableSchemaDef(tableId, expandedSchema);
    if (!tableSchemaDef) {
      logger(
        `filterTablesStampRead: Table "${tableId}" has no schema, denying`,
      );
      return; // Default deny when no schema
    }

    const tableAuthRule = tableSchemaDef.tableAuthorization?.read as
      | AuthFunctionName
      | undefined;
    const tableAuthorized = tableAuthRule
      ? !!serverFunctions.authorization[tableAuthRule]?.(authContext, {
          tablesStamp,
          tableStamp,
          tableId,
        })
      : false;
    if (tableAuthRule && !tableAuthorized) {
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
        const cellAuthorized =
          tableAuthorized ||
          (cellAuthRule
            ? !!serverFunctions.authorization[cellAuthRule]?.(authContext, {
                tablesStamp,
                tableStamp,
                tableId,
                rowStamp,
                cellStamp,
                cellId,
              })
            : false);
        if (!cellAuthorized) {
          logger(
            `filterTablesStampRead: Cell "${tableId}.${rowId}.${cellId}" blocked (no matching allow rule)`,
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
    const tableSchemaDef = findTableSchemaDef(tableId, expandedSchema);
    if (!tableSchemaDef) {
      logger(
        `filterTableHashesRead: Differing table "${tableId}" has no schema, denying`,
      );
      return;
    }
    const tableAuthRule = tableSchemaDef.tableAuthorization?.read as
      | AuthFunctionName
      | undefined;
    const tableAuthorized = tableAuthRule
      ? !!serverFunctions.authorization[tableAuthRule]?.(authContext, {
          tableId,
          differingTableHashes,
          hash,
        })
      : false;
    if (!tableAuthorized) {
      logger(
        `filterTableHashesRead: Differing table "${tableId}" blocked (no matching allow rule)`,
      );
      return;
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
    const tableSchemaDef = findTableSchemaDef(tableId, expandedSchema);
    if (!tableSchemaDef) {
      logger(`filterRowHashesRead: Table "${tableId}" has no schema, denying`);
      return;
    }
    const tableAuthRule = tableSchemaDef.tableAuthorization?.read as
      | AuthFunctionName
      | undefined;
    const tableAuthorized = tableAuthRule
      ? !!serverFunctions.authorization[tableAuthRule]?.(authContext, {
          tableId,
          rowHashes,
        })
      : false;
    if (!tableAuthorized) {
      logger(
        `filterRowHashesRead: Differing rows for table "${tableId}" blocked (no matching allow rule)`,
      );
      return;
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
  logger('checkMergeableChanges: Starting authorization', {
    changes: JSON.stringify(changes),
  });

  try {
    if (!tablesStamp || !Array.isArray(tablesStamp)) {
      if (
        typeof tablesStamp === 'number' ||
        tablesStamp === undefined ||
        (typeof tablesStamp === 'object' &&
          Object.keys(tablesStamp).length === 0)
      ) {
        logger(
          'checkMergeableChanges: tablesStamp is a number or undefined or empty object',
          {
            tablesStamp,
            tablesStampType: typeof tablesStamp,
            isArray: Array.isArray(tablesStamp),
            isObject: typeof tablesStamp === 'object',
            isEmpty:
              typeof tablesStamp === 'object' &&
              Object.keys(tablesStamp).length === 0,
          },
        );
        authorized = true;
        return authorized;
      }
      logger('checkMergeableChanges: Invalid tablesStamp structure', {
        tablesStamp,
        tablesStampType: typeof tablesStamp,
        isArray: Array.isArray(tablesStamp),
      });
      authorized = false;
      logger(`checkMergeableChanges: Authorization result: ${authorized}`);
      return authorized;
    }

    const tablesObj = tablesStamp[0];
    if (!isObject(tablesObj)) {
      logger('checkMergeableChanges: tablesStamp[0] is not a valid object', {
        tablesObj,
        tablesObjType: typeof tablesObj,
      });
      authorized = false;
      logger(`checkMergeableChanges: Authorization result: ${authorized}`);
      return authorized;
    }

    logger('checkMergeableChanges: Processing tables', {
      tableCount: Object.keys(tablesObj).length,
    });

    objForEach(tablesObj, (tableStamp, tableId) => {
      if (!authorized) {
        return;
      }
      logger('checkMergeableChanges: Processing table', {tableId});
      const tableSchemaDef = findTableSchemaDef(tableId, expandedSchema);
      if (!tableSchemaDef) {
        logger(
          `checkMergeableChanges: Table "${tableId}" has no schema, denying`,
        );
        authorized = false;
        return;
      }

      const tableAuthRule = tableSchemaDef.tableAuthorization?.create as
        | AuthFunctionName
        | undefined;
      const tableAuthorized = tableAuthRule
        ? !!serverFunctions.authorization[tableAuthRule]?.(authContext, {
            tablesStamp,
            tableStamp,
            tableId,
          })
        : false;
      if (!tableAuthorized) {
        logger(
          `checkMergeableChanges: Table "${tableId}" blocked (no matching allow rule for create) (${tableAuthRule})`,
        );
        authorized = false;
        return;
      }

      const [rowStampsObj] = tableStamp as any;
      if (!isObject(rowStampsObj)) {
        logger('checkMergeableChanges: rowStampsObj is not a valid object', {
          tableId,
          rowStampsObj,
          rowStampsObjType: typeof rowStampsObj,
        });
        authorized = false;
        return;
      }

      objForEach(rowStampsObj, (rowStamp, rowId) => {
        if (!authorized) {
          return;
        }
        const [cellStampsObj] = rowStamp as RowStamp;
        if (!isObject(cellStampsObj)) {
          logger('checkMergeableChanges: cellStampsObj is not a valid object', {
            tableId,
            rowId,
            cellStampsObj,
            cellStampsObjType: typeof cellStampsObj,
          });
          authorized = false;
          return;
        }
        objForEach(cellStampsObj, (cellStamp, cellId) => {
          const cellSchema = tableSchemaDef.schema.schema[tableId]?.[cellId];
          const cellAuthRule = cellSchema?.authorization?.create as
            | AuthFunctionName
            | undefined;
          const cellAuthorized =
            tableAuthorized ||
            (cellAuthRule
              ? !!serverFunctions.authorization[cellAuthRule]?.(authContext, {
                  tablesStamp,
                  tableStamp,
                  tableId,
                  rowStamp,
                  cellStamp,
                  cellId,
                })
              : false);
          if (!cellAuthorized) {
            logger(
              `checkMergeableChanges: Cell "${tableId}.${rowId}.${cellId}" blocked (no matching allow rule for create)`,
            );
            authorized = false;
          }
        });
      });
    });
  } catch (error) {
    logger('checkMergeableChanges: Error during authorization', {
      error: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    });
    authorized = false;
  }

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
): MergeableChanges<boolean> => {
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
