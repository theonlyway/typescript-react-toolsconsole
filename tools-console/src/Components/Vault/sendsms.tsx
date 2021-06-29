import React, { useState, useEffect } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useAppSelector } from '../../redux/hooks'
import clsx from 'clsx';
import { API, Auth } from 'aws-amplify';
import { isMobile } from 'react-device-detect'
import {
    CircularProgress,
    Step,
    Stepper,
    StepLabel,
    StepContent,
    Button,
    Paper,
    Radio,
    Typography,
    RadioGroup,
    FormControlLabel,
    List,
    TextField,
    InputAdornment,
    Divider,
} from "@material-ui/core";
import { Color } from '@material-ui/lab/Alert';
import VpnKeyOutlinedIcon from '@material-ui/icons/VpnKeyOutlined';
import ReCAPTCHA from "react-google-recaptcha";
import SnackBar from '../Shared/snackbar'
import { DefaultStyles } from '../../styles/common'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/material.css'

interface IProps {
    pageTitle: string
    location: {
        [key: string]: any
    }
}

interface ITokenLookup {
    request_id: string,
    lease_id: string,
    renewable: boolean,
    lease_duration: number
    data: {
        creation_path: string,
        creation_time: string,
        creation_ttl: number
    }
    wrap_info: null
    warnings: null
    auth: null
}

