import {authorizationFunctions} from './authorization.ts';
import {defaults} from './default.ts';

export const serverFunctions = {
  defaults,
  authorization: authorizationFunctions,
};
