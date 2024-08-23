/**
 * The persister-d1 module of the TinyBase project lets you save and load
 * Store data to and from a cloudflare D1 database.
 * @see Database Persistence guide
 * @packageDocumentation
 * @module persister-d1
 * @since v5.6.0
 */
/// persister-d1
/**
 * The D1Persister interface represents a Persister that lets you save and
 * load Store data to and from a cloudflare D1.
 *
 * You should use the createD1Persister function to create a D1Persister
 * object.
 *
 * It is a minor extension to the Persister interface and simply provides an
 * extra getClient method for accessing a reference to the database client the
 * Store is being persisted to.
 * @category Persister
 * @since v5.6.0
 */
/// D1Persister
{
  /**
   * The getClient method returns a reference to the database client the Store
   * is being persisted to.
   * @returns A reference to the database client.
   * @example
   * This example creates a Persister object against a newly-created Store and
   * then gets the database client back out again.
   *
   * ```js yolo
   * import {createD1Persister} from 'tinybase/persisters/persister-d1';
   * import {createStore} from 'tinybase';
   *
   * const persister = createD1Persister(store, env.DB, 'my_tinybase');
   *
   * console.log(persister.getDB() == env.DB);
   * // -> true
   *
   * persister.destroy();
   * ```
   * @category Getter
   * @since v5.6.0
   */
  /// D1Persister.getClient
}
/**
 * The createD1Persister function creates a D1Persister object that can
 * persist a Store to a cloudflare D1.
 *
 * A D1Persister only supports regular Store objects, and cannot be used to
 * persist the metadata of a MergeableStore.
 *
 *
 * A database Persister uses one of two modes: either a JSON serialization of
 * the whole Store stored in a single row of a table (the default), or a tabular
 * mapping of Table Ids to database table names and vice-versa).
 *
 * The third argument is a DatabasePersisterConfig object that configures which
 * of those modes to use, and settings for each. If the third argument is simply
 * a string, it is used as the `storeTableName` property of the JSON
 * serialization.
 *
 * See the documentation for the DpcJson and DpcTabular types for more
 * information on how both of those modes can be configured.
 * @param store The Store to persist.
 * @param client The database client that was returned from `createClient(...)`.
 * @param configOrStoreTableName A DatabasePersisterConfig to configure the
 * persistence mode (or a string to set the `storeTableName` property of the
 * JSON serialization).
 * @param onSqlCommand An optional handler called every time the Persister
 * executes a SQL command or query. This is suitable for logging persistence
 * behavior in a development environment.
 * @param onIgnoredError An optional handler for the errors that the Persister
 * would otherwise ignore when trying to save or load data. This is suitable for
 * debugging persistence issues in a development environment.
 * @returns A reference to the new D1Persister object.
 * @example
 * This example creates a D1Persister object and persists the Store to a
 * local SQLite database as a JSON serialization into the `my_tinybase` table.
 * It makes a change to the database directly and then reloads it back into the
 * Store.
 *
 * ```js yolo
 * import {createD1Persister} from 'tinybase/persisters/persister-d1';
 * import {createStore} from 'tinybase';
 *
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createD1Persister(store, env.DB, 'my_tinybase');
 *
 * await persister.save();
 * // Store will be saved to the database.
 *
 * console.log((await client.execute('SELECT * FROM my_tinybase;')).rows);
 * // -> [{_id: '_', store: '[{"pets":{"fido":{"species":"dog"}}},{}]'}]
 *
 * await client.execute(
 *   'UPDATE my_tinybase SET store = ' +
 *     `'[{"pets":{"felix":{"species":"cat"}}},{}]' WHERE _id = '_';`,
 * );
 * await persister.load();
 * console.log(store.getTables());
 * // -> {pets: {felix: {species: 'cat'}}}
 *
 * persister.destroy();
 * ```
 * @example
 * This example creates a D1Persister object and persists the Store to a
 * local SQLite database with tabular mapping.
 *
 * ```js yolo
 * import {createClient} from '@libsql/client';
 * import {createD1Persister} from 'tinybase/persisters/persister-d1';
 * import {createStore} from 'tinybase';
 *
 * const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
 * const persister = createD1Persister(store, env.DB, {
 *   mode: 'tabular',
 *   tables: {load: {pets: 'pets'}, save: {pets: 'pets'}},
 * });
 *
 * await persister.save();
 * console.log((await client.execute('SELECT * FROM pets;')).rows);
 * // -> [{_id: 'fido', species: 'dog'}]
 *
 * await client.execute(
 *   `INSERT INTO pets (_id, species) VALUES ('felix', 'cat')`,
 * );
 * await persister.load();
 * console.log(store.getTables());
 * // -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}
 *
 * persister.destroy();
 * ```
 * @category Creation
 * @since v5.6.0
 */
/// createD1Persister
