import { RESET_UNWRAP_RESULTS, SET_UNWRAP_RESULTS } from '../actions/actiontypes';
import { AnyAction } from 'redux'

export interface IInitialState {
    activeStep: number,
    unwrapResult: null | IUnwrapResult,
    tokenInput: null | string
}

export interface IUnwrapResult {
    request_id: string,
    lease_id: string,
    renewable: boolean,
    lease_duration: number,
    data: {
        [key: string]: string
    }
    wrap_info: string | null,
    warnings: string | null,
    auth: string | null
}

const initialState: IInitialState = {
    activeStep: 0,
    unwrapResult: null,
    tokenInput: null
}

export default function UnwrapState(state = initialState, action: AnyAction) {
    switch (action.type) {
        case SET_UNWRAP_RESULTS: {
            return {
                ...state,
                activeStep: action.payload.activeStep,
                unwrapResult: action.payload.unwrapResult,
                tokenInput: action.payload.tokenInput
            }
        }
        case RESET_UNWRAP_RESULTS: {
            return initialState
        }
        default:
            return state;
    }
}
