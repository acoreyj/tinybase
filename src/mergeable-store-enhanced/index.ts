/* eslint-disable max-len */
import type {Id} from '../@types/common/index.d.ts';
import type {
  CellHashes,
  MergeableChanges,
  MergeableStore,
  RowHashes,
  RowStamp,
  TableHashes,
  TablesStamp,
} from '../@types/mergeable-store/index.d.ts';
import {objForEach, objIsEmpty} from '../common/obj.ts';
import type {SchemaDefinition} from '../expanded-schema/schemaCreator.ts';
import type {
  AuthContext,
  AuthFunctionName,
} from '../expanded-schema/serverFunctions/authorization.ts';
import {createMergeableStore} from '../mergeable-store/index.ts';

export interface MergeableStoreEnhanced
  extends Omit<
    MergeableStore,
    | 'getMergeableTableDiff'
    | 'getMergeableRowDiff'
    | 'getMergeableCellDiff'
    | 'getTransactionMergeableChanges'
  > {
  getMergeableTableDiff(
    otherTableHashes: TableHashes,
  ): [newTables: TablesStamp, differingTableHashes: TableHashes];
  getMergeableRowDiff(
    otherTableRowHashes: RowHashes,
  ): [newRows: TablesStamp, differingRowHashes: RowHashes];
  getMergeableCellDiff(otherTableRowCellHashes: CellHashes): TablesStamp;
  getTransactionMergeableChanges<withHashes extends boolean>(
    withHashes?: withHashes,
  ): MergeableChanges<withHashes>;
}

