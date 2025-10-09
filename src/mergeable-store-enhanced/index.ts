/* eslint-disable max-len */
import type {Id} from '../@types/common/index.d.ts';
import type {
  CellHashes,
  MergeableChanges,
  MergeableStore,
  RowHashes,
  TableHashes,
  TablesStamp,
} from '../@types/mergeable-store/index.d.ts';
import {
  filterMergeableChanges,
  filterRowHashesRead,
  filterTableHashesRead,
  filterTablesStampRead,
} from '../common/authorizer.ts';
import type {SchemaDefinition} from '../expanded-schema/schemaCreator.ts';
import type {AuthContext} from '../expanded-schema/serverFunctions/authorization.ts';
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
    logger('getMergeableTableDiff: Auth context retrieved', {
      // authContext
    });

    const [newTables, differingTableHashes] =
      originalGetMergeableTableDiff(otherTableHashes);

    logger('getMergeableTableDiff: Raw diff computed', {
      newTableCount: Object.keys(newTables[0]).length,
      differingTableCount: Object.keys(differingTableHashes).length,
    });

    const authorizedNewTables = filterTablesStampRead(
      newTables,
      expandedSchema,
      serverFunctions,
      authContext,
      logger,
    );

    const finalDifferingTableHashes = filterTableHashesRead(
      differingTableHashes,
      expandedSchema,
      serverFunctions,
      authContext,
      logger,
    );

    logger('getMergeableTableDiff: Authorization complete', {
      authorizedTableCount: Object.keys(authorizedNewTables[0]).length,
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
    logger('getMergeableRowDiff: Auth context retrieved', {
      // authContext
    });

    const [newRows, differingRowHashes] =
      originalGetMergeableRowDiff(otherTableRowHashes);

    logger('getMergeableRowDiff: Raw diff computed', {
      newRowTableCount: Object.keys(newRows[0]).length,
      differingRowTableCount: Object.keys(differingRowHashes).length,
    });

    const authorizedNewRows = filterTablesStampRead(
      newRows,
      expandedSchema,
      serverFunctions,
      authContext,
      logger,
    );

    logger('getMergeableRowDiff: New rows authorization complete', {
      authorizedTableCount: Object.keys(authorizedNewRows[0]).length,
    });

    const authorizedDifferingRowHashes = filterRowHashesRead(
      differingRowHashes,
      expandedSchema,
      serverFunctions,
      authContext,
      logger,
    );

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
    logger('getMergeableCellDiff: Auth context retrieved', {
      // authContext
    });

    const resultTablesStamp = originalGetMergeableCellDiff(
      otherTableRowCellHashes,
    );

    logger('getMergeableCellDiff: Raw diff computed', {
      tableCount: Object.keys(resultTablesStamp[0]).length,
    });

    const authorizedTablesStamp = filterTablesStampRead(
      resultTablesStamp,
      expandedSchema,
      serverFunctions,
      authContext,
      logger,
    );

    logger('getMergeableCellDiff: Authorization complete', {
      authorizedTableCount: Object.keys(authorizedTablesStamp[0]).length,
    });

    return authorizedTablesStamp;
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
      // authContext,
    });

    const changes = originalGetTransactionMergeableChanges(
      withHashes,
    ) as unknown as MergeableChanges<withHashes>;

    const filtered = filterMergeableChanges(
      changes,
      expandedSchema,
      serverFunctions,
      authContext,
      logger,
    );

    logger('getTransactionMergeableChanges: Authorization complete', {
      authorizedTableCount: Object.keys(filtered[0][0]).length,
    });

    return filtered;
  };

  return {
    ...store,
    getMergeableTableDiff,
    getMergeableRowDiff,
    getMergeableCellDiff,
    getTransactionMergeableChanges,
  } as unknown as MergeableStoreEnhanced;
};
