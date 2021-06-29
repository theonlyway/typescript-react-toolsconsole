import {
    OIDC_USER_CODE,
    OIDC_USER_TOKENS,
    OIDC_VAULT_TOKENS
} from '../actions/actiontypes'
import { AnyAction } from 'redux'
import { IJwt } from '../../types/user'

export interface IOidcRequest {
    code: string,
    state: string,
    'client-request-id': string
}

export interface IVaultAuth {
    expiry?: string,
    request_id: string,
    lease_id: string,
    renewable: boolean,
    lease_duration: number,
    data: null,
    wrap_info: null,
    warnings: null,
    auth: {
        client_token: string,
        accessor: string,
        policies: Array<string>,
        token_policies: Array<string>,
        metadata: {
            role: string
        },
        lease_duration: number,
        renewable: boolean,
        entity_id: string,
        token_type: string,
        orphan: boolean
    }
}

interface IInitialState {
    isLoadingUser: boolean,
    oidcRequest: null | IOidcRequest,
    jwt: null | IJwt,
    vaultAuth: null | IVaultAuth
}

const initialState: IInitialState = {
    isLoadingUser: false,
    oidcRequest: null,
    jwt: null,
    vaultAuth: null
}

export default function VaultOidcState(state = initialState, action: AnyAction) {
    switch (action.type) {
        case OIDC_USER_CODE:
            return {
                ...state,
                oidcRequest: action.payload
            }
        case OIDC_USER_TOKENS:
            return {
                ...state,
                jwt: action.payload
            }
        case OIDC_VAULT_TOKENS:
            return {
                ...state,
                vaultAuth: action.payload
            }
        default:
            return state;
    }
}
