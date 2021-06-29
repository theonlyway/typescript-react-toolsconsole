import { RESET_UNWRAP_RESULTS, SET_UNWRAP_RESULTS } from './actiontypes';
import { IInitialState as IUnwrapProps } from '../reducers/unwrap'

const setUnwrapProps = (props: IUnwrapProps) => {
    return {
        type: SET_UNWRAP_RESULTS,
        payload: props
    }
}

const resetUnwrapProps = () => {
    return {
        type: RESET_UNWRAP_RESULTS
    }
}

export default {
    setUnwrapProps,
    resetUnwrapProps
}
