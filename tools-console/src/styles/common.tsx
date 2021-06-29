import { makeStyles } from '@material-ui/core/styles';
import store from '../redux/store'

const state = store.getState()
const drawerWidth = state.generalState.drawerWidth
export const DefaultStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: 0
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: +drawerWidth,
    },
    container: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(4),
        height: `calc(100% - 64px)`,
        display: "flex",
        "justify-content": "center",
        "align-items": "center"
    },
    paper: {
        padding: theme.spacing(2),
        display: "flex",
        overflow: "auto",
        flexDirection: "column"
    },
    loading: {
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
        margin: "auto"
    },
}));
