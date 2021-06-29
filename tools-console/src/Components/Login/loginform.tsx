import React, { useState, useEffect } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import clsx from 'clsx';
import {
    InputAdornment, Card, CardHeader, CardContent, TextField, CardActions, Button, Typography, Link
} from "@material-ui/core";
import { Color } from '@material-ui/lab/Alert';
import { Auth } from 'aws-amplify';
import { AccountCircleOutlined, LockOutlined, LockOpenOutlined } from '@material-ui/icons';
import ReCAPTCHA from "react-google-recaptcha";
import { Microsoft } from 'mdi-material-ui'
import { SignInState } from '../Classes/classes'
import { useHistory } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks'
import SnackBar from '../Shared/snackbar'
import { ICognitoUserExt } from '../../types/user'
import { DefaultStyles } from '../../styles/common'

interface IProps {
    signInState: SignInState,
    handleSignInStateChange: (state: SignInState) => void
}

export default function Login(props: IProps) {
    const awsConfig = useAppSelector(state => state.generalState.awsConfig)
    const [recaptchaToken, setRecaptchaToken] = useState<null | string>(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [openSnackBar, setOpenSnackBar] = useState(false);
    const [snackBarSeverity, setSnackBarSeverity] = useState<Color>('error')
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const history = useHistory();
    // eslint-disable-next-line no-unused-vars
    const [signInState, setSignInState] = useState(props.signInState);
    const adfsUrl = `https://${awsConfig.oauth.domain}/oauth2/authorize?identity_provider=${awsConfig.oauth.name}&redirect_uri=${awsConfig.oauth.redirectSignIn}&response_type=${awsConfig.oauth.responseType}&client_id=${awsConfig.aws_user_pools_web_client_id}`;

    function handleADFSLogin() {
        window.location.assign(adfsUrl);
    }

    function handleAuthResponse(user: ICognitoUserExt) {
        //console.log(user)

        if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
            props.handleSignInStateChange(new SignInState(user, true))
        }
        else if (user.challengeName === 'MFA_SETUP') {
            props.handleSignInStateChange(new SignInState(user, false, true))
        }
        else if (user.challengeName === 'SOFTWARE_TOKEN_MFA') {
            props.handleSignInStateChange(new SignInState(user, false, false, true))
        }
    }

    function verifyCaptcha(event: React.FormEvent<HTMLButtonElement | HTMLFormElement>) {
        event.preventDefault();
        if (recaptchaToken === null) {
            setSnackBarMessage("Please complete reCAPTCHA");
            setOpenSnackBar(true);
        }
        else {
            signIn()
        }
    }

    async function signIn() {

        await Auth.signIn(username, password)
            .then(user => handleAuthResponse(user))
            .catch(error => {
                switch (error.code) {
                    case "NotAuthorizedException":
                        setSnackBarMessage(error.message);
                        setSnackBarSeverity('error')
                        setOpenSnackBar(true);
                        break;
                    case 'PasswordResetRequiredException':
                        history.push({
                            pathname: '/login/resetpassword',
                            state: { username: username }
                        })
                        break;
                    default:
                        setSnackBarMessage("Error signing in");
                        setOpenSnackBar(true);
                }
            })
    }

    function onChangeRecaptcha(value: string | null) {
        //console.log("Captcha value:", value);
        setRecaptchaToken(value);
    }

    function onExpiredRecaptcha() {
        //console.log("Captcha expired");
        setRecaptchaToken(null);
    }

    const useStyles = makeStyles((theme) => ({
        loginBtn: {
            marginTop: theme.spacing(2),
            flexGrow: 1
        },
        header: {
            textAlign: 'center',
            background: theme.palette.primary.main,
            color: theme.palette.type === "light" ? "#FFFFFF" : "#000000"
        },
        card: {
            marginTop: theme.spacing(0)
        },
        divider: {
            width: theme.spacing(0.2),
            background: "#000000"
        },
        recaptcha: {
            display: "flex",
            "place-content": "center",
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
        },
        cardactionstop: {
            display: "flex",
            "place-content": "center",
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2)
        },
        cardactionsbottom: {
            display: "flex",
            "place-content": "center",
            marginBottom: theme.spacing(2)
        },
        dividercontainer: {
            display: "flex",
            alignItems: "center"
        },
        dividerborder: {
            borderBottom: "2px solid lightgray",
            width: "100%"
        },
        dividercontent: {
            paddingTop: theme.spacing(0.5),
            paddingBottom: theme.spacing(0.5),
            paddingRight: theme.spacing(2),
            paddingLeft: theme.spacing(2),
        }
    }));
    const classes = useStyles();
    const defaultClasses = DefaultStyles()
    // eslint-disable-next-line no-unused-vars
    const theme = useTheme();
    const DividerWithText = ({ children }: { children: string }) => {
        const classes = useStyles();
        return (
            <div className={classes.dividercontainer}>
                <div className={classes.dividerborder} />
                <span className={classes.dividercontent}>{children}</span>
                <div className={classes.dividerborder} />
            </div>
        );
    };

    useEffect(() => {
        setSignInState(props.signInState)
    }, [props.signInState]);

    return (
        <div className={clsx(defaultClasses.container)}>
            <form onSubmit={verifyCaptcha}>
                <Card className={classes.card}>
                    <CardHeader className={classes.header} title="Login" />
                    <CardActions className={classes.cardactionstop}>
                        <Button
                            variant="contained"
                            size="large"
                            color="secondary"
                            startIcon={<Microsoft />}
                            onClick={handleADFSLogin}>
                            Login with ADFS
                            </Button>
                    </CardActions>
                    <DividerWithText>Or</DividerWithText>
                    <CardContent>
                        <TextField
                            fullWidth
                            id="username"
                            type="text"
                            label="Username"
                            placeholder="Username"
                            margin="normal"
                            autoComplete="username"
                            autoFocus
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <AccountCircleOutlined />
                                    </InputAdornment>
                                ),
                            }}
                            onInput={e => setUsername((e.target as HTMLInputElement).value)}
                        />
                        <TextField
                            fullWidth
                            id="password"
                            type="password"
                            label="Password"
                            placeholder="Password"
                            margin="normal"
                            autoComplete="current-password"
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockOutlined />
                                    </InputAdornment>
                                ),
                            }}
                            onInput={e => setPassword((e.target as HTMLInputElement).value)}
                        />
                        <Typography>
                            <Link href="/login/forgotpassword">
                                Forgot password
                            </Link>
                        </Typography>
                    </CardContent>
                    <CardActions className={classes.cardactionsbottom}>
                        <Button
                            variant="contained"
                            size="large"
                            color="secondary"
                            startIcon={<LockOpenOutlined />}
                            type="submit"
                            onSubmit={verifyCaptcha}>
                            Login
                            </Button>
                    </CardActions>
                    <CardActions className={classes.cardactionsbottom}>
                        <ReCAPTCHA
                            sitekey={awsConfig.recaptcha_v2_site_key}
                            onChange={onChangeRecaptcha}
                            onExpired={onExpiredRecaptcha}
                        />
                    </CardActions>
                </Card>
            </form>
            <SnackBar openSnackBar={openSnackBar} snackBarSeverity={snackBarSeverity} snackBarMessage={snackBarMessage} parentState={setOpenSnackBar} />
        </div>
    )
}
