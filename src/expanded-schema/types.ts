/* eslint-disable max-len */
import type {serverFunctions} from './serverFunctions/index.ts';

export type TablesSchema = {
  [tableId: string]: {[cellId: string]: CellSchema};
};
export type MetaType =
  | 'date'
  | 'datetime'
  | 'time'
  | 'duration'
  | 'color'
  | 'email'
  | 'file'
  | 'image';
export type CellSchemaBase = {
  id?: string;
  metatype?: MetaType;
  readonly?: boolean;
  hidden?: boolean;
  required?: boolean;
  references?: TablesSchema[string];
  authorization?: AuthorizationConfig;
};
export type CellSchema =
  | (CellSchemaBase & {
      type: 'string';
      default?: string;
      defaultServerFunction?: {
        fn: keyof typeof serverFunctions.defaults;
        updateType: ('insert' | 'update')[];
      };
    })
  | (CellSchemaBase & {type: 'number'; default?: number})
  | (CellSchemaBase & {type: 'boolean'; default?: boolean});

export type TablesSchemaWithOptions = {
  schema: TablesSchema;
  displayTemplate: string;
};

//products has many flavors stored in a field called flavors and flavors has many products stored in a field called products
export type Relation = {
  table: string;
  type: 'many' | 'one';
  field: string;
  relatedTable: string;
  relatedField: string;
  relatedType: 'many' | 'one';
  relationKey: string;
};

// Authorization types
export type AuthOperation = 'create' | 'read' | 'update' | 'delete';

export type AuthorizationConfig = Partial<Record<AuthOperation, string>>;

export type TableAuthorizationConfig = Partial<Record<AuthOperation, string>>;