export default function SendSms(props: IProps) {

    const useStyles = makeStyles((theme) => ({
        button: {
            marginTop: theme.spacing(1),
            marginRight: theme.spacing(1),
        },
        actionsContainer: {
            marginBottom: theme.spacing(2),
        },
        resetContainer: {
            padding: theme.spacing(3),
            marginTop: theme.spacing(2)
        },
        stepperContainer: {
            paddingTop: theme.spacing(2),
            paddingBottom: theme.spacing(4),
            display: "block",
            "justify-content": "center",
            "align-items": "center",
            margin: "auto",
            width: isMobile ? '100%' : '50%',
        },
        snackBar: {
            width: '100%',
            '& > * + *': {
                marginTop: theme.spacing(2),
            },
        },
        stepper: {
            'box-shadow': '0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)'
        },
        resultLoading: {
            display: "flex",
            "justify-content": "center",
            "align-items": "center",
            margin: "auto",
            marginTop: theme.spacing(2)
        },
        codeBlock: {
            display: "block"
        }
    }));
    const awsConfig = useAppSelector(state => state.generalState.awsConfig)
    const [openSnackBar, setOpenSnackBar] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [snackBarSeverity, setSnackBarSeverity] = useState<Color>('error')
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [pageTitle] = useState(props.pageTitle);
    // eslint-disable-next-line no-unused-vars
    const [isLoading, setIsLoading] = useState(false);
    const classes = useStyles();
    const defaultClasses = DefaultStyles()
    // eslint-disable-next-line no-unused-vars
    const theme = useTheme();
    const open = useAppSelector(state => state.generalState.drawerOpen);
    const [activeStep, setActiveStep] = useState(0);
    const steps = getSteps();
    const [disableNextButton, setDisableNextButton] = useState(false);
    const [resultLoading, setResultLoading] = useState(false);
    const [smsMethod, setSmsMethod] = useState('manual');
    const [mobileNumber, setMobileNumer] = useState('');
    const mobileNumberRegexPattern = /^\d{8,}$/
    const mobileNumberRegexMatch = new RegExp(mobileNumberRegexPattern);
    const tokenRegexPattern = /(?<=s\.).*/;
    const tokenRegexMatch = new RegExp(tokenRegexPattern);
    const [tokenLookup, setTokenLookup] = useState<ITokenLookup | null>(null);
    const [tokenInputError, setTokenInputError] = useState(true);
    const [tokenInput, setTokenInput] = useState('');
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
    const [smsResult, setSmsResult] = useState('')

    const handleSmsMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSmsMethod(event.target.value);
    };

    const handleNext = (event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
        event.preventDefault();
        if (activeStep === 2) {
            lookupToken(tokenInput)
        }
        if (activeStep === steps.length - 1) {
            if (recaptchaToken !== null) {
                setResultLoading(true)
                handleConfirmation()
                    .then(() => {
                        setResultLoading(false)
                    })
                    .catch(() => {
                        setResultLoading(false)
                    })
                    .finally(() => {
                        setActiveStep((prevActiveStep) => prevActiveStep + 1)
                    })
            }
            else {
                setSnackBarMessage("Please complete captcha")
                setOpenSnackBar(true)
            }
        }
        else {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
    };

    async function lookupToken(token: string) {
        let init = {
            method: 'post',
            headers: {
                'X-API-Key': awsConfig.unauth_api_key
            },
            body: JSON.stringify({
                token: token
            })
        };
        await fetch(awsConfig.aws_cloud_logic_custom[0].endpoint + '/vault/lookup', init)
            .then(result => {
                return result.json()
            })
            .then(result => {
                if ('errors' in result === false) {
                    setTokenLookup(result)
                }
            })
    }

    async function handleConfirmation() {
        let init = {
            headers: {
                Authorization: `Bearer ${(await Auth.currentSession()).getAccessToken().getJwtToken()}`,
            },
            body: {
                wrapped_secret: tokenInput,
                mobile_number: mobileNumber
            }
        };
        await API.post('console', '/vault/sendsms', init)
            .then(data => {
                //console.log(data)
                setSmsResult(data)
            })
            .catch(error => {
                //console.log(error)
                setSmsResult("Failed to send SMS. Reason: " + error.message)
            })
    }

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
        setTokenLookup(null)
    };

    const handleReset = () => {
        setActiveStep(0);
        setMobileNumer('')
        setTokenInput('')
    };

    function onChangeRecaptcha(value: string | null) {
        //console.log("Captcha value:", value);
        setRecaptchaToken(value);
    }

    function onExpiredRecaptcha() {
        //console.log("Captcha expired");
        setRecaptchaToken(null);
    }

    useEffect(() => {
        document.title = pageTitle
    }, [props, pageTitle]);

    useEffect(() => {
        if (props.location.state !== undefined && 'token' in props.location.state) {
            setTokenInput(props.location.state.token)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.location]);

    useEffect(() => {
        if (activeStep === 0) {
            setDisableNextButton(false)
        }
        else if (activeStep === 1 && mobileNumber.length === 0) {
            setDisableNextButton(true);
        }
        else if (activeStep === 2 && tokenInput.length === 0) {
            setTokenInputError(true)
            setDisableNextButton(true);
        }
        else if (activeStep >= 1) {
            if (mobileNumber.length > 0) {
                let mobileFormatMatch = mobileNumberRegexMatch.exec(mobileNumber)
                if (mobileFormatMatch !== null && mobileFormatMatch[0] !== '') {
                    setDisableNextButton(false);
                }
                else {
                    setDisableNextButton(true);
                }
            }
            else {
                setDisableNextButton(true);
            }
            if (activeStep === 2) {
                let tokenFormatMatch = tokenRegexMatch.exec(tokenInput)
                if (tokenFormatMatch !== null && tokenFormatMatch[0] !== '') {
                    setTokenInputError(false);
                    setDisableNextButton(false);
                }
                else {
                    setTokenInputError(true);
                    setDisableNextButton(true);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeStep, mobileNumber, tokenInput]);

    function getSteps() {
        return ['Select SMS method', 'Provide mobile number', 'Provide wrapped token', 'Confirmation'];
    }

    function getStepContent(step: number) {
        switch (step) {
            case 0:
                return (
                    <React.Fragment>
                        <RadioGroup aria-label="smsMethod" name="smsMethod" value={smsMethod} onChange={handleSmsMethodChange}>
                            <FormControlLabel value="manual" control={<Radio />} label="Manual phone number input" />
                            <FormControlLabel value="saved" disabled={true} control={<Radio />} label="Select from list of users" />
                        </RadioGroup>
                    </React.Fragment>
                )
            case 1:
                if (smsMethod === "manual") {
                    return (
                        <PhoneInput
                            inputProps={{
                                name: 'phone',
                                required: true,
                                autoFocus: true
                            }}
                            country="au"
                            enableSearch={true}
                            enableLongNumbers={true}
                            inputStyle={{ width: isMobile ? '100%' : '40%' }}
                            onChange={(value, country, e, formattedValue) => setMobileNumer(value)}
                            autocompleteSearch={true}
                        />
                    )
                }
                else if (smsMethod === "saved") {
                    return 'saved'
                }
                else {
                    return null
                }
            case 2:
                return (
                    <TextField
                        id="manualToken"
                        type="text"
                        label="Wrapped token"
                        placeholder="Token"
                        margin="normal"
                        autoFocus
                        required
                        defaultValue={tokenInput}
                        helperText={tokenInputError ? "Input needs to be a valid token format" : null}
                        error={tokenInputError}
                        style={{ width: isMobile ? '100%' : '30%' }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <VpnKeyOutlinedIcon />
                                </InputAdornment>
                            ),
                        }}
                        onInput={e => setTokenInput((e.target as HTMLInputElement).value)}
                    />
                )
            case 3: {
                const output = () => {
                    if (tokenLookup === null) {
                        return (
                            <React.Fragment>
                                <code className={classes.codeBlock}>
                                    Mobile: {mobileNumber}
                                </code>
                                <code className={classes.codeBlock}>
                                    Token: {tokenInput}
                                </code>
                            </React.Fragment>
                        )
                    }
                    else {
                        const dt = new Date(tokenLookup.data.creation_time)
                        const expiry = new Date(tokenLookup.data.creation_time)
                        expiry.setSeconds(expiry.getSeconds() + tokenLookup.data.creation_ttl)
                        return (
                            <React.Fragment>
                                <code className={classes.codeBlock}>
                                    Mobile: {mobileNumber}
                                </code>
                                <code className={classes.codeBlock}>
                                    Token: {tokenInput}
                                </code>
                                <code className={classes.codeBlock}>
                                    {"Token creation time: " + dt}
                                </code>
                                <code className={classes.codeBlock}>
                                    {"Token expires at: " + expiry}
                                </code>
                            </React.Fragment >
                        )
                    }
                }
                return (
                    <List dense={true}>
                        <Typography variant="h6">
                            Will attempt to send an SMS to the following
                        </Typography>
                        <Divider style={{ marginBottom: theme.spacing(1), marginTop: theme.spacing(1) }} />
                        {output()}
                        <Divider style={{ marginBottom: theme.spacing(1), marginTop: theme.spacing(1) }} />
                        <ReCAPTCHA
                            sitekey={awsConfig.recaptcha_v2_site_key}
                            onChange={onChangeRecaptcha}
                            onExpired={onExpiredRecaptcha}
                        />
                    </List>
                )
            }
            default:
                return null;
        }
    }

    function displayUnwrapResult() {
        if (smsResult !== null) {
            return (
                <React.Fragment>
                    <Typography variant="h6">
                        {smsResult}
                    </Typography>
                    <Button onClick={handleReset} color="secondary" variant="contained" autoFocus>
                        Reset
                    </Button>
                </React.Fragment>
            )
        }
    }

    return (
        <main
            className={clsx(defaultClasses.content, {
                [defaultClasses.contentShift]: open,
            })}
        >
            {isLoading ? <CircularProgress className={defaultClasses.loading} /> :
                <div className={classes.stepperContainer}>
                    <form onSubmit={handleNext}>
                        <Stepper activeStep={activeStep} orientation="vertical" variant="elevation" elevation={1} className={defaultClasses.root}>
                            {steps.map((label, index) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                    <StepContent>
                                        {getStepContent(index)}
                                        <div className={classes.actionsContainer}>
                                            <div>
                                                <Button
                                                    disabled={activeStep === 0}
                                                    onClick={handleBack}
                                                    className={classes.button}
                                                >
                                                    Back
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={handleNext}
                                                    className={classes.button}
                                                    disabled={disableNextButton}
                                                    type="submit"
                                                >
                                                    {activeStep === steps.length - 1 ? 'Confirm' : 'Next'}
                                                </Button>
                                            </div>
                                        </div>
                                    </StepContent>
                                </Step>
                            ))}
                        </Stepper>
                        {resultLoading ? <CircularProgress className={classes.resultLoading} /> :
                            <React.Fragment>
                                {activeStep === steps.length && (
                                    <Paper square variant="elevation" elevation={1} className={classes.resetContainer}>
                                        {displayUnwrapResult()}
                                    </Paper>
                                )}
                            </React.Fragment>
                        }
                    </form>
                    <SnackBar openSnackBar={openSnackBar} snackBarSeverity={snackBarSeverity} snackBarMessage={snackBarMessage} parentState={setOpenSnackBar} />
                </div>
            }
        </main>
    )
}
