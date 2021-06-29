import React, { useState, useEffect } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useAppSelector, useAppDispatch } from '../../redux/hooks'
import clsx from 'clsx';
import {
    Card, CardHeader, CardContent, CardActions, Grid, TextField, Button, CircularProgress, InputLabel,
    Typography
} from "@material-ui/core";
import { Auth } from 'aws-amplify';
import { User } from '../Classes/classes'
import { RouteComponentProps } from 'react-router-dom';
import SnackBar from '../Shared/snackbar'
import { Color } from '@material-ui/lab/Alert';
import allActions from '../../redux/actions/allactions'
import { DefaultStyles } from '../../styles/common'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/material.css'

interface IProps extends RouteComponentProps {
    pageTitle: string
}

export default function Profile(props: IProps) {

    const dispatch = useAppDispatch()
    const [openSnackBar, setOpenSnackBar] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [snackBarSeverity, setSnackBarSeverity] = useState<Color>('error')
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [pageTitle] = useState(props.pageTitle)
    const [profile, setProfile] = useState(new User())
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const mobileNumberRegexPattern = /(?:\+?[0-9])/
    const mobileNumberRegexMatch = new RegExp(mobileNumberRegexPattern);
    const [updateDisabled, setUpdateDisabled] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const adfsUser = useAppSelector(state => state.userState.adfsUser);
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
    }));
    const defaultClasses = DefaultStyles()
    const classes = useStyles();
    // eslint-disable-next-line no-unused-vars
    const theme = useTheme();
    const open = useAppSelector(state => state.generalState.drawerOpen);

    function handleProfileUpdate(event: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        updateProfile()
    }

    function handleChangePassword(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        props.history.push({
            pathname: '/login/changepassword'
        })
    }


    async function updateProfile() {
        setIsLoading(true)
        const user = await Auth.currentAuthenticatedUser()
        await Auth.updateUserAttributes(user, {
            'given_name': firstName,
            'family_name': lastName,
            'phone_number': phoneNumber
        })
            .then(result => {
                //console.log(result)
                getProfile()
            })
            .catch(err => {
                //console.log(err)
                setSnackBarMessage(err.message)
                setOpenSnackBar(true)
                setIsLoading(false)
            });
    }

    async function getProfile() {
        await Auth.currentAuthenticatedUser({
            bypassCache: false  // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
        })
            .then(user => {
                //console.log(user)
                setProfile(new User(user.attributes.given_name, user.attributes.family_name, user.username, user.attributes.sub, user.attributes.email, user.attributes.email_verified, user.attributes.phone_number, user.signInUserSession.accessToken.payload["cognito:groups"] !== undefined ? user.signInUserSession.accessToken.payload["cognito:groups"] : []))
                setFirstName(user.attributes.given_name)
                setLastName(user.attributes.family_name)
                setPhoneNumber(user.attributes.phone_number)
                setIsLoading(false)
                dispatch(allActions.userActions.setUserProps(user))
            })
            .catch(err => {
                //console.log(err)
                props.history.push('/login')
            });
    }

    useEffect(() => {
        getProfile()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        document.title = pageTitle
    }, [props, pageTitle]);

    useEffect(() => {
        if (phoneNumber !== undefined && phoneNumber.length > 0) {
            let mobileFormatMatch = mobileNumberRegexMatch.exec(phoneNumber)
            if (mobileFormatMatch !== null && mobileFormatMatch[0] !== '') {
                setUpdateDisabled(false)
            }
            else {
                setUpdateDisabled(true)
            }
        }
    }, [phoneNumber]);

    return (
        <main
            className={clsx(defaultClasses.content, {
                [defaultClasses.contentShift]: open,
            })}
        >
            {isLoading ? <CircularProgress className={defaultClasses.loading} /> :
                <form className={defaultClasses.container} onSubmit={handleProfileUpdate}>
                    <Card>
                        <CardHeader className={classes.header} title="Profile" />
                        <CardContent>
                            <Grid container spacing={1}>
                                <Grid container item xs={12} spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            autoComplete="given-name"
                                            name="firstName"
                                            type="text"
                                            label="First Name"
                                            required
                                            defaultValue={profile.FirstName}
                                            onInput={(e) => setFirstName((e.target as HTMLInputElement).value)}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            name="lastName"
                                            autoComplete="family-name"
                                            type="text"
                                            label="Last Name"
                                            required
                                            defaultValue={profile.LastName}
                                            onInput={(e) => setLastName((e.target as HTMLInputElement).value)}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid container item xs={12} spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            required
                                            name="username"
                                            type="username"
                                            label="Username"
                                            disabled
                                            value={profile.Username}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            required
                                            name="email"
                                            type="email"
                                            label="Email"
                                            disabled
                                            value={profile.Email}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid container item xs={12} spacing={2}>
                                    <Grid item xs={6}>
                                        <PhoneInput
                                            inputProps={{
                                                name: 'phone',
                                                required: true
                                            }}
                                            placeholder={profile.PhoneNumber}
                                            country="au"
                                            enableSearch
                                            enableLongNumbers
                                            value={profile.PhoneNumber !== undefined ? profile.PhoneNumber : null}
                                            inputStyle={{ width: '100%' }}
                                            dropdownStyle={{ position: "fixed" }}
                                            onChange={(value, country, e, formattedValue) => setPhoneNumber("+" + value)}
                                            autocompleteSearch
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <InputLabel shrink htmlFor="select-multiple-native">
                                            Group membership
                                        </InputLabel>
                                        {profile.Groups.map((group) => (
                                            <Typography key={group} component="li" gutterBottom={true}>{group}</Typography>
                                        ))}
                                    </Grid>
                                </Grid>
                            </Grid>
                        </CardContent>
                        <CardActions>
                            <Grid container justify="center">
                                <Button
                                    variant="contained"
                                    size="large"
                                    color="secondary"
                                    type="submit"
                                    disabled={updateDisabled}
                                    onClick={handleProfileUpdate}>
                                    Update profile
                                </Button>
                            </Grid>
                        </CardActions>
                        {!adfsUser ?
                            <CardActions>
                                <Grid container justify="center">
                                    <Button
                                        variant="contained"
                                        size="large"
                                        color="secondary"
                                        type="submit"
                                        onClick={handleChangePassword}>
                                        Change password
                                    </Button>
                                </Grid>
                            </CardActions>
                            : null}
                    </Card>
                </form>
            }
            <SnackBar openSnackBar={openSnackBar} autoHideDuration={10000} snackBarSeverity={snackBarSeverity} snackBarMessage={snackBarMessage} elevation={6} parentState={setOpenSnackBar} />
        </main >
    )
}
