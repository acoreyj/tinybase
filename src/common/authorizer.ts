/* eslint-disable max-len */
import type {
  MergeableChanges,
  RowHashes,
  RowStamp,
  TableHashes,
  TablesStamp,
} from '../@types/mergeable-store/index.d.ts';
import type {SchemaDefinition} from '../expanded-schema/schemaCreator.ts';
import type {
  AuthContext,
  AuthFunctionName,
} from '../expanded-schema/serverFunctions/authorization.ts';
import {objForEach, objIsEmpty} from './obj.ts';

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

  logger('filterMergeableChanges: Authorization complete', {
    authorizedTableCount: Object.keys(authorizedTablesObj).length,
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