export const createMergeableStoreEnhanced = (
  uniqueId: Id | undefined,
  expandedSchema: Record<string, SchemaDefinition<any, any>>,
  serverFunctions: any,
  getAuthContext: () => AuthContext,
  log?: (message: string, data?: any) => void,
): MergeableStoreEnhanced => {
  const store = createMergeableStore(uniqueId);
  const logger = log ?? (() => {});

  const originalGetMergeableTableDiff = store.getMergeableTableDiff;

  const getMergeableTableDiff = (
    otherTableHashes: TableHashes,
  ): [newTables: TablesStamp, differingTableHashes: TableHashes] => {
    logger('getMergeableTableDiff: Starting table diff operation');
    const authContext = getAuthContext();
    logger('getMergeableTableDiff: Auth context retrieved', {authContext});

    const [newTables, differingTableHashes] =
      originalGetMergeableTableDiff(otherTableHashes);

    logger('getMergeableTableDiff: Raw diff computed', {
      newTableCount: Object.keys(newTables[0]).length,
      differingTableCount: Object.keys(differingTableHashes).length,
    });

    const authorizedNewTablesObj: TablesStamp[0] = {};

    objForEach(newTables[0], (tableStamp, tableId) => {
      const tableSchemaDef = expandedSchema[tableId];
      if (!tableSchemaDef) {
        logger(
          `getMergeableTableDiff: Table "${tableId}" has no schema, allowing`,
        );
        authorizedNewTablesObj[tableId] = tableStamp;
        return;
      }

      const tableAuthRule = tableSchemaDef.tableAuthorization?.read as
        | AuthFunctionName
        | undefined;
      if (tableAuthRule) {
        const authFunc = serverFunctions.authorization[tableAuthRule];
        if (authFunc && !authFunc(authContext)) {
          logger(
            `getMergeableTableDiff: Table "${tableId}" blocked by ` +
              `auth rule "${tableAuthRule}"`,
          );
          return; // Not authorized to read table, so skip it.
        }
        logger(
          `getMergeableTableDiff: Table "${tableId}" authorized by ` +
            `rule "${tableAuthRule}"`,
        );
      }

      const [rowStampsObj, tableHlc] = tableStamp;
      const authorizedRowStampsObj: typeof rowStampsObj = {};

      objForEach(rowStampsObj, (rowStamp, rowId) => {
        const [cellStampsObj, rowHlc] = rowStamp as RowStamp;
        const authorizedCellStampsObj: typeof cellStampsObj = {};

        objForEach(cellStampsObj, (cellStamp, cellId) => {
          const cellSchema = tableSchemaDef.schema.schema[tableId]?.[cellId];
          const cellAuthRule = cellSchema?.authorization?.read as
            | AuthFunctionName
            | undefined;

          if (cellAuthRule) {
            const authFunc = serverFunctions.authorization[cellAuthRule];
            if (authFunc && !authFunc(authContext)) {
              logger(
                `getMergeableTableDiff: Cell "${tableId}.${rowId}.` +
                  `${cellId}" blocked by auth rule "${cellAuthRule}"`,
              );
              return; // Not authorized to read cell, skip it.
            }
          }
          authorizedCellStampsObj[cellId] = cellStamp;
        });

        authorizedRowStampsObj[rowId] = [authorizedCellStampsObj, rowHlc];
      });

      authorizedNewTablesObj[tableId] = [authorizedRowStampsObj, tableHlc];
    });

    const authorizedNewTables: TablesStamp = [
      authorizedNewTablesObj,
      newTables[1],
    ];

    const finalDifferingTableHashes: TableHashes = {};
    objForEach(differingTableHashes, (hash, tableId) => {
      const tableSchemaDef = expandedSchema[tableId];
      if (tableSchemaDef) {
        const tableAuthRule = tableSchemaDef.tableAuthorization?.read as
          | AuthFunctionName
          | undefined;
        if (tableAuthRule) {
          const authFunc = serverFunctions.authorization[tableAuthRule];
          if (authFunc && !authFunc(authContext)) {
            logger(
              `getMergeableTableDiff: Differing table "${tableId}" ` +
                `blocked by auth rule "${tableAuthRule}"`,
            );
            return; // Skip
          }
        }
      }
      finalDifferingTableHashes[tableId] = hash;
    });

    logger('getMergeableTableDiff: Authorization complete', {
      authorizedTableCount: Object.keys(authorizedNewTablesObj).length,
      differingTableCount: Object.keys(finalDifferingTableHashes).length,
    });

    return [authorizedNewTables, finalDifferingTableHashes];
  };

  const originalGetMergeableRowDiff = store.getMergeableRowDiff;
  const getMergeableRowDiff = (
    otherTableRowHashes: RowHashes,
  ): [newRows: TablesStamp, differingRowHashes: RowHashes] => {
    logger('getMergeableRowDiff: Starting row diff operation');
    const authContext = getAuthContext();
    logger('getMergeableRowDiff: Auth context retrieved', {authContext});

    const [newRows, differingRowHashes] =
      originalGetMergeableRowDiff(otherTableRowHashes);

    logger('getMergeableRowDiff: Raw diff computed', {
      newRowTableCount: Object.keys(newRows[0]).length,
      differingRowTableCount: Object.keys(differingRowHashes).length,
    });

    // Filter newRows
    const authorizedNewRowsObj: TablesStamp[0] = {};
    objForEach(newRows[0], (tableStamp, tableId) => {
      const tableSchemaDef = expandedSchema[tableId];
      if (!tableSchemaDef) {
        logger(
          `getMergeableRowDiff: Table "${tableId}" has no schema, allowing`,
        );
        authorizedNewRowsObj[tableId] = tableStamp;
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
          `getMergeableRowDiff: Table "${tableId}" blocked by ` +
            `auth rule "${tableAuthRule}"`,
        );
        return; // Skip whole table
      }
      if (tableAuthRule) {
        logger(
          `getMergeableRowDiff: Table "${tableId}" authorized by ` +
            `rule "${tableAuthRule}"`,
        );
      }

      const [rowStampsObj, tableHlc] = tableStamp;
      const authorizedRowStampsObj: typeof rowStampsObj = {};
      objForEach(rowStampsObj, (rowStamp, rowId) => {
        const [cellStampsObj, rowHlc] = rowStamp as RowStamp;
        const authorizedCellStampsObj: typeof cellStampsObj = {};
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
              `getMergeableRowDiff: Cell "${tableId}.${rowId}.` +
                `${cellId}" blocked by auth rule "${cellAuthRule}"`,
            );
            return; // Skip cell
          }
          authorizedCellStampsObj[cellId] = cellStamp;
        });
        authorizedRowStampsObj[rowId] = [authorizedCellStampsObj, rowHlc];
      });
      authorizedNewRowsObj[tableId] = [authorizedRowStampsObj, tableHlc];
    });
    const authorizedNewRows: TablesStamp = [authorizedNewRowsObj, newRows[1]];

    logger('getMergeableRowDiff: New rows authorization complete', {
      authorizedTableCount: Object.keys(authorizedNewRowsObj).length,
    });

    // Filter differingRowHashes
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
            `getMergeableRowDiff: Differing rows for table ` +
              `"${tableId}" blocked by auth rule "${tableAuthRule}"`,
          );
          return; // Skip table
        }
      }
      authorizedDifferingRowHashes[tableId] = rowHashes;
    });

    logger('getMergeableRowDiff: Authorization complete', {
      differingRowTableCount: Object.keys(authorizedDifferingRowHashes).length,
    });

    return [authorizedNewRows, authorizedDifferingRowHashes];
  };

  const originalGetMergeableCellDiff = store.getMergeableCellDiff;
  const getMergeableCellDiff = (
    otherTableRowCellHashes: CellHashes,
  ): TablesStamp => {
    logger('getMergeableCellDiff: Starting cell diff operation');
    const authContext = getAuthContext();
    logger('getMergeableCellDiff: Auth context retrieved', {authContext});

    const resultTablesStamp = originalGetMergeableCellDiff(
      otherTableRowCellHashes,
    );

    logger('getMergeableCellDiff: Raw diff computed', {
      tableCount: Object.keys(resultTablesStamp[0]).length,
    });

    const authorizedTablesObj: TablesStamp[0] = {};
    objForEach(resultTablesStamp[0], (tableStamp, tableId) => {
      const tableSchemaDef = expandedSchema[tableId];
      if (!tableSchemaDef) {
        logger(
          `getMergeableCellDiff: Table "${tableId}" has no schema, allowing`,
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
          `getMergeableCellDiff: Table "${tableId}" blocked by ` +
            `auth rule "${tableAuthRule}"`,
        );
        return; // Skip whole table
      }
      if (tableAuthRule) {
        logger(
          `getMergeableCellDiff: Table "${tableId}" authorized by ` +
            `rule "${tableAuthRule}"`,
        );
      }

      const [rowStampsObj, tableHlc] = tableStamp;
      const authorizedRowStampsObj: typeof rowStampsObj = {};
      objForEach(rowStampsObj, (rowStamp, rowId) => {
        const [cellStampsObj, rowHlc] = rowStamp as RowStamp;
        const authorizedCellStampsObj: typeof cellStampsObj = {};
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
              `getMergeableCellDiff: Cell "${tableId}.${rowId}.` +
                `${cellId}" blocked by auth rule "${cellAuthRule}"`,
            );
            return; // Skip cell
          }
          authorizedCellStampsObj[cellId] = cellStamp;
        });
        if (!objIsEmpty(authorizedCellStampsObj)) {
          authorizedRowStampsObj[rowId] = [authorizedCellStampsObj, rowHlc];
        }
      });
      if (!objIsEmpty(authorizedRowStampsObj)) {
        authorizedTablesObj[tableId] = [authorizedRowStampsObj, tableHlc];
      }
    });

    logger('getMergeableCellDiff: Authorization complete', {
      authorizedTableCount: Object.keys(authorizedTablesObj).length,
    });

    return [authorizedTablesObj, resultTablesStamp[1]];
  };

  const originalGetTransactionMergeableChanges =
    store.getTransactionMergeableChanges;
  const getTransactionMergeableChanges = <withHashes extends boolean>(
    withHashes?: withHashes,
  ): MergeableChanges<withHashes> => {
    logger(
      `getTransactionMergeableChanges: Starting operation (withHashes=${withHashes})`,
    );
    const authContext = getAuthContext();
    logger('getTransactionMergeableChanges: Auth context retrieved', {
      authContext,
    });

    const [tablesStamp, valuesStamp, one] =
      originalGetTransactionMergeableChanges(
        withHashes,
      ) as unknown as MergeableChanges<withHashes>;

    const authorizedTablesObj: any = {};
    objForEach(tablesStamp[0], (tableStamp, tableId) => {
      const tableSchemaDef = expandedSchema[tableId];
      if (!tableSchemaDef) {
        logger(
          `getTransactionMergeableChanges: Table "${tableId}" has no schema, allowing`,
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
          `getTransactionMergeableChanges: Table "${tableId}" blocked by ` +
            `auth rule "${tableAuthRule}"`,
        );
        return; // Skip table
      }
      if (tableAuthRule) {
        logger(
          `getTransactionMergeableChanges: Table "${tableId}" authorized by ` +
            `rule "${tableAuthRule}"`,
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
              `getTransactionMergeableChanges: Cell "${tableId}.${rowId}.` +
                `${cellId}" blocked by auth rule "${cellAuthRule}"`,
            );
            return; // Skip cell
          }
          authorizedCellStampsObj[cellId] = cellStamp;
        });

        if (!objIsEmpty(authorizedCellStampsObj)) {
          authorizedRowStampsObj[rowId] =
            rowHash !== undefined
              ? [authorizedCellStampsObj, rowHlc, rowHash]
              : [authorizedCellStampsObj, rowHlc];
        }
      });

      if (!objIsEmpty(authorizedRowStampsObj)) {
        authorizedTablesObj[tableId] =
          tableHash !== undefined
            ? [authorizedRowStampsObj, tableHlc, tableHash]
            : [authorizedRowStampsObj, tableHlc];
      }
    });

    const authorizedTablesStamp =
      tablesStamp.length > 2
        ? ([authorizedTablesObj, tablesStamp[1], tablesStamp[2]] as any)
        : ([authorizedTablesObj, tablesStamp[1]] as any);

    logger('getTransactionMergeableChanges: Authorization complete', {
      authorizedTableCount: Object.keys(authorizedTablesObj).length,
    });

    return [
      authorizedTablesStamp,
      valuesStamp,
      one,
    ] as MergeableChanges<withHashes>;
  };

  return {
    ...store,
    getMergeableTableDiff,
    getMergeableRowDiff,
    getMergeableCellDiff,
    getTransactionMergeableChanges,
  } as unknown as MergeableStoreEnhanced;
};
