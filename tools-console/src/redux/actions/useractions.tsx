import { SET_USER_PROPS, SET_USER_GROUPS, RESET_USER_PROPS } from './actiontypes'
import { ICognitoUserExt } from '../../types/user'

const setUserProps = (props: ICognitoUserExt) => {
    return {
        type: SET_USER_PROPS,
        payload: props
    }
}

const setUserGroups = (props: Array<string>) => {
    return {
        type: SET_USER_GROUPS,
        payload: props
    }
}

const resetUserProps = () => {
    return {
        type: RESET_USER_PROPS
    }
}

export default {
    setUserProps,
    setUserGroups,
    resetUserProps
}
