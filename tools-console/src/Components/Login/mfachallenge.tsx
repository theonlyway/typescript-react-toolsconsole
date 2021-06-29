import React, { useState, useEffect } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { InputAdornment, Card, CardHeader, CardContent, TextField, CardActions, Button } from "@material-ui/core";
import { Color } from '@material-ui/lab/Alert';
import { Auth } from 'aws-amplify';
import { PhonelinkSetupOutlined } from '@material-ui/icons';
import { SignInState } from '../Classes/classes'
import SnackBar from '../Shared/snackbar'
import { DefaultStyles } from '../../styles/common'

interface IProps {
    signInState: SignInState,
    handleSignInStateChange: (state: SignInState) => void
}

export default function Login(props: IProps) {

    const [openSnackBar, setOpenSnackBar] = useState(false);
    const [snackBarSeverity, setSnackBarSeverity] = useState<Color>('error')
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [signInState, setSignInState] = useState(props.signInState);
    const [mfaChallengeAnswer, setMfaChallengeAnswer] = useState('');

    const useStyles = makeStyles((theme) => ({
        qrcode: {
            paddingBottom: theme.spacing(4),
            height: `calc(100% - 64px)`,
            display: "flex",
            "justify-content": "center",
            "align-items": "center"
        },
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
        cardactions: {
            display: "flex",
            "place-content": "center"
        },
    }));
    const classes = useStyles();
    const defaultClasses = DefaultStyles()
    // eslint-disable-next-line no-unused-vars
    const theme = useTheme();
    const returnToLogin = () => {
        setTimeout(() => { props.handleSignInStateChange(new SignInState()) }, 5000);
    };

    function handleSubmitTOTP(event: React.MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (mfaChallengeAnswer !== null) {
            Auth.confirmSignIn(signInState.UserObject, mfaChallengeAnswer, "SOFTWARE_TOKEN_MFA")
                .then(() => {
                    props.handleSignInStateChange(new SignInState(null, false, false, false, true))
                }).catch(e => {
                    // Token is not verified
                    if (e.message === 'Invalid session for the user, session is expired.') {
                        returnToLogin()
                    }
                    else {
                        setSnackBarMessage(e.message)
                        setSnackBarSeverity('error')
                        setOpenSnackBar(true)
                    }
                });
        }
        else {
            setSnackBarMessage('TOTP code cannot be empty')
            setSnackBarSeverity('error')
            setOpenSnackBar(true)
        }
    }

    useEffect(() => {
        setSignInState(props.signInState)
    }, [props]);

    return (
        <div className={clsx(defaultClasses.container)}>
            <form onSubmit={handleSubmitTOTP}>
                <Card className={classes.card}>
                    <CardHeader className={classes.header} title="Enter MFA code" />
                    <CardContent>
                        <TextField
                            fullWidth
                            id="totpcode"
                            label="TOTP Code"
                            placeholder="TOTP code"
                            margin="normal"
                            autoComplete="off"
                            autoFocus
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PhonelinkSetupOutlined />
                                    </InputAdornment>
                                ),
                            }}
                            onInput={e => setMfaChallengeAnswer((e.target as HTMLInputElement).value)}
                        />
                    </CardContent>
                    <CardActions className={classes.cardactions}>
                        <Button
                            variant="contained"
                            size="large"
                            color="secondary"
                            type="submit"
                            onClick={handleSubmitTOTP}>
                            Submit
                        </Button>
                    </CardActions>
                </Card>
            </form>
            <SnackBar openSnackBar={openSnackBar} snackBarSeverity={snackBarSeverity} snackBarMessage={snackBarMessage} parentState={setOpenSnackBar} />
        </div>
    )
}
