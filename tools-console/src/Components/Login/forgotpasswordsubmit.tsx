import React, { useState, useEffect } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
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
import { LockOutlined, VpnKeyOutlined, AccountCircleOutlined } from '@material-ui/icons';
import VerifiedUserOutlinedIcon from '@material-ui/icons/VerifiedUserOutlined';
import { useAppSelector } from '../../redux/hooks'
import { Color } from '@material-ui/lab/Alert';
import { Auth } from 'aws-amplify';
import ReCAPTCHA from "react-google-recaptcha";
import SnackBar from '../Shared/snackbar'
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
    const awsConfig = useAppSelector(state => state.generalState.awsConfig)
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
    const open = useAppSelector(state => state.generalState.drawerOpen);
    const [openSnackBar, setOpenSnackBar] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [snackBarSeverity, setSnackBarSeverity] = useState<Color>('error')
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [newPasswordError, setNewPasswordError] = useState(false);
    const [confirmNewPasswordError, setConfirmNewPasswordError] = useState(false);
    const [newPasswordErrorText, setNewPasswordErrorText] = useState<JSX.Element | null>(null);
    const [confirmNewPasswordErrorText, setConfirmNewPasswordErrorText] = useState<JSX.Element | null>(null);
    // eslint-disable-next-line no-unused-vars
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState(() => {
        if (props.location.state !== undefined && 'username' in props.location.state) {
            return props.location.state.username
        }
        else {
            return ''
        }
    })
    const [verificationCode, setVerificationCode] = useState('');
    const [disablePasswordChangeButton, setDisablePasswordChangeButton] = useState(false);

    function handleNewPassword() {
        if (newPassword !== null && confirmNewPassword !== null && newPassword === confirmNewPassword && !newPasswordError && !confirmNewPasswordError && verificationCode !== null) {
            Auth.forgotPasswordSubmit(username, verificationCode, newPassword)
                .then(() => {
                    props.history.push({
                        pathname: '/login'
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
        else if (verificationCode === null) {
            setSnackBarMessage('Verification code field cannot be empty');
            setOpenSnackBar(true);
        }
        else {
            setSnackBarMessage('Please resolve problems');
            setOpenSnackBar(true);
        }

    }

    function onChangeRecaptcha(value: string | null) {
        //console.log("Captcha value:", value);
        setRecaptchaToken(value);
    }

    function onExpiredRecaptcha() {
        //console.log("Captcha expired");
        setRecaptchaToken(null);
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
        snackBar: {
            width: '100%',
            '& > * + *': {
                marginTop: theme.spacing(2),
            },
        },
    }));
    const classes = useStyles();
    const defaultClasses = DefaultStyles()
    // eslint-disable-next-line no-unused-vars
    const theme = useTheme();

    function verifyCaptcha(event: React.MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (recaptchaToken === null) {
            setSnackBarMessage("Please complete reCAPTCHA");
            setOpenSnackBar(true);
        }
        else {
            handleNewPassword()
        }
    }

    useEffect(() => {
        newPasswordValidation()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newPassword]);

    useEffect(() => {
        confirmPasswordValidation()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [confirmNewPassword]);

    useEffect(() => {
        if (confirmNewPassword.length === 0 || newPassword.length === 0) {
            setDisablePasswordChangeButton(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <main
            className={clsx(defaultClasses.content, {
                [defaultClasses.contentShift]: open,
            })}
        >
            {isLoading ? <CircularProgress className={defaultClasses.loading} /> :
                <div className={clsx(defaultClasses.container)}>
                    <form onSubmit={verifyCaptcha}>
                        <Card className={classes.card}>
                            <CardHeader className={classes.header} title="Reset password" />
                            <CardContent>
                                <TextField
                                    fullWidth
                                    id="username"
                                    type="text"
                                    label="Username"
                                    placeholder="Username"
                                    margin="normal"
                                    autoComplete="username"
                                    defaultValue={username}
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
                                <TextField
                                    fullWidth
                                    id="verificationcode"
                                    type="text"
                                    label="Verification code"
                                    placeholder="Verififcation code"
                                    margin="normal"
                                    autoComplete="off"
                                    required
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <VerifiedUserOutlinedIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                    onInput={e => setVerificationCode((e.target as HTMLInputElement).value)}
                                />
                            </CardContent>
                            <CardActions className={classes.cardactionstop}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    color="secondary"
                                    type="submit"
                                    startIcon={<VpnKeyOutlined />}
                                    onClick={verifyCaptcha}
                                    disabled={disablePasswordChangeButton}
                                >
                                    Set password
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
                </div>
            }
            <SnackBar openSnackBar={openSnackBar} snackBarSeverity={snackBarSeverity} snackBarMessage={snackBarMessage} parentState={setOpenSnackBar} />
        </main>
    )
}
