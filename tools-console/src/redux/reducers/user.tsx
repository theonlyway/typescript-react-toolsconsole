import { SET_USER_PROPS, SET_USER_GROUPS, RESET_USER_PROPS } from '../actions/actiontypes'
import { AnyAction } from 'redux'
import { ICognitoUserExt } from '../../types/user'

export interface IInitialState {
    user: null | ICognitoUserExt,
    userGroups: Array<string>,
    adfsUser: boolean
}

const initialState: IInitialState = {
    user: null,
    userGroups: [],
    adfsUser: false
}

export default function UserState(state = initialState, action: AnyAction) {
    switch (action.type) {
        case SET_USER_PROPS: {
            if ('identities' in action.payload.attributes) {
                let identity = JSON.parse(action.payload.attributes.identities)[0]
                if (identity.providerType === "SAML") {
                    return {
                        ...state,
                        user: action.payload,
                        adfsUser: true
                    }
                }
            }
            return {
                ...state,
                user: action.payload,
                adfsUser: false
            }
        }
        case SET_USER_GROUPS: {
            return {
                ...state,
                userGroups: action.payload
            }
        }
        case RESET_USER_PROPS: {
            return initialState;
        }
        default:
            return state;
    }
}
