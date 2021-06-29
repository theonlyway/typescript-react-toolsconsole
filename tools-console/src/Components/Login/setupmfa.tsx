import React, { useState, useEffect } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { InputAdornment, Card, CardHeader, CardContent, TextField, CardActions, Button, CardMedia, Typography, CircularProgress } from "@material-ui/core";
import { Color } from '@material-ui/lab/Alert';
import QRCode from 'qrcode.react';
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
    const [qrString, setQRString] = useState('');

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

    function handleSubmitTOTP(event: React.MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (mfaChallengeAnswer !== null) {
            Auth.verifyTotpToken(signInState.UserObject, mfaChallengeAnswer)
                .then(() => {

                    // don't forget to set TOTP as the preferred MFA method
                    Auth.setPreferredMFA(signInState.UserObject, 'TOTP');
                    // ...
                    props.handleSignInStateChange(new SignInState())
                })
                .catch(e => {
                    // Token is not verified
                    setSnackBarMessage(e.message)
                    setSnackBarSeverity('error')
                    setOpenSnackBar(true)
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

    useEffect(() => {
        Auth.setupTOTP(signInState.UserObject).then((code) => {
            // You can directly display the `code` to the user or convert it to a QR code to be scanned.
            // E.g., use following code sample to render a QR code with `qrcode.react` component:
            //      import QRCode from 'qrcode.react';
            //      const str = "otpauth://totp/AWSCognito:"+ username + "?secret=" + code + "&issuer=" + issuer;
            //      <QRCode value={str}/>
            setQRString("otpauth://totp/AWSCognito:" + signInState.UserObject!.username + "?secret=" + code + "&issuer=ToolsConsole")
        }).catch(e => {
            //console.log(e);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={clsx(defaultClasses.container)}>
            <form onSubmit={handleSubmitTOTP}>
                <Card className={classes.card}>
                    <CardHeader className={classes.header} title="Setup MFA" />
                    <CardContent>
                        <CardMedia className={classes.qrcode}>
                            {qrString !== null ? <QRCode value={qrString} renderAs={"svg"} /> : <CircularProgress />}
                        </CardMedia>
                        <Typography variant="body2" color="textSecondary" component="p">
                            Please scan QR code with your authenticator app<br />
                            of choice and input code to activate MFA
                        </Typography>
                        <TextField
                            fullWidth
                            id="totpcode"
                            label="TOTP Code"
                            placeholder="TOTP code"
                            margin="normal"
                            autoComplete="off"
                            autoFocus
                            required
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
