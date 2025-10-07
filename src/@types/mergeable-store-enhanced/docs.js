/* eslint-disable max-len */
/**
 * The mergeable-store-enhanced module provides an enhanced version of
 * MergeableStore with asynchronous authorization capabilities for secure data
 * synchronization.
 *
 * This module extends the standard MergeableStore by adding authorization
 * checks at the table, row, and cell levels during synchronization operations.
 * It uses schema definitions with authorization rules to control which data can
 * be read during merge and diff operations.
 *
 * The main entry point to this module is the createMergeableStoreEnhanced
 * function, which returns a MergeableStoreEnhanced instance with async
 * authorization support.
 * @packageDocumentation
 * @module mergeable-store-enhanced
 * @since v1.0.0
 */
/// mergeable-store-enhanced
/**
 * The MergeableStoreEnhanced interface extends the standard MergeableStore
 * with asynchronous authorization capabilities.
 *
 * This interface modifies the diff methods (getMergeableTableDiff,
 * getMergeableRowDiff, and getMergeableCellDiff) to return Promises, allowing
 * for asynchronous authorization checks during synchronization.
 *
 * Authorization rules defined in the schema are evaluated before returning
 * data, ensuring that only authorized content is synchronized between stores.
 * @example
 * This example shows basic usage of MergeableStoreEnhanced with authorization:
 *
 * ```js
 * import {createMergeableStoreEnhanced} from 'tinybase/mergeable-store-enhanced';
 * import {schemas} from './my-schemas';
 * import {serverFunctions} from './server-functions';
 *
 * const store = createMergeableStoreEnhanced(
 *   'store1',
 *   schemas,
 *   serverFunctions,
 *   async () => ({
 *     userId: 'user123',
 *     userRole: 'admin',
 *     isAuthenticated: true,
 *   }),
 * );
 *
 * // Use like a normal MergeableStore, but with authorization
 * store.setCell('pets', 'fido', 'color', 'brown');
 *
 * // Diff methods are now async and respect authorization
 * const [newTables, differingHashes] = await store.getMergeableTableDiff(
 *   otherStore.getMergeableTableHashes(),
 * );
 * ```
 * @category Enhanced
 * @since v1.0.0
 */
/// MergeableStoreEnhanced
{
  /**
   * The getMergeableTableDiff method returns information about new and
   * differing Table objects, with asynchronous authorization support.
   *
   * Unlike the standard MergeableStore method, this returns a Promise and
   * filters the results based on table-level and cell-level authorization
   * rules defined in the schema.
   * @param otherTableHashes The TableHashes of another MergeableStore.
   * @returns A Promise resolving to a pair of objects describing the
   * authorized new and differing Table objects.
   * @example
   * This example shows how authorization filters table diffs:
   *
   * ```js
   * import {createMergeableStoreEnhanced} from 'tinybase/mergeable-store-enhanced';
   *
   * const store1 = createMergeableStoreEnhanced(
   *   'store1',
   *   schemas,
   *   serverFunctions,
   *   async () => ({ userRole: 'guest', isAuthenticated: true }),
   * );
   *
   * store1.setCell('adminTable', 'row1', 'secret', 'data');
   *
   * const store2 = createMergeableStoreEnhanced('store2', schemas, serverFunctions);
   *
   * // Only authorized tables will be included in the diff
   * const [newTables, differingHashes] = await store1.getMergeableTableDiff(
   *   store2.getMergeableTableHashes(),
   * );
   * ```
   * @category Syncing
   * @since v1.0.0
   */
  /// MergeableStoreEnhanced.getMergeableTableDiff
  /**
   * The getMergeableRowDiff method returns information about new and differing
   * Row objects, with asynchronous authorization support.
   *
   * This method filters results based on table-level and cell-level
   * authorization rules, returning only rows that the current user is
   * authorized to read.
   * @param otherTableRowHashes The RowHashes of another MergeableStore.
   * @returns A Promise resolving to a pair of objects describing the
   * authorized new and differing Row objects.
   * @example
   * This example demonstrates row-level authorization during synchronization:
   *
   * ```js
   * import {createMergeableStoreEnhanced} from 'tinybase/mergeable-store-enhanced';
   *
   * const adminStore = createMergeableStoreEnhanced(
   *   'admin',
   *   schemas,
   *   serverFunctions,
   *   async () => ({ userRole: 'admin', isAuthenticated: true }),
   * );
   *
   * const guestStore = createMergeableStoreEnhanced(
   *   'guest',
   *   schemas,
   *   serverFunctions,
   *   async () => ({ userRole: 'guest', isAuthenticated: true }),
   * );
   *
   * // Guest can only see authorized rows
   * const [newRows, differingHashes] = await guestStore.getMergeableRowDiff(
   *   adminStore.getMergeableRowHashes),
   * );
   * ```
   * @category Syncing
   * @since v1.0.0
   */
  /// MergeableStoreEnhanced.getMergeableRowDiff
  /**
   * The getMergeableCellDiff method returns information about new and
   * differing Cell objects, with asynchronous authorization support.
   *
   * Cell-level authorization rules are evaluated to ensure only authorized
   * cells are returned in the diff.
   * @param otherTableRowCellHashes The CellHashes of another MergeableStore.
   * @returns A Promise resolving to the authorized new and differing Cell
   * objects.
   * @example
   * This example shows cell-level authorization in action:
   *
   * ```js
   * import {createMergeableStoreEnhanced} from 'tinybase/mergeable-store-enhanced';
   *
   * const store1 = createMergeableStoreEnhanced(
   *   'store1',
   *   schemas,
   *   serverFunctions,
   *   async () => ({ userRole: 'user', isAuthenticated: true }),
   * );
   *
   * // Some cells may have read restrictions
   * const cellDiff = await store1.getMergeableCellDiff(
   *   store2.getMergeableCellHashes(),
   * );
   * // Only cells the user can read are included
   * ```
   * @category Syncing
   * @since v1.0.0
   */
  /// MergeableStoreEnhanced.getMergeableCellDiff
  /**
   * The getTransactionMergeableChanges method returns the mergeable changes
   * made during a transaction, with authorization support.
   *
   * This method filters the transaction changes based on table-level and
   * cell-level authorization rules, returning only changes that the current
   * user is authorized to read. Authorization filtering works with both
   * hashed and non-hashed changes.
   * @param withHashes Whether to include hashes in the changes (optional).
   * @returns The authorized mergeable changes from the transaction.
   * @example
   * This example shows getting transaction changes with authorization:
   *
   * ```js
   * import {createMergeableStoreEnhanced} from 'tinybase/mergeable-store-enhanced';
   *
   * const store = createMergeableStoreEnhanced(
   *   'store1',
   *   schemas,
   *   serverFunctions,
   *   () => ({ userRole: 'user', isAuthenticated: true }),
   * );
   *
   * store.transaction(() => {
   *   store.setCell('pets', 'fido', 'color', 'brown');
   *   store.setCell('secrets', 'row1', 'password', 'secret123');
   * });
   *
   * // Only authorized changes are included
   * const changes = store.getTransactionMergeableChanges();
   * // User may not see the 'secrets' table changes if unauthorized
   *
   * // With hashes for synchronization
   * const changesWithHashes = store.getTransactionMergeableChanges(true);
   * // Authorization still applies even with hashes
   * ```
   * @category Syncing
   * @since v1.0.0
   */
  /// MergeableStoreEnhanced.getTransactionMergeableChanges
}
/**
 * The ServerFunctions type defines the structure for server-side functions
 * used in authorization and default value generation.
 *
 * It contains two main categories:
 * - defaults: Functions that generate default values for cells.
 * - authorization: Functions that determine if operations are allowed.
 * @category Authorization
 * @since v1.0.0
 */
