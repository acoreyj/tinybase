/* eslint-disable max-len */
import type {Cell, CellOrUndefined, TablesSchema} from '../../store/index.d.ts';

// ============================================================================
// Server Functions Types
// ============================================================================

export type AuthContext = {
  userId?: string;
  userRole?: string;
  isAuthenticated: boolean;
  [key: string]: any;
};

export type AuthFunctionName =
  | 'isAdmin'
  | 'isAuthenticated'
  | 'isOwner'
  | 'hasRole'
  | 'allowAll'
  | 'denyAll';

// ============================================================================
// Base Schema Types
// ============================================================================

export type MetaType =
  | 'date'
  | 'datetime'
  | 'time'
  | 'duration'
  | 'color'
  | 'email'
  | 'file'
  | 'image';

export type AuthOperation = 'create' | 'read' | 'update' | 'delete';

export type AuthorizationConfig = Partial<Record<AuthOperation, string>>;

export type TableAuthorizationConfig = Partial<Record<AuthOperation, string>>;

export type CellSchemaBase = {
  id?: string;
  metatype?: MetaType;
  readonly?: boolean;
  hidden?: boolean;
  required?: boolean;
  references?: TablesSchema[string];
  authorization?: AuthorizationConfig;
};

export type CellSchemaExtended =
  | (CellSchemaBase & {
      type: 'string';
      default?: string;
      defaultServerFunction?: {
        fn: string;
        updateType: ('insert' | 'update')[];
      };
    })
  | (CellSchemaBase & {type: 'number'; default?: number})
  | (CellSchemaBase & {type: 'boolean'; default?: boolean});

export type TablesSchemaWithOptions = {
  schema: TablesSchema;
  displayTemplate: string;
};

export type Relation = {
  table: string;
  type: 'many' | 'one';
  field: string;
  relatedTable: string;
  relatedField: string;
  relatedType: 'many' | 'one';
  relationKey: string;
};

// ============================================================================
// Schema Builder Types
// ============================================================================

export type RuntimeType = 'string' | 'number' | 'boolean';

export type SchemaBuilderBase<T extends Cell, RT extends RuntimeType> = {
  default: <D extends CellOrUndefined>(
    value: D | (() => D),
  ) => SchemaBuilderBase<T, RT> & {defaultValue: D} & {runtimeType: RT};
  defaultServerFunction: (
    value: string,
    updateType?: ('insert' | 'update')[],
  ) => SchemaBuilderBase<T, RT> & {runtimeType: RT};
  $type: <U extends Cell>() => SchemaBuilderBase<U, RT> & {runtimeType: RT};
  hidden: () => SchemaBuilderBase<T, RT> & {runtimeType: RT};
  readonly: () => SchemaBuilderBase<T, RT> & {runtimeType: RT};
  required: () => SchemaBuilderBase<T, RT> & {runtimeType: RT};
  references: (field: TablesSchema[string]) => SchemaBuilderBase<T, RT> & {
    runtimeType: RT;
  };
  authorize: (
    config: AuthorizationConfig,
  ) => SchemaBuilderBase<T, RT> & {runtimeType: RT};
  schemaType: T;
  defaultValue?: CellOrUndefined;
  defaultValueFn?: {
    fn: string;
    updateType: ('insert' | 'update')[];
  };
  id?: string;
  _type: T;
  runtimeType: 'string' | 'number' | 'boolean';
  _hidden?: boolean;
  _readonly?: boolean;
  _required?: boolean;
  metatype?: MetaType;
  _references?: TablesSchema[string];
  _authorization?: AuthorizationConfig;
};

export type RemoteRowIdGetter = (
  getCell: (cellId: string) => CellOrUndefined,
  localRowId: string,
) => string;

export type InferSelectModel<
  T extends Record<string, SchemaBuilderBase<any, any>>,
> = {
  [K in keyof T]: T[K]['_type'];
};

export type InferTinybaseSchema<
  TTableName extends string,
  T extends Record<string, SchemaBuilderBase<Cell, RuntimeType>>,
> = {
  readonly [TableName in TTableName]: {
    readonly [K in keyof T]: T[K] extends {defaultValue: infer D}
      ? D extends undefined
        ? {readonly type: T[K]['runtimeType']}
        : {
            readonly type: T[K]['runtimeType'];
            readonly default?: D;
          }
      : {readonly type: T[K]['runtimeType']};
  };
};

export type SchemaDefinition<
  TableName extends string = string,
  T extends Record<string, SchemaBuilderBase<Cell, RuntimeType>> = Record<
    string,
    SchemaBuilderBase<Cell, RuntimeType>
  >,
> = {
  schema: {
    schema: TablesSchema;
    displayTemplate: string;
    tableAuthorization?: TableAuthorizationConfig;
  };
  tinybaseSchema: InferTinybaseSchema<TableName, T>;
  displayTemplate: string;
  $inferSelect: InferSelectModel<T>;
  $tinybaseSchemaType: InferTinybaseSchema<TableName, T>;
  tableAuthorization?: TableAuthorizationConfig;
};

export type FullGenieSchema<
  TableName extends string,
  T extends Record<string, SchemaBuilderBase<any, any>>,
> = SchemaDefinition<TableName, T>;

// ============================================================================
// Schema Builder Functions
// ============================================================================

export function text(id?: string): SchemaBuilderBase<string, 'string'>;

export function date(id?: string): SchemaBuilderBase<string, 'string'>;

export function datetime(id?: string): SchemaBuilderBase<string, 'string'>;

export function number(id?: string): SchemaBuilderBase<number, 'number'>;

export function boolean(id?: string): SchemaBuilderBase<boolean, 'boolean'>;

export function image(id?: string): SchemaBuilderBase<string, 'string'>;

export function createSchema<
  TableName extends string,
  T extends Record<string, SchemaBuilderBase<any, any>>,
>(
  tableName: TableName,
  schema: T,
  displayTemplate?: string,
  tableAuthorization?: TableAuthorizationConfig,
): SchemaDefinition<TableName, T>;

export function relations(
  table: SchemaDefinition<any, any>,
  field: string,
  type: 'many' | 'one',
  relatedTable: SchemaDefinition<any, any>,
  relatedField: string,
  relatedType: 'many' | 'one',
): [Relation, Relation];

// ============================================================================
// Schema Exports
// ============================================================================

export function getUserSchema(
  userId?: string,
): SchemaDefinition<string, Record<string, SchemaBuilderBase<any, any>>>;

export const productSchema: SchemaDefinition<
  'product',
  Record<string, SchemaBuilderBase<any, any>>
>;

export const testSchema: SchemaDefinition<
  'test',
  Record<string, SchemaBuilderBase<any, any>>
>;

export const genieSchema: SchemaDefinition<
  'genieSchema',
  Record<string, SchemaBuilderBase<any, any>>
>;

export const schemas: {
  users: SchemaDefinition<string, Record<string, SchemaBuilderBase<any, any>>>;
  product: SchemaDefinition<
    'product',
    Record<string, SchemaBuilderBase<any, any>>
  >;
  test: SchemaDefinition<'test', Record<string, SchemaBuilderBase<any, any>>>;
  table: SchemaDefinition<'table', Record<string, SchemaBuilderBase<any, any>>>;
  anotherTable: SchemaDefinition<
    'anotherTable',
    Record<string, SchemaBuilderBase<any, any>>
  >;
  genieSchema: SchemaDefinition<
    'genieSchema',
    Record<string, SchemaBuilderBase<any, any>>
  >;
};
