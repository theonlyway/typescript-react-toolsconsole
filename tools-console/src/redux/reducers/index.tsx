import { combineReducers } from "redux";
import generalState from './general'
import userState from './user'
import unwrapState from './unwrap'
import vaultOidcState from './vaultoidc'

export const rootReducer = combineReducers({ generalState, userState, unwrapState, vaultOidcState });
// eslint-disable-next-line no-undef
export type RootState = ReturnType<typeof rootReducer>
