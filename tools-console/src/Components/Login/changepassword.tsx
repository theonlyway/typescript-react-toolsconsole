import React, { useState, useEffect } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Redirect } from "react-router-dom";
import clsx from 'clsx';
import {
    CircularProgress,
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
import { useAppSelector } from '../../redux/hooks'
import SnackBar from '../Shared/snackbar'
import { Color } from '@material-ui/lab/Alert';
import { Auth } from 'aws-amplify';
import { DefaultStyles } from '../../styles/common'

interface IBaseProps {
    pageTitle: string
}

type IExtBaseProps = IBaseProps & {
    history: any
    location: {
        [key: string]: any;
    }
}

export default function Login(props: IExtBaseProps) {

    const [openSnackBar, setOpenSnackBar] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [snackBarSeverity, setSnackBarSeverity] = useState<Color>('error')
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [pageTitle] = useState(props.pageTitle);
    const open = useAppSelector(state => state.generalState.drawerOpen);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [newPasswordError, setNewPasswordError] = useState(false);
    const [confirmNewPasswordError, setConfirmNewPasswordError] = useState(false);
    const [newPasswordErrorText, setNewPasswordErrorText] = useState<JSX.Element | null>(null);
    const [confirmNewPasswordErrorText, setConfirmNewPasswordErrorText] = useState<JSX.Element | null>(null);
    const [disablePasswordChangeButton, setDisablePasswordChangeButton] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null)
    const [adfsUser, setAdfsUser] = useState(false)

    function handleNewPassword(event: React.FormEvent<HTMLButtonElement | HTMLFormElement>) {
        event.preventDefault();
        if (newPassword !== null && confirmNewPassword !== null && newPassword === confirmNewPassword && !newPasswordError && !confirmNewPasswordError) {
            Auth.changePassword(user, currentPassword, newPassword)
                .then(data => {
                    //console.log(data)
                    props.history.push({
                        pathname: '/profile'
                    })
                })
                .catch(err => {
                    //console.log(err)
                    setSnackBarMessage(err.message);
                    setOpenSnackBar(true);
                });
        }
        else if (newPassword === null || confirmNewPassword === null) {
            setSnackBarMessage('Password fields cannot be empty');
            setOpenSnackBar(true);
        }
        else {
            setSnackBarMessage('Please resolve problems');
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
            marginTop: theme.spacing(0),
            maxWidth: '500px'
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
    }));
    const classes = useStyles();
    const defaultClasses = DefaultStyles()
    // eslint-disable-next-line no-unused-vars
    const theme = useTheme();

    useEffect(() => {
        Auth.currentAuthenticatedUser()
            .then((userData) => {
                setUser(userData)
                if ('identities' in userData.attributes) {
                    let identity = JSON.parse(userData.attributes.identities)[0]
                    if (identity.providerType === "SAML") {
                        setAdfsUser(true)
                    }
                }
            })
            .catch((err) => {
                props.history.push({
                    pathname: '/login'
                })
                //console.log(err);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        newPasswordValidation()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newPassword, confirmNewPassword]);

    useEffect(() => {
        if (confirmNewPassword.length === 0 || newPassword.length === 0) {
            setDisablePasswordChangeButton(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        confirmPasswordValidation()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [confirmNewPassword, newPassword]);

    useEffect(() => {
        document.title = pageTitle
    }, [props, pageTitle]);

    return (
        <main
            className={clsx(defaultClasses.content, {
                [defaultClasses.contentShift]: open,
            })}
        >
            {isLoading ? <CircularProgress className={defaultClasses.loading} /> :
                <div className={clsx(defaultClasses.container)}>
                    {!adfsUser ?
                        <form onSubmit={handleNewPassword}>
                            <Card className={classes.card}>
                                <CardHeader className={classes.header} title="Change password" />
                                <CardContent>
                                    <TextField
                                        fullWidth
                                        id="currentpassword"
                                        type="password"
                                        label="Current Password"
                                        placeholder="Curret Password"
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
                                        style={{ display: 'block' }}
                                        onInput={e => setCurrentPassword((e.target as HTMLInputElement).value)}
                                    />
                                    <TextField
                                        fullWidth
                                        id="newpassword"
                                        type="password"
                                        label="New Password"
                                        placeholder="New Password"
                                        margin="normal"
                                        autoComplete="new-password"
                                        helperText={newPasswordError ? newPasswordErrorText : null}
                                        error={newPasswordError}
                                        required
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockOutlined />
                                                </InputAdornment>
                                            ),
                                        }}
                                        style={{ display: 'block' }}
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
                                <CardActions className={classes.cardactionstop}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        color="secondary"
                                        type="submit"
                                        disabled={disablePasswordChangeButton}
                                        startIcon={<VpnKeyOutlined />}
                                        onClick={handleNewPassword}
                                    >
                                        Change password
                            </Button>
                                </CardActions>
                            </Card>
                        </form>
                        :
                        <Redirect push to={{
                            pathname: "/"
                        }} />}
                </div>
            }
            <SnackBar openSnackBar={openSnackBar} snackBarSeverity={snackBarSeverity} snackBarMessage={snackBarMessage} parentState={setOpenSnackBar} />
        </main>
    )
}
