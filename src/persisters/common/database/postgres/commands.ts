import type {
  CellOrUndefined,
  Table,
  ValueOrUndefined,
} from '../../../../@types/store/index.d.ts';
import {
  IdObj,
  objDel,
  objIds,
  objIsEmpty,
  objNew,
  objToArray,
  objValues,
} from '../../../../common/obj.ts';
import {IdSet2, setAdd, setNew} from '../../../../common/set.ts';
import {SELECT, escapeId} from '../common.ts';
import {
  arrayFilter,
  arrayIsEmpty,
  arrayJoin,
  arrayMap,
  arrayNew,
  arrayPush,
} from '../../../../common/array.ts';
import {
  collClear,
  collDel,
  collHas,
  collValues,
} from '../../../../common/coll.ts';
import {isUndefined, promiseAll, size} from '../../../../common/other.ts';
import {mapEnsure, mapGet, mapNew, mapSet} from '../../../../common/map.ts';
import {COMMA} from '../../../../common/strings.ts';
import type {Id} from '../../../../@types/common/index.d.ts';

export type Cmd = (sql: string, args?: any[]) => Promise<IdObj<any>[]>;
type Schema = IdSet2;

const TABLE = 'TABLE';
const ALTER_TABLE = 'ALTER ' + TABLE;
const DELETE_FROM = 'DELETE FROM';
const SELECT_STAR_FROM = SELECT + '*FROM';
const WHERE = 'WHERE';

export const getCommandFunctions = (
  cmd: Cmd,
  managedTableNames: string[],
  onIgnoredError: ((error: any) => void) | undefined,
): [
  refreshSchema: () => Promise<void>,
  loadTable: (tableName: string, rowIdColumnName: string) => Promise<Table>,
  saveTable: (
    tableName: string,
    rowIdColumnName: string,
    content:
      | {
          [contentId: Id]:
            | {[contentSubId: Id]: CellOrUndefined | ValueOrUndefined}
            | undefined;
        }
      | undefined,
    deleteEmptyColumns: boolean,
    deleteEmptyTable: boolean,
    partial?: boolean,
  ) => Promise<void>,
  transaction: <Return>(actions: () => Promise<Return>) => Promise<Return>,
] => {
  const schemaMap: Schema = mapNew();

  const canSelect = (tableName: string, rowIdColumnName: string): boolean =>
    collHas(mapGet(schemaMap, tableName), rowIdColumnName);

  const refreshSchema = async (): Promise<void> => {
    collClear(schemaMap);
    arrayMap(
      await cmd(
        // eslint-disable-next-line max-len
        `${SELECT} table_name tn,column_name cn FROM information_schema.columns ${WHERE} table_schema='public'AND table_name IN(${getPlaceholders(managedTableNames)})`,
        managedTableNames,
      ),
      ({tn, cn}) => setAdd(mapEnsure(schemaMap, tn, setNew<Id>), cn),
    );
  };

  const loadTable = async (
    tableName: string,
    rowIdColumnName: string,
  ): Promise<Table> =>
    canSelect(tableName, rowIdColumnName)
      ? objNew(
          arrayFilter(
            arrayMap(
              await cmd(SELECT_STAR_FROM + escapeId(tableName)),
              (row) => [
                row[rowIdColumnName],
                objDel({...row}, rowIdColumnName),
              ],
            ),
            ([rowId, row]) => !isUndefined(rowId) && !objIsEmpty(row),
          ),
        )
      : {};

  const saveTable = async (
    tableName: string,
    rowIdColumnName: string,
    content:
      | {
          [contentId: Id]:
            | {[contentSubId: Id]: CellOrUndefined | ValueOrUndefined}
            | undefined;
        }
      | undefined,
    deleteEmptyColumns: boolean,
    deleteEmptyTable: boolean,
    partial = false,
  ): Promise<void> => {
    const tableCellOrValueIds = setNew<string>();
    objToArray(content ?? {}, (contentRow) =>
      arrayMap(objIds(contentRow ?? {}), (cellOrValueId) =>
        setAdd(tableCellOrValueIds, cellOrValueId),
      ),
    );
    const tableColumnNames = collValues(tableCellOrValueIds);

    // Delete the table
    if (
      !partial &&
      deleteEmptyTable &&
      arrayIsEmpty(tableColumnNames) &&
      collHas(schemaMap, tableName)
    ) {
      await cmd('DROP ' + TABLE + escapeId(tableName));
      mapSet(schemaMap, tableName);
      return;
    }

    // Create the table or alter or drop columns
    if (!arrayIsEmpty(tableColumnNames) && !collHas(schemaMap, tableName)) {
      await cmd(
        `CREATE ` +
          TABLE +
          escapeId(tableName) +
          '(' +
          escapeId(rowIdColumnName) +
          `text PRIMARY KEY${arrayJoin(
            arrayMap(
              tableColumnNames,
              (columnName) => COMMA + escapeId(columnName) + 'json',
            ),
          )});`,
      );
      mapSet(
        schemaMap,
        tableName,
        setNew([rowIdColumnName, ...tableColumnNames]),
      );
    } else {
      const tableSchemaColumns = mapGet(schemaMap, tableName);
      const currentColumnNames = setNew(collValues(tableSchemaColumns));
      await promiseAll([
        ...arrayMap(
          [rowIdColumnName, ...tableColumnNames],
          async (columnName, index) => {
            if (!collDel(currentColumnNames, columnName)) {
              await cmd(
                ALTER_TABLE +
                  escapeId(tableName) +
                  'ADD' +
                  escapeId(columnName) +
                  (index == 0 ? 'text' : 'json'),
              );
              if (index == 0) {
                await cmd(
                  // eslint-disable-next-line max-len
                  `CREATE UNIQUE INDEX pk ON ${escapeId(tableName)}(${escapeId(rowIdColumnName)})`,
                );
              }
              setAdd(tableSchemaColumns, columnName);
            }
          },
        ),
        ...(!partial && deleteEmptyColumns
          ? arrayMap(collValues(currentColumnNames), async (columnName) => {
              await cmd(
                ALTER_TABLE +
                  escapeId(tableName) +
                  'DROP' +
                  escapeId(columnName),
              );
              collDel(tableSchemaColumns, columnName);
            })
          : []),
      ]);
    }

    // Insert or update or delete data
    if (partial) {
      if (isUndefined(content)) {
        await cmd(DELETE_FROM + escapeId(tableName) + WHERE + ' 1');
      } else {
        await promiseAll(
          objToArray(content, async (row, rowId) => {
            if (isUndefined(row)) {
              await cmd(
                DELETE_FROM +
                  escapeId(tableName) +
                  WHERE +
                  escapeId(rowIdColumnName) +
                  '=$1',
                [rowId],
              );
            } else if (!arrayIsEmpty(tableColumnNames)) {
              await upsert(cmd, tableName, rowIdColumnName, objIds(row), [
                rowId,
                ...objValues(row),
              ]);
            }
          }),
        );
      }
    } else {
      if (!arrayIsEmpty(tableColumnNames)) {
        const changingColumnNames = arrayFilter(
          collValues(mapGet(schemaMap, tableName)),
          (columnName) => columnName != rowIdColumnName,
        );
        const args: any[] = [];
        const deleteRowIds: string[] = [];
        objToArray(content ?? {}, (row, rowId) => {
          arrayPush(
            args,
            rowId,
            ...arrayMap(changingColumnNames, (cellId) => row?.[cellId]),
          );
          arrayPush(deleteRowIds, rowId);
        });
        await upsert(
          cmd,
          tableName,
          rowIdColumnName,
          changingColumnNames,
          args,
        );
        await cmd(
          DELETE_FROM +
            escapeId(tableName) +
            WHERE +
            escapeId(rowIdColumnName) +
            'NOT IN(' +
            getPlaceholders(deleteRowIds) +
            ')',
          deleteRowIds,
        );
      } else if (collHas(schemaMap, tableName)) {
        await cmd(DELETE_FROM + escapeId(tableName) + WHERE + ' 1');
      }
    }
  };

  const transaction = async <Return>(
    actions: () => Promise<Return>,
  ): Promise<Return> => {
    let result;
    await cmd('BEGIN');
    try {
      result = await actions();
    } catch (error) {
      onIgnoredError?.(error);
    }
    await cmd('END');
    return result as Return;
  };

  return [refreshSchema, loadTable, saveTable, transaction];
};

