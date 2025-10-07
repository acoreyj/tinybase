/**
 * The expanded-schema module provides a schema builder system for defining
 * TinyBase table structures with enhanced features including authorization,
 * metadata types, server-side defaults, and type inference.
 *
 * This module allows you to define schemas using a fluent builder API similar
 * to popular ORMs, while generating both rich schema definitions (with
 * authorization and metadata) and simplified TinyBase-compatible schemas.
 *
 * The main entry point is the createSchema function, along with schema builder
 * functions like text(), number(), boolean(), datetime(), etc.
 * @packageDocumentation
 * @module expanded-schema
 * @since v1.0.0
 */
/// expanded-schema
/**
 * The MetaType type defines additional semantic types for cells beyond the
 * basic TinyBase types.
 *
 * These metadata types provide hints for UI components and validation:
 * - 'date': Date without time
 * - 'datetime': Date with time
 * - 'time': Time of day
 * - 'duration': Time duration
 * - 'color': Color value
 * - 'email': Email address
 * - 'file': File reference
 * - 'image': Image reference
 * @category Schema
 * @since v1.0.0
 */
/// MetaType
/**
 * The AuthOperation type defines the types of operations that can be
 * authorized in a schema.
 *
 * These correspond to CRUD operations:
 * - 'create': Creating new rows
 * - 'read': Reading data
 * - 'update': Updating existing data
 * - 'delete': Deleting data
 * @category Authorization
 * @since v1.0.0
 */
/// AuthOperation
/**
 * The AuthorizationConfig type defines authorization rules for individual
 * cells.
 *
 * It maps each AuthOperation to the name of an authorization function that
 * determines if the operation is allowed.
 * @example
 * This example shows cell-level authorization:
 *
 * ```js
 * import {createSchema, text} from 'tinybase/expanded-schema';
 *
 * const schema = createSchema('users', {
 *   username: text(),
 *   email: text().authorize({
 *     read: 'isOwner',
 *     update: 'isOwner',
 *   }),
 *   password: text().authorize({
 *     read: 'denyAll',
 *     update: 'isOwner',
 *   }),
 * });
 * ```
 * @category Authorization
 * @since v1.0.0
 */
/// AuthorizationConfig
/**
 * The TableAuthorizationConfig type defines authorization rules for entire
 * tables.
 *
 * Similar to AuthorizationConfig, but applies to table-level operations.
 * @example
 * This example shows table-level authorization:
 *
 * ```js
 * import {createSchema, text} from 'tinybase/expanded-schema';
 *
 * const schema = createSchema(
 *   'adminTable',
 *   {
 *     id: text().required(),
 *     secret: text(),
 *   },
 *   undefined,
 *   {
 *     create: 'isAdmin',
 *     read: 'isAdmin',
 *     update: 'isAdmin',
 *     delete: 'isAdmin',
 *   },
 * );
 * ```
 * @category Authorization
 * @since v1.0.0
 */
/// TableAuthorizationConfig
/**
 * The AuthContext type represents the authentication context passed to
 * authorization functions.
 *
 * It contains information about the current user and can be extended with
 * custom properties.
 * @category Authorization
 * @since v1.0.0
 */
/// AuthContext
/**
 * The AuthFunctionName type is a union of all available authorization function
 * names.
 *
 * Standard functions include:
 * - 'isAdmin': Check if user is admin
 * - 'isAuthenticated': Check if user is authenticated
 * - 'isOwner': Check if user owns the resource
 * - 'hasRole': Check if user has a specific role
 * - 'allowAll': Allow all operations
 * - 'denyAll': Deny all operations
 * @category Authorization
 * @since v1.0.0
 */
/// AuthFunctionName
/**
 * The CellSchemaBase type defines the common properties for all cell schema
 * definitions.
 *
 * This includes optional properties like:
 * - id: Alternative column identifier
 * - metatype: Semantic type hint
 * - readonly: Prevent updates after creation
 * - hidden: Hide from UI
 * - required: Must have a value
 * - references: Foreign key reference
 * - authorization: Cell-level authorization rules
 * @category Schema
 * @since v1.0.0
 */
/// CellSchemaBase
/**
 * The CellSchemaExtended type represents the full schema definition for a
 * cell, including type and default value.
 *
 * It supports three basic types: string, number, and boolean, each with
 * optional default values and server-side default functions.
 * @category Schema
 * @since v1.0.0
 */
/// CellSchemaExtended

/**
 * The Relation type defines a relationship between two tables.
 *
 * It supports one-to-many and many-to-many relationships with bidirectional
 * references.
 * @category Schema
 * @since v1.0.0
 */
/// Relation
/**
 * The RuntimeType type represents the JavaScript runtime types supported by
 * the schema system.
 *
 * These map to TinyBase cell types: 'string', 'number', or 'boolean'.
 * @category Schema
 * @since v1.0.0
 */
/// RuntimeType
/**
 * The SchemaBuilderBase type represents the fluent builder interface for
 * defining cell schemas.
 *
 * It provides methods for chaining schema properties like default values,
 * required fields, authorization, etc.
 * @category Schema Builder
 * @since v1.0.0
 */
/// SchemaBuilderBase
/**
 * The SchemaDefinition type represents the complete schema definition returned
 * by createSchema.
 *
 * It includes both the rich internal schema and the simplified TinyBase
 * schema, along with type inference helpers.
 * @category Schema
 * @since v1.0.0
 */
/// SchemaDefinition
/**
 * The text function creates a schema builder for string cells.
 *
 * Optionally accepts an alternative column ID.
 * @param id Optional alternative column identifier.
 * @returns A SchemaBuilderBase for string cells.
 * @example
 * This example creates a string field with various options:
 *
 * ```js
 * import {createSchema, text} from 'tinybase/expanded-schema';
 *
 * const schema = createSchema('users', {
 *   username: text().required(),
 *   email: text().required(),
 *   bio: text().default(''),
 * });
 * ```
 * @category Schema Builder
 * @since v1.0.0
 */
