import React, { useState, useEffect } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import clsx from 'clsx';
import LoginForm from './loginform'
import SetPassword from './setpassword'
import SetupMFA from './setupmfa'
import AnswerMFAChallenge from './mfachallenge'
import { SignInState } from '../Classes/classes'
import { Redirect } from "react-router-dom";
import { useAppSelector } from '../../redux/hooks'
import { RouteComponentProps } from 'react-router-dom';

// https://github.com/creativesuraj/react-material-ui-login/blob/master/src/components/Login.tsx

interface IProps extends RouteComponentProps  {
    pageTitle: string
}

export default function Login(props: IProps) {

    const drawerWidth = useAppSelector(state => state.generalState.drawerWidth);
    const [pageTitle] = useState(props.pageTitle);
    const [signInState, setSignInState] = useState(new SignInState());
    const userData = useAppSelector(state => state.userState);

    if (userData.user !== null) {
        props.history.push('/')
    }

    const useStyles = makeStyles((theme) => ({
        spinner: {
            display: 'flex',
            '& > * + *': {
                marginLeft: theme.spacing(2),
            },
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
    }));
    const classes = useStyles();
    // eslint-disable-next-line no-unused-vars
    const theme = useTheme();
    const open = useAppSelector(state => state.generalState.drawerOpen);

    const handleSignInStateChange = (state: SignInState) => {
        setSignInState(state)
    }

    useEffect(() => {
        document.title = pageTitle
    }, [props, pageTitle]);


    return (
        <main
            className={clsx(classes.content, {
                [classes.contentShift]: open,
            })}
        >
            {signInState.UserObject === null ? <LoginForm signInState={signInState} handleSignInStateChange={handleSignInStateChange} /> : null}
            {signInState.NewPasswordRequired ? <SetPassword signInState={signInState} handleSignInStateChange={handleSignInStateChange} /> : null}
            {signInState.TOTPSetup ? <SetupMFA signInState={signInState} handleSignInStateChange={handleSignInStateChange} /> : null}
            {signInState.TOTPChallenge ? <AnswerMFAChallenge signInState={signInState} handleSignInStateChange={handleSignInStateChange} /> : null}
            {signInState.AuthComplete ? <Redirect push to={{ pathname: '/' }} /> : null}
        </main>
    )
}
