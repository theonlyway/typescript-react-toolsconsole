import {
    OIDC_USER_TOKENS,
    OIDC_USER_CODE,
    OIDC_VAULT_TOKENS
} from './actiontypes'
import { IJwt } from '../../types/user'
import { IVaultAuth } from '../reducers/vaultoidc'

const oidcJwtCode = (code: string) => {
    return {
        type: OIDC_USER_CODE,
        payload: code
    };
}

const oidcJwtTokens = (tokensObj: IJwt) => {
    return {
        type: OIDC_USER_TOKENS,
        payload: tokensObj
    };
}

const oidcVaultTokens = (tokensObj: IVaultAuth) => {
    return {
        type: OIDC_VAULT_TOKENS,
        payload: tokensObj
    };
}


export default {
    oidcJwtCode,
    oidcJwtTokens,
    oidcVaultTokens
}
