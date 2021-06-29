import React, { useState, useEffect } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useAppSelector } from '../../redux/hooks'
import clsx from 'clsx';
import {
    InputAdornment,
    Card,
    CardHeader,
    CardContent,
    TextField,
    CardActions,
    Button
} from "@material-ui/core";
import { AccountCircleOutlined } from '@material-ui/icons';
import SnackBar from '../Shared/snackbar'
import { Color } from '@material-ui/lab/Alert';
import ReCAPTCHA from "react-google-recaptcha";
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

export default function ForgotPassword(props: IExtBaseProps) {
    const awsConfig = useAppSelector(state => state.generalState.awsConfig)
    const open = useAppSelector(state => state.generalState.drawerOpen);
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
    const [openSnackBar, setOpenSnackBar] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [snackBarSeverity, setSnackBarSeverity] = useState<Color>('error')
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [username, setUsername] = useState('');
    const [pageTitle] = useState(props.pageTitle);

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

    function verifyCaptcha(event: React.FormEvent<HTMLButtonElement | HTMLFormElement>) {
        event.preventDefault();
        if (recaptchaToken === null) {
            setSnackBarMessage("Please complete reCAPTCHA");
            setOpenSnackBar(true);
        }
        else {
            handleForgotPassword()
        }
    }

    useEffect(() => {
        document.title = pageTitle
    }, [props, pageTitle]);

    function handleForgotPassword() {
        Auth.forgotPassword(username)
            .then(data => {
                //console.log(data)
                props.history.push({
                    pathname: '/login/resetpassword',
                    state: { username: username }
                })
            })
            .catch(err => {
                //console.log(err)
                setSnackBarMessage(err.message)
                setOpenSnackBar(true)
            });
    }

    function onChangeRecaptcha(value: string | null) {
        //console.log("Captcha value:", value);
        setRecaptchaToken(value);
    }

    function onExpiredRecaptcha() {
        //console.log("Captcha expired");
        setRecaptchaToken(null);
    }

    return (
        <main
            className={clsx(defaultClasses.content, {
                [defaultClasses.contentShift]: open,
            })}
        >
            <div className={clsx(defaultClasses.container)}>
                <form onSubmit={verifyCaptcha}>
                    <Card className={classes.card}>
                        <CardHeader className={classes.header} title="Forgot password" />
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
                        </CardContent>
                        <CardActions className={classes.cardactions}>
                            <Button
                                variant="contained"
                                size="large"
                                color="secondary"
                                type="submit"
                                onSubmit={verifyCaptcha}
                            >
                                Submit
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
            <SnackBar openSnackBar={openSnackBar} snackBarSeverity={snackBarSeverity} snackBarMessage={snackBarMessage} parentState={setOpenSnackBar} />
        </main>
    )
}