/// text
/**
 * The date function creates a schema builder for date cells (without time).
 *
 * Returns a string schema with 'date' metatype.
 * @param id Optional alternative column identifier.
 * @returns A SchemaBuilderBase for date cells.
 * @example
 * This example creates a date field:
 *
 * ```js
 * import {createSchema, date} from 'tinybase/expanded-schema';
 *
 * const schema = createSchema('events', {
 *   eventDate: date().required(),
 * });
 * ```
 * @category Schema Builder
 * @since v1.0.0
 */
/// date
/**
 * The datetime function creates a schema builder for datetime cells.
 *
 * Returns a string schema with 'datetime' metatype. Commonly used with
 * server-side default functions for timestamps.
 * @param id Optional alternative column identifier.
 * @returns A SchemaBuilderBase for datetime cells.
 * @example
 * This example creates timestamp fields with server defaults:
 *
 * ```js
 * import {createSchema, datetime} from 'tinybase/expanded-schema';
 *
 * const schema = createSchema('posts', {
 *   createdAt: datetime()
 *     .defaultServerFunction('now', ['insert'])
 *     .readonly(),
 *   updatedAt: datetime()
 *     .defaultServerFunction('now', ['insert', 'update'])
 *     .readonly(),
 * });
 * ```
 * @category Schema Builder
 * @since v1.0.0
 */
/// datetime
/**
 * The number function creates a schema builder for numeric cells.
 *
 * Supports both integers and floating-point numbers.
 * @param id Optional alternative column identifier.
 * @returns A SchemaBuilderBase for number cells.
 * @example
 * This example creates numeric fields:
 *
 * ```js
 * import {createSchema, number} from 'tinybase/expanded-schema';
 *
 * const schema = createSchema('products', {
 *   price: number().required(),
 *   stock: number().default(0),
 *   rating: number(),
 * });
 * ```
 * @category Schema Builder
 * @since v1.0.0
 */
/// number
/**
 * The boolean function creates a schema builder for boolean cells.
 *
 * Supports true/false values with optional defaults.
 * @param id Optional alternative column identifier.
 * @returns A SchemaBuilderBase for boolean cells.
 * @example
 * This example creates boolean fields:
 *
 * ```js
 * import {createSchema, boolean} from 'tinybase/expanded-schema';
 *
 * const schema = createSchema('features', {
 *   enabled: boolean().default(false),
 *   verified: boolean().required(),
 * });
 * ```
 * @category Schema Builder
 * @since v1.0.0
 */
/// boolean
/**
 * The image function creates a schema builder for image reference cells.
 *
 * Returns a string schema with 'image' metatype for UI hints.
 * @param id Optional alternative column identifier.
 * @returns A SchemaBuilderBase for image cells.
 * @example
 * This example creates an image field:
 *
 * ```js
 * import {createSchema, image} from 'tinybase/expanded-schema';
 *
 * const schema = createSchema('profiles', {
 *   avatar: image(),
 * });
 * ```
 * @category Schema Builder
 * @since v1.0.0
 */
/// image
/**
 * The createSchema function creates a complete schema definition for a table.
 *
 * This is the main entry point for defining schemas. It accepts a table name,
 * field definitions, optional display template, and optional table-level
 * authorization.
 * @param tableName The unique identifier for the table.
 * @param schema An object mapping field names to schema builders.
 * @param displayTemplate Optional template for displaying rows (e.g., "{{name}}").
 * @param tableAuthorization Optional table-level authorization rules.
 * @returns A SchemaDefinition with both rich and TinyBase-compatible schemas.
 * @example
 * This example creates a complete schema with authorization:
 *
 * ```js
 * import {createSchema, text, datetime} from 'tinybase/expanded-schema';
 *
 * const userSchema = createSchema(
 *   'users',
 *   {
 *     id: text().required(),
 *     username: text().required(),
 *     email: text().required().authorize({update: 'isOwner'}),
 *     createdAt: datetime()
 *       .defaultServerFunction('now', ['insert'])
 *       .readonly(),
 *   },
 *   '{{username}}',
 *   {
 *     delete: 'isAdmin',
 *   },
 * );
 *
 * // Access the TinyBase schema
 * console.log(userSchema.tinybaseSchema);
 *
 * // Use with type inference
 * type User = typeof userSchema.$inferSelect;
 * ```
 * @category Schema Builder
 * @since v1.0.0
 */
/// createSchema
/**
 * The relations function defines bidirectional relationships between tables.
 *
 * Returns a pair of Relation objects representing the relationship from both
 * sides.
 * @param table The first table schema.
 * @param field The field name in the first table.
 * @param type The relationship type ('one' or 'many').
 * @param relatedTable The second table schema.
 * @param relatedField The field name in the second table.
 * @param relatedType The relationship type for the second table.
 * @returns A tuple of two Relation objects.
 * @example
 * This example defines a one-to-many relationship:
 *
 * ```js
 * import {createSchema, text, relations} from 'tinybase/expanded-schema';
 *
 * const authorSchema = createSchema('authors', {
 *   id: text().required(),
 *   name: text().required(),
 * });
 *
 * const bookSchema = createSchema('books', {
 *   id: text().required(),
 *   title: text().required(),
 *   authorId: text().required(),
 * });
 *
 * const [authorRelation, bookRelation] = relations(
 *   authorSchema,
 *   'books',
 *   'many',
 *   bookSchema,
 *   'author',
 *   'one',
 * );
 * ```
 * @category Schema Builder
 * @since v1.0.0
 */
/// relations

