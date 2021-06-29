import { SET_DRAWER_OPEN, SET_DARK_STATE } from './actiontypes'

const setDrawerOpen = (open: boolean) => {
    return {
        type: SET_DRAWER_OPEN,
        payload: open
    }
}

const setDarkState = (state: boolean) => {
    return {
        type: SET_DARK_STATE,
        payload: state
    }
}

export default {
    setDrawerOpen,
    setDarkState
}