/// ServerFunctions
/**
 * The createMergeableStoreEnhanced function creates a MergeableStoreEnhanced
 * instance with authorization capabilities.
 *
 * This is the main entry point for creating an enhanced mergeable store that
 * supports asynchronous authorization checks during synchronization.
 * @param uniqueId An optional unique Id for the MergeableStore.
 * @param expandedSchema Schema definitions with authorization configuration.
 * @param serverFunctions Server-side functions for defaults and authorization.
 * @param getAuthContext Function to retrieve the current authentication context.
 * @param log Optional logging function for debugging authorization decisions.
 * @returns A MergeableStoreEnhanced instance.
 * @example
 * This example creates a MergeableStoreEnhanced with full configuration:
 *
 * ```js
 * import {createMergeableStoreEnhanced} from 'tinybase/mergeable-store-enhanced';
 * import {schemas} from './schemas';
 * import {serverFunctions} from './server-functions';
 *
 * const store = createMergeableStoreEnhanced(
 *   'store1',
 *   schemas,
 *   serverFunctions,
 *   async () => ({
 *     userId: 'user123',
 *     userRole: 'admin',
 *     isAuthenticated: true,
 *   }),
 *   (message, data) => console.log(message, data),
 * );
 *
 * store.setCell('pets', 'fido', 'color', 'brown');
 * console.log(store.getContent());
 * // -> [{pets: {fido: {color: 'brown'}}}, {}]
 * ```
 * @example
 * This example shows authorization in action during synchronization:
 *
 * ```js
 * import {createMergeableStoreEnhanced} from 'tinybase/mergeable-store-enhanced';
 *
 * const adminStore = createMergeableStoreEnhanced(
 *   'admin',
 *   schemas,
 *   serverFunctions,
 *   async () => ({ userRole: 'admin', isAuthenticated: true }),
 * );
 *
 * const userStore = createMergeableStoreEnhanced(
 *   'user',
 *   schemas,
 *   serverFunctions,
 *   async () => ({ userRole: 'user', isAuthenticated: true }),
 * );
 *
 * adminStore.setCell('secrets', 'row1', 'password', 'admin123');
 * userStore.setCell('pets', 'fido', 'color', 'brown');
 *
 * // Merge with authorization - user won't see admin secrets
 * const [newTables] = await userStore.getMergeableTableDiff(
 *   adminStore.getMergeableTableHashes(),
 * );
 *
 * // Only authorized data is included
 * console.log(newTables);
 * ```
 * @category Creation
 * @since v1.0.0
 */
/// createMergeableStoreEnhanced

