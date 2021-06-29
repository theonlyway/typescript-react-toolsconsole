import React, { useState, useEffect } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { CircularProgress, Step, Stepper, StepLabel, StepContent, Button, Paper, Typography } from "@material-ui/core";
import Alert from '@material-ui/lab/Alert';
import { Auth } from 'aws-amplify';
import { useSelector } from 'react-redux'
import withSuspense from '../Hocs/withsuspense'


export default function Users(props) {

    const useStyles = makeStyles((theme) => ({
        content: {
            flexGrow: 1,
            padding: theme.spacing(3),
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            marginLeft: 0,
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
            "align-items": "center",
            margin: "2px"
        },
        loading: {
            display: "flex",
            "justify-content": "center",
            "align-items": "center",
            margin: "auto"
        }
    }));

    const [openSnackBar, setOpenSnackBar] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const drawerWidth = useSelector(state => state.generalState.drawerWidth);
    const [pageTitle, setPageTitle] = useState(props.pageTitle)
    const [isLoading, setIsLoading] = useState(true)
    const classes = useStyles();
    const theme = useTheme();
    const open = useSelector(state => state.generalState.drawerOpen);
    const CreateUsers = React.lazy(() => import('./createuser'));
    const CreateUsersWithSuspense = withSuspense(CreateUsers, classes)
    const ManageUsers = React.lazy(() => import('./manageuser'));
    const ManageUsersWithSuspense = withSuspense(ManageUsers, classes)

    return (
        <main
            className={clsx(classes.content, {
                [classes.contentShift]: open,
            })}
        >
            {isLoading ? <CircularProgress className={classes.loading} /> : null}
        </main>
    )
}