const upsert = async (
  cmd: Cmd,
  tableName: string,
  rowIdColumnName: string,
  changingColumnNames: string[],
  args: any[],
) =>
  await cmd(
    'INSERT INTO' +
      escapeId(tableName) +
      '(' +
      escapeId(rowIdColumnName) +
      arrayJoin(
        arrayMap(
          changingColumnNames,
          (columnName) => COMMA + escapeId(columnName),
        ),
      ) +
      ')VALUES' +
      getUpsertPlaceholders(args, size(changingColumnNames) + 1) +
      ('ON CONFLICT(' +
        escapeId(rowIdColumnName) +
        ')DO UPDATE SET' +
        arrayJoin(
          arrayMap(
            changingColumnNames,
            (columnName) =>
              escapeId(columnName) + '=excluded.' + escapeId(columnName),
          ),
          COMMA,
        )),
    arrayMap(args, (arg) => arg ?? null),
  );

const getPlaceholders = (array: any[]) =>
  arrayJoin(
    arrayMap(array, (_, index) => '$' + (index + 1)),
    COMMA,
  );

const getUpsertPlaceholders = (array: any[], columnCount: number) =>
  arrayJoin(
    arrayNew(
      size(array) / columnCount,
      (row) =>
        '(' +
        arrayJoin(
          arrayNew(
            columnCount,
            (column) => '$' + (row * columnCount + column + 1),
          ),
          COMMA,
        ) +
        ')',
    ),
    COMMA,
  );
