import type {Id} from '../../common/index.d.ts';
import type {
  AuthContext,
  SchemaDefinition,
} from '../../expanded-schema/index.d.ts';
import type {
  CellHashes,
  MergeableChanges,
  MergeableStore,
  RowHashes,
  TableHashes,
  TablesStamp,
} from '../../mergeable-store/index.d.ts';

// ============================================================================
// MergeableStoreEnhanced Interface
// ============================================================================

/**
 * Enhanced version of MergeableStore that adds async authorization capabilities
 * to the diff methods.
 */
export interface MergeableStoreEnhanced
  extends Omit<
    MergeableStore,
    | 'getMergeableTableDiff'
    | 'getMergeableRowDiff'
    | 'getMergeableCellDiff'
    | 'getTransactionMergeableChanges'
  > {
  /**
   * Get mergeable table diff with async authorization support.
   *
   * @param otherTableHashes - Table hashes from another store
   * @returns [newTables, differingTableHashes]
   */
  getMergeableTableDiff(
    otherTableHashes: TableHashes,
  ): [newTables: TablesStamp, differingTableHashes: TableHashes];

  /**
   * Get mergeable row diff with async authorization support.
   *
   * @param otherTableRowHashes - Row hashes from another store
   * @returns [newRows, differingRowHashes]
   */
  getMergeableRowDiff(
    otherTableRowHashes: RowHashes,
  ): [newRows: TablesStamp, differingRowHashes: RowHashes];

  /**
   * Get mergeable cell diff with async authorization support.
   *
   * @param otherTableRowCellHashes - Cell hashes from another store
   * @returns TablesStamp
   */
  getMergeableCellDiff(otherTableRowCellHashes: CellHashes): TablesStamp;

  /**
   * Get transaction mergeable changes with authorization support.
   *
   * @param withHashes - Whether to include hashes in the changes
   * @returns MergeableChanges
   */
  getTransactionMergeableChanges<withHashes extends boolean>(
    withHashes?: withHashes,
  ): MergeableChanges<withHashes>;
}

// ============================================================================
// Server Functions Type
// ============================================================================

export type ServerFunctions = {
  defaults: Record<string, (...args: any[]) => any>;
  authorization: Record<
    string,
    (context: AuthContext, ...args: any[]) => boolean
  >;
};

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Creates an enhanced mergeable store with authorization capabilities.
 *
 * @param uniqueId - Unique identifier for the store
 * @param expandedSchema - Schema definitions with authorization config
 * @param serverFunctions - Server-side functions for defaults and authorization
 * @param getAuthContext - Function to retrieve current auth context
 * @param log - Optional logging function
 * @returns Enhanced mergeable store instance
 */
export function createMergeableStoreEnhanced(
  uniqueId: Id | undefined,
  expandedSchema: Record<string, SchemaDefinition<any, any>>,
  serverFunctions: ServerFunctions,
  getAuthContext: () => AuthContext,
  log?: (message: string, data?: any) => void,
): MergeableStoreEnhanced;
