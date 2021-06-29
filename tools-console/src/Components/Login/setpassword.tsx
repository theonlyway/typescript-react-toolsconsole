import React, { useState, useEffect } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import clsx from 'clsx';
import {
    InputAdornment,
    Card,
    CardHeader,
    CardContent,
    TextField,
    CardActions,
    Button,
    ListItem,
    ListItemText
} from "@material-ui/core";
import { LockOutlined, VpnKeyOutlined } from '@material-ui/icons';
import { Color } from '@material-ui/lab/Alert';
import { Auth, Hub } from 'aws-amplify';
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
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [newPasswordError, setNewPasswordError] = useState(false);
    const [confirmNewPasswordError, setConfirmNewPasswordError] = useState(false);
    const [newPasswordErrorText, setNewPasswordErrorText] = useState<JSX.Element | null>(null);
    const [confirmNewPasswordErrorText, setConfirmNewPasswordErrorText] = useState<JSX.Element | null>(null);
    const [signInState, setSignInState] = useState(props.signInState);
    const [disablePasswordChangeButton, setDisablePasswordChangeButton] = useState(false);

    function handleNewPassword(event: React.MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (newPassword !== null && confirmNewPassword !== null && newPassword === confirmNewPassword && !newPasswordError && !confirmNewPasswordError) {
            Auth.completeNewPassword(
                signInState.UserObject, // the Cognito User Object
                newPassword, // the new password
                // OPTIONAL, the required attributes
                {
                    email: signInState.UserObject!.challengeParam!.userAttributes.email
                }
            ).then(user => {
                // at this time the user is logged in if no MFA required
                if (user.challengeName === 'MFA_SETUP') {
                    props.handleSignInStateChange(new SignInState(user, false, true, false))
                }
                //console.log(user);
            }).catch(e => {
                //console.log(e);
            });
        }
        else if (newPassword === null || confirmNewPassword === null) {
            setSnackBarMessage('Password fields cannot be empty');
            setOpenSnackBar(true);
        }
        else {
            setSnackBarMessage('Please resolve password problems');
            setOpenSnackBar(true);
        }

    }

    function newPasswordValidation() {
        let uppercaseRegexPattern = /[A-Z]/.test(newPassword)
        let lowercaseRegexPattern = /[a-z]/.test(newPassword || '')
        let numberRegexPattern = /[0-9]/.test(newPassword)
        // eslint-disable-next-line no-useless-escape
        let specialCharacterRegexPattern = /[!@#$%^&*()_+`~\-=,./?\\\|'";:\[\]{}<>]/.test(newPassword)
        let lengthRegexPattern = /.{12,}/.test(newPassword)
        let messages = []

        if (newPassword !== null && newPassword !== undefined) {
            if (!lowercaseRegexPattern) {
                messages.push("Password requires at least one lower case character")
            }

            if (!uppercaseRegexPattern) {
                messages.push("Password requires at least one upper case character")
            }

            if (!numberRegexPattern) {
                messages.push("Password requires at least one numerical character")
            }

            if (!specialCharacterRegexPattern) {
                messages.push("Password requires at least one special character")
            }

            if (!lengthRegexPattern) {
                messages.push("Password needs to be at least 12 characters long")
            }
        }

        if (messages.length > 0) {
            setNewPasswordErrorText(
                <React.Fragment>
                    {messages.map((item, key) =>
                        <ListItem dense disableGutters key={key}>
                            <ListItemText
                                primary={item}
                            />
                        </ListItem>
                    )}
                </React.Fragment>
            )
            setNewPasswordError(true)
            setDisablePasswordChangeButton(true)
        }
        else {
            setNewPasswordError(false)
            setDisablePasswordChangeButton(false)
        }
    }

    function confirmPasswordValidation() {
        let uppercaseRegexPattern = /[A-Z]/.test(confirmNewPassword)
        let lowercaseRegexPattern = /[a-z]/.test(confirmNewPassword || '')
        let numberRegexPattern = /[0-9]/.test(confirmNewPassword)
        // eslint-disable-next-line no-useless-escape
        let specialCharacterRegexPattern = /[!@#$%^&*()_+`~\-=,./?\\\|'";:\[\]{}<>]/.test(confirmNewPassword)
        let lengthRegexPattern = /.{12,}/.test(confirmNewPassword)
        let messages = []

        if (confirmNewPassword !== null && confirmNewPassword !== undefined) {
            if (!lowercaseRegexPattern) {
                messages.push("Password requires at least one lower case character")
            }

            if (!uppercaseRegexPattern) {
                messages.push("Password requires at least one upper case character")
            }

            if (!numberRegexPattern) {
                messages.push("Password requires at least one numerical character")
            }

            if (!specialCharacterRegexPattern) {
                messages.push("Password requires at least one special character")
            }

            if (!lengthRegexPattern) {
                messages.push("Password needs to be at least 12 characters long")
            }

            if (newPassword !== confirmNewPassword) {
                messages.push("New password and confirm password do not match")
            }
        }
        if (messages.length > 0) {
            setConfirmNewPasswordErrorText(
                <React.Fragment>
                    {messages.map((item, key) =>
                        <ListItem dense disableGutters key={key}>
                            <ListItemText
                                primary={item}
                            />
                        </ListItem>
                    )}
                </React.Fragment>
            )
            setConfirmNewPasswordError(true)
            setDisablePasswordChangeButton(true)
        }
        else {
            setConfirmNewPasswordError(false)
            setDisablePasswordChangeButton(false)
        }
    }

    useEffect(() => {
        if (confirmNewPassword.length === 0 || newPassword.length === 0) {
            setDisablePasswordChangeButton(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        recaptcha: {
            display: "flex",
            "place-content": "center",
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
        },
        cardactions: {
            display: "flex",
            "place-content": "center"
        }
    }));
    const classes = useStyles();
    const defaultClasses = DefaultStyles()
    // eslint-disable-next-line no-unused-vars
    const theme = useTheme();

    useEffect(() => {
        setSignInState(props.signInState)
    }, [props]);

    const returnToLogin = () => {
        setTimeout(() => { props.handleSignInStateChange(new SignInState()) }, 5000);
    };

    useEffect(() => {
        Hub.listen("auth", (res) => {
            let errorMsg = res?.payload?.data?.messages
                ? res.payload.data.messages
                : null;

            if (errorMsg) {
                switch (res.payload.data.messages) {
                    case "1 validation error detected: Value at 'password' failed to satisfy constraint: Member must have length greater than or equal to 12":
                        errorMsg = "Password not long enough";
                        break;

                    case "Password does not conform to policy: Password not long enough":
                        errorMsg = "Password not long enough. Must be greater than or equal to 12 characters";
                        break;
                    case "Invalid session for the user, session is expired.":
                        errorMsg = "Invalid session for the user, session is expired. Redirecting back to login"
                        returnToLogin()
                        break;
                    default:
                        returnToLogin()
                }
                setSnackBarMessage(errorMsg);
                setSnackBarSeverity('error')
                setOpenSnackBar(true);
            }
        });
    });

    useEffect(() => {
        newPasswordValidation()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newPassword]);

    useEffect(() => {
        confirmPasswordValidation()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [confirmNewPassword]);

    return (
        <React.Fragment>
            <div className={clsx(defaultClasses.container)}>
                <form onSubmit={handleNewPassword}>
                    <Card className={classes.card}>
                        <CardHeader className={classes.header} title="New password" />
                        <CardContent>
                            <TextField
                                fullWidth
                                id="password"
                                type="password"
                                label="New Password"
                                placeholder="New Password"
                                margin="normal"
                                autoComplete="new-password"
                                helperText={newPasswordError ? newPasswordErrorText : null}
                                autoFocus
                                error={newPasswordError}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlined />
                                        </InputAdornment>
                                    ),
                                }}
                                onInput={e => setNewPassword((e.target as HTMLInputElement).value)}
                            />
                            <TextField
                                fullWidth
                                id="confirmPassword"
                                type="password"
                                label="Confirm Password"
                                placeholder="Confirm Password"
                                margin="normal"
                                autoComplete="new-password"
                                helperText={confirmNewPasswordError ? confirmNewPasswordErrorText : null}
                                error={confirmNewPasswordError}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlined />
                                        </InputAdornment>
                                    )
                                }}
                                onInput={e => setConfirmNewPassword((e.target as HTMLInputElement).value)}
                            />
                        </CardContent>
                        <CardActions className={classes.cardactions}>
                            <Button
                                variant="contained"
                                size="large"
                                color="secondary"
                                type="submit"
                                startIcon={<VpnKeyOutlined />}
                                onClick={handleNewPassword}
                                disabled={disablePasswordChangeButton}
                            >
                                Set password
                            </Button>
                        </CardActions>
                    </Card>
                </form>
            </div>
            <SnackBar openSnackBar={openSnackBar} snackBarSeverity={snackBarSeverity} snackBarMessage={snackBarMessage} parentState={setOpenSnackBar} />
        </React.Fragment>
    )
}
