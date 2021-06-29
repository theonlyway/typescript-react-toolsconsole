import { SET_DRAWER_OPEN, SET_DARK_STATE } from '../actions/actiontypes'
import { AnyAction } from 'redux'
import { IAwsConfig } from '../../types/awsconfig'
import { isMobile } from 'react-device-detect'
import awsConfig from '../../aws_config'
//declare var awsConfig: IAwsConfig;

interface IInitialState {
    drawerWidth: number,
    drawerOpen: boolean,
    darkState: boolean,
    awsConfig: IAwsConfig
}

const initialState: IInitialState = {
    drawerWidth: 240,
    drawerOpen: isMobile ? false : true,
    darkState: localStorage.getItem('darkState') === "dark" ? true : false,
    awsConfig: awsConfig
}

export default function GeneralState(state = initialState, action: AnyAction) {
    switch (action.type) {
        case SET_DRAWER_OPEN: {
            return {
                ...state,
                drawerOpen: action.payload
            }
        }
        case SET_DARK_STATE: {
            localStorage.setItem('darkState', !state.darkState ? "dark" : "light");
            return {
                ...state,
                darkState: action.payload
            }
        }
        default:
            return state;
    }
}
