import React, { useState, useEffect } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import FileSaver from 'file-saver';
import clsx from 'clsx';
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
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    List,
    ListItem,
    ListItemText,
    TextField,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Divider,
    Tooltip
} from "@material-ui/core";
import { Color } from '@material-ui/lab/Alert';
import ReCAPTCHA from "react-google-recaptcha";
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import VpnKeyOutlinedIcon from '@material-ui/icons/VpnKeyOutlined';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import { useAppSelector, useAppDispatch } from '../../redux/hooks'
import allActions from '../../redux/actions/allactions'
import SnackBar from '../Shared/snackbar'
import { IUnwrapResult } from '../../redux/reducers/unwrap'
import { DefaultStyles } from '../../styles/common'

interface IProps {
    pageTitle: string
    match: {
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

export default function Unwrap(props: IProps) {

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
        tokenText: {
            'font-weight': 'bold',
            'font-size': '18px'
        },
        table: {
            "justify-content": "center",
            "align-items": "center",
            margin: "auto",
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
        },
        codeBlock: {
            display: "block"
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
    // eslint-disable-next-line no-unused-vars
    const unwrapSampleResponse = {
        "request_id": "f91cc86d-4405-e6a6-9ab6-8f8bfc2a5833",
        "lease_id": "",
        "renewable": false,
        "lease_duration": 0,
        "data": {
            "password": "passwordblah",
            "username": "blah"
        },
        "wrap_info": null,
        "warnings": null,
        "auth": null
    }
    const awsConfig = useAppSelector(state => state.generalState.awsConfig)
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
    const [openSnackBar, setOpenSnackBar] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [snackBarSeverity, setSnackBarSeverity] = useState<Color>('error')
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [pageTitle] = useState(props.pageTitle);
    // eslint-disable-next-line no-unused-vars
    const [isLoading, setIsLoading] = useState(false);
    const [resultLoading, setResultLoading] = useState(false);
    const classes = useStyles();
    const defaultClasses = DefaultStyles()
    const theme = useTheme();
    const open = useAppSelector(state => state.generalState.drawerOpen);
    const [activeStep, setActiveStep] = React.useState(0);
    const steps = getSteps();
    const [unwrapMethod, setUnwrapMethod] = React.useState('manual');
    const [openHelp, setOpenHelp] = useState(false);
    const [tokenInput, setTokenInput] = useState('');
    const [disableNextButton, setDisableNextButton] = useState(false);
    const [downloadButtonClicked, setDownloadButtonClicked] = useState(false);
    const [unwrapResult, setUnwrapResult] = useState<IUnwrapResult | null>(null);
    const [tokenLookup, setTokenLookup] = useState<ITokenLookup | null>(null);
    const [openResetDialog, setOpenResetDialog] = useState(false);
    const globalUnwrapState = useAppSelector(state => state.unwrapState);
    const tokenRegexPattern = /(?:\.).*/; // (?<=s\.).* should work but Safari sucks https://caniuse.com/js-regexp-lookbehind
    const tokenRegexMatch = new RegExp(tokenRegexPattern);
    const [tokenInputError, setTokenInputError] = useState(true);
    const [unhideSelected, setUnhideSelected] = useState<{ key: null | string, unhide: boolean }>({
        key: null,
        unhide: false
    });
    const dispatch = useAppDispatch()

    const handleUnwrapMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUnwrapMethod(event.target.value);
    };

    function onChangeRecaptcha(value: string | null) {
        //console.log("Captcha value:", value);
        setRecaptchaToken(value);
    }

    function onExpiredRecaptcha() {
        //console.log("Captcha expired");
        setRecaptchaToken(null);
    }

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

    const handleNext = (event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
        event.preventDefault();
        if (activeStep === 1) {
            lookupToken(tokenInput)
        }
        if (activeStep === steps.length - 1) {
            if (recaptchaToken !== null) {
                setResultLoading(true)
                handleConfirmation().then(() => {
                    setResultLoading(false)
                })
            }
            else {
                setSnackBarMessage("Please complete captcha")
                setOpenSnackBar(true)
            }
        }
        else {
            setActiveStep((prevActiveStep) => prevActiveStep + 1)
        }
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
        setTokenLookup(null)
    };

    const handleReset = () => {
        setActiveStep(0);
        setTokenInput('');
        setDownloadButtonClicked(false);
        dispatch(allActions.unwrapActions.resetUnwrapProps())
        setOpenResetDialog(false)
    };

    const handleDownload = () => {
        createCsvData()
        setDownloadButtonClicked(true)
    };

    const handleHelpOpen = () => {
        setOpenHelp(true);
    };

    const handleHelpClose = () => {
        setOpenHelp(false);
    };

    const handleResetOpen = () => {
        setOpenResetDialog(true);
    };

    const handleResetClose = () => {
        setOpenResetDialog(false);
    };

    function createCsvData() {
        let csv = ''
        let row = ''
        let headers = ''
        headers = headers.concat('key', ',', 'value')
        csv = csv.concat(headers)

        Object.keys(unwrapResult!.data).map((key) => (
            row = row.concat(
                "\n",
                key, ",",
                unwrapResult!.data[key]
            )
        ))
        csv = csv.concat(row)
        const csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        FileSaver.saveAs(csvData, (tokenInput + '.csv'));
    }

    useEffect(() => {
        document.title = pageTitle
    }, [props, pageTitle]);

    useEffect(() => {
        if (Object.keys(props.match.params).length > 0 && props.match.params.token !== undefined) {
            setActiveStep(steps.length - 1)
            setTokenInput(props.match.params.token)
            lookupToken(props.match.params.token)
            setDisableNextButton(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.match.params.token]);

    useEffect(() => {
        if (globalUnwrapState.activeStep === steps.length && globalUnwrapState.unwrapResult !== null) {
            setActiveStep(globalUnwrapState.activeStep);
            setUnwrapResult(globalUnwrapState.unwrapResult);
            setTokenInput(globalUnwrapState.tokenInput)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [globalUnwrapState]);

    useEffect(() => {
        if (activeStep === 0) {
            setDisableNextButton(false)
        }
        else if (activeStep === 1 && tokenInput.length === 0) {
            setTokenInputError(true)
            setDisableNextButton(true);
        }
        else if (activeStep >= 1) {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeStep, tokenInput]);

    async function handleConfirmation() {
        let init = {
            method: 'post',
            headers: {
                'X-API-Key': awsConfig.unauth_api_key
            },
            body: JSON.stringify({
                token: tokenInput
            })
        };

        await fetch(awsConfig.aws_cloud_logic_custom[0].endpoint + '/vault/unwrap', init)
            .then(result => {
                return result.json()
            })
            .then(result => {
                setUnwrapResult(result)
                dispatch(allActions.unwrapActions.setUnwrapProps(
                    {
                        activeStep: activeStep + 1,
                        unwrapResult: result,
                        tokenInput: tokenInput
                    }
                ))
            })
            .catch(error => {
                console.error(error)
                setSnackBarMessage(error.message)
                setOpenSnackBar(true)
            })
    }

    function getSteps() {
        return ['Select token unwrap method', 'Provide wrapped token', 'Confirmation'];
    }

    function getStepContent(step: number) {
        switch (step) {
            case 0:
                return (
                    <React.Fragment>
                        <RadioGroup aria-label="unwrapMethod" name="unwrapMethod" value={unwrapMethod} onChange={handleUnwrapMethodChange}>
                            <FormControlLabel value="manual" control={<Radio name="manual" />} label="Manual token input" />
                            <FormControlLabel value="saved" disabled={true} control={<Radio />} label="Select from list of saved tokens" />
                        </RadioGroup>
                    </React.Fragment>
                )
            case 1:
                if (unwrapMethod === "manual") {
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
                }
                else if (unwrapMethod === "saved") {
                    return 'saved'
                }
                else {
                    return null
                }
            case 2:
                if (!tokenInputError) {
                    const output = () => {
                        if (tokenLookup === null) {
                            return (
                                <code>{"Token: " + tokenInput}</code>
                            )
                        }
                        else {
                            const dt = new Date(tokenLookup.data.creation_time)
                            const expiry = new Date(tokenLookup.data.creation_time)
                            expiry.setSeconds(expiry.getSeconds() + tokenLookup.data.creation_ttl)
                            return (
                                <React.Fragment>
                                    <code className={classes.codeBlock}>
                                        {"Token: " + tokenInput}
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
                                Will attempt to unwrap the following
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
                else {
                    return (
                        <List dense={true}>
                            <ListItem divider>
                                <ListItemText
                                    primary="The token you have provided does not match a valid wrapped token format"
                                    classes={{
                                        secondary: classes.tokenText
                                    }}
                                    secondary={<code>{"Token: " + tokenInput}</code>}
                                    primaryTypographyProps={{
                                        variant: 'h6',
                                        gutterBottom: true
                                    }}
                                    secondaryTypographyProps={{
                                        gutterBottom: true
                                    }}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    secondary="Go back and input the a wrapped token in the correct format"
                                    primaryTypographyProps={{
                                        variant: 'subtitle1',
                                        gutterBottom: true
                                    }}
                                    secondaryTypographyProps={{
                                        variant: 'body2'
                                    }}
                                />
                            </ListItem>
                        </List>
                    )
                }
            default:
                return null;
        }
    }

    function getStepHelp(step: number) {
        switch (step) {
            case 0:
                return (
                    <List dense={true}>
                        <ListItem>
                            <ListItemText
                                primary="Manual token input"
                                secondary="Use this selection if you were provided a token via an external method (SMS, Email etc). You will be provided with a text box to input your wrapped token in the next step"
                                primaryTypographyProps={{
                                    variant: 'h5',
                                    gutterBottom: true
                                }}
                                secondaryTypographyProps={{
                                    variant: 'body2'
                                }}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary="Select from list of saved tokens"
                                secondary="This option will only be available if you are logged in and it will give you a pre-populated list of tokens saved against your username"
                                primaryTypographyProps={{
                                    variant: 'h5',
                                    gutterBottom: true
                                }}
                                secondaryTypographyProps={{
                                    variant: 'body2'
                                }}
                            />
                        </ListItem>
                    </List>
                )
            case 1:
                if (unwrapMethod === 'manual') {
                    return (
                        <List dense={true}>
                            <ListItem>
                                <ListItemText
                                    primary="Manual token input"
                                    secondary="You selected manual token input from the previous step so in this step input your token in to the text field to continue"
                                    primaryTypographyProps={{
                                        variant: 'h5',
                                        gutterBottom: true
                                    }}
                                    secondaryTypographyProps={{
                                        variant: 'body2'
                                    }}
                                />
                            </ListItem>
                        </List>
                    )
                }
                else if (unwrapMethod === 'saved') {
                    return (
                        <List dense={true}>
                            <ListItem>
                                <ListItemText
                                    primary="Saved token selection"
                                    secondary="From the drop down menu select the token you would like to unwrap"
                                    primaryTypographyProps={{
                                        variant: 'h5',
                                        gutterBottom: true
                                    }}
                                    secondaryTypographyProps={{
                                        variant: 'body2'
                                    }}
                                />
                            </ListItem>
                        </List>
                    )
                }
                else {
                    return null;
                }
            case 2:
                return (
                    <List dense={true}>
                        <ListItem>
                            <ListItemText
                                primary="Confirmation"
                                secondary="Confirm the wrapped token you have selected or input is correct and confirm whether you would like to continue to unwrap it or not"
                                primaryTypographyProps={{
                                    variant: 'h5',
                                    gutterBottom: true
                                }}
                                secondaryTypographyProps={{
                                    variant: 'body2'
                                }}
                            />
                        </ListItem>
                    </List>
                )
            default:
                return null;
        }
    }

    function displayUnwrapResult() {
        if ('data' in unwrapResult!) {
            return (
                <React.Fragment>
                    <TableContainer>
                        <Typography align="center" gutterBottom={true}>Results for token: <code>{tokenInput}</code></Typography>
                        <Table className={classes.table} size="small" aria-label="a dense table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">Key</TableCell>
                                    <TableCell align="center">Value</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.keys(unwrapResult.data).map((key) => (
                                    <TableRow key={key}>
                                        <TableCell align="center" component="th" scope="row">
                                            {key}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Copy to clipboard">
                                                <IconButton color="primary" aria-label="unhide" onClick={() => {
                                                    navigator.clipboard.writeText(unwrapResult.data[key])
                                                    setSnackBarMessage('Copied to clipboard')
                                                    setSnackBarSeverity('success')
                                                    setOpenSnackBar(true)
                                                }}>
                                                    <AssignmentTurnedInIcon />
                                                </IconButton>
                                            </Tooltip>
                                            {unhideSelected.key === key && unhideSelected.unhide ?
                                                <Tooltip title="Hide">
                                                    <IconButton color="primary" aria-label="unhide" onClick={() => {
                                                        setUnhideSelected(
                                                            {
                                                                key: key,
                                                                unhide: false
                                                            }
                                                        )
                                                    }}>
                                                        <VisibilityOffIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                :
                                                <Tooltip title="Unhide">
                                                    <IconButton color="primary" aria-label="hide" onClick={() => {
                                                        setUnhideSelected(
                                                            {
                                                                key: key,
                                                                unhide: true
                                                            }
                                                        )
                                                    }}>
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            }
                                            {unhideSelected.key === key && unhideSelected.unhide ? unwrapResult.data[key] : "********"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Button onClick={handleResetOpen} variant="contained" color="secondary" className={classes.button}>
                        Reset
                    </Button>
                    <Button onClick={handleDownload} variant="contained" color="primary" className={classes.button}>
                        Download
                    </Button>
                </React.Fragment>
            )
        }
        else if ('errors' in unwrapResult!) {
            return (
                <React.Fragment>
                    <Typography gutterBottom={true} variant="h5">{"Failed to unwrap token: " + tokenInput}</Typography>
                    <Divider style={{ marginBottom: theme.spacing(1), marginTop: theme.spacing(1) }} />
                    <Typography gutterBottom={true}>{"This can be for a number of reasons such as:"}</Typography>
                    <Typography gutterBottom={true} component="li">{`You entered an incorrect token`}</Typography>
                    <Typography gutterBottom={true} component="li">{`The expiry set during the wrapped token creation has been reached and is now no longer available to be unwrapped`}</Typography>
                    <Typography gutterBottom={true} component="li">{`Your token has already been unwrapped previously either by you or someone else. If you believe the token was unwrapped by someone else and it wasn't intended please contact us immediately!`}</Typography>
                    <Divider style={{ marginBottom: theme.spacing(1), marginTop: theme.spacing(1) }} />
                    <Typography style={{ marginTop: theme.spacing(2) }} gutterBottom={true}>Click the reset button below to start again</Typography>
                    <Button onClick={handleReset} variant="contained" color="secondary" className={classes.button}>
                        Reset
                    </Button>
                </React.Fragment>)
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
                                                <IconButton color="primary" aria-label="help" onClick={handleHelpOpen}>
                                                    <HelpOutlineIcon />
                                                </IconButton>
                                                <Dialog
                                                    open={openHelp}
                                                    onClose={handleHelpClose}
                                                    aria-labelledby="alert-dialog-title"
                                                    aria-describedby="alert-dialog-description"
                                                >
                                                    <DialogTitle id="alert-dialog-title">{'Help - ' + label}</DialogTitle>
                                                    <DialogContent>
                                                        <DialogContentText id="alert-dialog-description">
                                                            {getStepHelp(index)}
                                                        </DialogContentText>
                                                    </DialogContent>
                                                    <DialogActions>
                                                        <Button onClick={handleHelpClose} color="primary" autoFocus>
                                                            OK
                                                        </Button>
                                                    </DialogActions>
                                                </Dialog>
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
                                        <Dialog
                                            open={openResetDialog}
                                            onClose={handleResetClose}
                                            aria-labelledby="alert-dialog-title"
                                            aria-describedby="alert-dialog-description"
                                        >
                                            <DialogTitle id="alert-dialog-title">Confirm reset</DialogTitle>
                                            <DialogContent>
                                                <DialogContentText id="alert-dialog-description">
                                                    {downloadButtonClicked ? "Would you like to reset the back to the start? The result from the token you just unwrapped will not be accessiable again once this occurs" :
                                                        "Reset function is blocked as you haven't downloaded a copy of your unwrapped token results. To avoid potentional loss of information please go back and download your unwrapped token results before trying to reset"}
                                                </DialogContentText>
                                            </DialogContent>
                                            <DialogActions>
                                                <Button onClick={handleReset} color="secondary" variant="contained" disabled={!downloadButtonClicked} autoFocus>
                                                    Reset
                                                </Button>
                                                <Button onClick={handleResetClose} color="primary" autoFocus>
                                                    Return
                                                </Button>
                                            </DialogActions>
                                        </Dialog>
                                    </Paper>
                                )}
                            </React.Fragment>
                        }
                    </form>
                    <SnackBar openSnackBar={openSnackBar} snackBarSeverity={snackBarSeverity} snackBarMessage={snackBarMessage} parentState={setOpenSnackBar} />
                </div>
            }
        </main >
    )
}
