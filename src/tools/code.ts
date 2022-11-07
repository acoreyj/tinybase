import {IdMap, mapEnsure, mapGet, mapMap, mapNew, mapSet} from '../common/map';
import {IdSet2, setAdd, setNew} from '../common/set';
import {Pair, pairNewMap} from '../common/pairs';
import {
  arrayForEach,
  arrayMap,
  arrayPop,
  arrayPush,
  arrayShift,
  arraySort,
  arrayUnshift,
} from '../common/array';
import {collHas, collValues} from '../common/coll';
import {isArray, test} from '../common/other';
import {EMPTY_STRING} from '../common/strings';
import {Id} from '../common.d';

type LINE = string;
type LINES = LINE[];
type LINE_TREE = LINE_OR_LINE_TREE[];
type LINE_OR_LINE_TREE = LINE | LINE_TREE;

const NON_ALPHANUMERIC = /[^A-Za-z0-9]+/;
const CLOSING = /^[\])}]/;
const OPENING = /[[({]$/;
const INLINE_ARROW = /=> /;
const BREAK = '\n';

const substr = (str: string, start: number, end?: number) =>
  str.substring(start, end);

const upper = (str: string) => str.toUpperCase();

const lower = (str: string) => str.toLowerCase();

const mapUnique = <Value>(
  map: IdMap<Value>,
  id: Id,
  value: Value,
  index = 1,
): Id => {
  const uniqueId = `${id}${index == 1 ? '' : index}`;
  if (collHas(map, uniqueId)) {
    return mapUnique(map, id, value, index + 1);
  } else {
    mapSet(map, uniqueId, value);
    return uniqueId;
  }
};

export const length = (str: string) => str.length;

export const join = (str: string[], sep = EMPTY_STRING) => str.join(sep);

export const camel = (str: string, firstCap = false) =>
  join(
    arrayMap(
      str.split(NON_ALPHANUMERIC),
      (word, w) =>
        (w > 0 || firstCap ? upper : lower)(substr(word, 0, 1)) +
        substr(word, 1),
    ),
  );

export const snake = (str: string) =>
  upper(join(str.split(NON_ALPHANUMERIC), '_'));

export const comment = (doc: string) => `/** ${doc}. */`;

export const getCodeFunctions = (): [
  (...lines: LINE_TREE) => string,
  (location: 0 | 1, source: string, ...items: string[]) => void,
  (name: Id, body?: LINE, doc?: string) => Id,
  (name: Id, body: LINE, doc: string) => void,
  (
    name: Id,
    parameters: LINE_OR_LINE_TREE,
    returnType: string,
    body: LINE,
    doc: string,
    generic?: string,
  ) => Id,
  (name: Id, parameters: string, body: LINE_OR_LINE_TREE) => Id,
  (name: Id, body: LINE_OR_LINE_TREE) => Id,
  (location: 0 | 1) => LINES,
  () => LINE_TREE,
  (location: 0 | 1) => LINE_TREE,
  () => LINE_TREE,
] => {
  const allImports: Pair<IdSet2> = pairNewMap();
  const types: IdMap<[LINE, string]> = mapNew();
  const methods: IdMap<
    [
      parameters: LINE_OR_LINE_TREE,
      returnType: string,
      body: LINE,
      doc: string,
      generic: string,
    ]
  > = mapNew();
  const constants: IdMap<LINE_OR_LINE_TREE> = mapNew();

  const build = (...lines: LINE_TREE): string => {
    let indent = 0;
    const allLines: string[] = [];
    const handleLine = (line: LINE_OR_LINE_TREE): any =>
      isArray(line)
        ? arrayForEach(line, handleLine)
        : arrayPush(
            allLines,
            EMPTY_STRING.padStart(
              (CLOSING.test(line)
                ? --indent
                : OPENING.test(line)
                ? indent++
                : line == EMPTY_STRING
                ? 0
                : indent) * 2,
            ) +
              (length(line) > 80 - indent * 2 && test(INLINE_ARROW, line)
                ? line.replace(
                    INLINE_ARROW,
                    `=>\n${EMPTY_STRING.padStart(indent * 2 + 2)}`,
                  )
                : line),
          );
    arrayForEach(lines, handleLine);
    return allLines.join(BREAK);
  };

  const addImport = (location: 0 | 1, source: string, ...items: string[]) =>
    arrayForEach(items, (item) =>
      setAdd(mapEnsure(allImports[location], source, setNew), item),
    );

  const addType = (name: Id, body = '', doc = ''): Id =>
    mapUnique(types, name, [body, doc]);

  const updateType = (name: Id, body: LINE, doc: string): any =>
    mapSet(types, name, [body, doc]);

  const addMethod = (
    name: Id,
    parameters: LINE_OR_LINE_TREE,
    returnType: string,
    body: LINE,
    doc: string,
    generic = '',
  ): Id =>
    mapUnique(methods, name, [parameters, returnType, body, doc, generic]);

  const addFunction = (
    name: Id,
    parameters: string,
    body: LINE_OR_LINE_TREE,
  ): Id =>
    mapUnique(
      constants,
      name,
      isArray(body)
        ? [`(${parameters}) => {`, body, '}']
        : [`(${parameters}) => ${body}`],
    );

  const addConstant = (name: Id, body: LINE_OR_LINE_TREE): Id =>
    mapGet(constants, name) === body ? name : mapUnique(constants, name, body);

  const getImports = (location: 0 | 1): LINES => [
    ...arraySort(
      mapMap(
        allImports[location],
        (items, source) =>
          `import {${join(
            arraySort(collValues(items)),
            ', ',
          )}} from '${source}';`,
      ),
    ),
    EMPTY_STRING,
  ];

  const getTypes = (): LINE_TREE =>
    mapMap(types, ([body, doc], name) => [
      comment(doc),
      `export type ${name} = ${body};`,
      EMPTY_STRING,
    ]);

  const getMethods = (location: 0 | 1): LINE_TREE =>
    mapMap(methods, ([parameters, returnType, body, doc, generic], name) => {
      let lines = location
        ? [`${name}: ${generic}(`, parameters, `): ${returnType} => ${body},`]
        : [`${name}${generic}(`, parameters, `): ${returnType};`];
      if (!isArray(parameters)) {
        lines = [join(lines as LINES)];
      }
      if (!location) {
        arrayUnshift(lines, comment(doc));
      }
      arrayPush(lines, EMPTY_STRING);
      return lines;
    });

  const getConstants = (): LINE_TREE =>
    mapMap(constants, (body, name) => {
      body = isArray(body) ? body : [body];
      arrayPush(body, `${arrayPop(body)};`);
      return [`const ${name} = ${arrayShift(body)}`, body, EMPTY_STRING];
    });

  return [
    build,
    addImport,
    addType,
    updateType,
    addMethod,
    addFunction,
    addConstant,
    getImports,
    getTypes,
    getMethods,
    getConstants,
  ];
};
