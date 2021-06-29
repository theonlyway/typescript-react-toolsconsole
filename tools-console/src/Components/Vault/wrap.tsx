import React, { useState, useEffect } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { Auth, API } from 'aws-amplify';
import { isMobile } from 'react-device-detect'
import {
    CircularProgress,
    Step,
    Stepper,
    StepLabel,
    StepContent,
    TextField,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Tooltip,
    Grid,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Paper
} from "@material-ui/core";
import { Color } from '@material-ui/lab/Alert';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import ReCAPTCHA from "react-google-recaptcha";
import DeleteIcon from '@material-ui/icons/Delete';
import { useAppSelector } from '../../redux/hooks'
import VaultOidc from "./oidc";
import SnackBar from '../Shared/snackbar'
import { useHistory } from 'react-router-dom';
import { DefaultStyles } from '../../styles/common'
import { IVaultAuth } from '../../redux/reducers/vaultoidc';
import { v4 as uuidv4 } from 'uuid';

interface IProps {
    pageTitle: string
}

interface ISecretItems {
    [key: string]: ISecretItem
}

interface ISecretItem {
    key: string,
    value: string
}

interface ISecretItemsErrors {
    [key: string]: ISecretItemError
}

interface ISecretItemError {
    key: {
        error: boolean,
        errorMessage: string
    },
    value: {
        error: boolean,
        errorMessage: string
    }
}

interface IObjectToWrap {
    [key: string]: string
}

interface IWrapDurations {
    [key: string]: string
}

interface IWrapResult {
    auth: null,
    data: null,
    lease_duration: number,
    lease_id: string,
    renewable: boolean,
    request_id: string,
    warnings: null,
    wrap_info: {
        accessor: string,
        creation_path: string,
        creation_time: string,
        ttl: number,
        token: string,
        expiry?: string
    }
    errors?: {
        [index: number]: string
    }
}

export default function Wrap(props: IProps) {

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
        durationFormControl: {
            margin: theme.spacing(1),
            minWidth: 200,
        }
    }));
    const awsConfig = useAppSelector(state => state.generalState.awsConfig)
    const vaultAuth = useAppSelector<IVaultAuth>(state => state.vaultOidcState.vaultAuth)
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
    const history = useHistory();
    const defaultClasses = DefaultStyles()
    // eslint-disable-next-line no-unused-vars
    const theme = useTheme();
    const [objectToWrap, setObjectToWrap] = useState<IObjectToWrap>({})
    const wrapDurations: IWrapDurations = {
        '1 day': '24h',
        '2 days': '48h',
        '3 days': '72h',
        '4 days': '96h',
        '5 days': '120h',
        '6 days': '144h',
        '7 days': '168h'
    }
    type TWrapDuration = typeof wrapDurations[keyof typeof wrapDurations]
    const [wrapDuration, setWrapDuration] = useState<TWrapDuration>(wrapDurations['1 day'])
    const [openResetDialog, setOpenResetDialog] = useState(false);
    const open = useAppSelector(state => state.generalState.drawerOpen);
    const [activeStep, setActiveStep] = useState(0);
    const steps = getSteps();
    const [unhideSelected, setUnhideSelected] = useState<{ key: null | string, unhide: boolean }>({
        key: null,
        unhide: false
    });
    const initialSecretItems: ISecretItems = {
        default: {
            key: '',
            value: ''
        }
    }
    const initialSecretItemsError: ISecretItemsErrors = {
        default: {
            key: {
                error: true,
                errorMessage: "Can not be empty"
            },
            value: {
                error: true,
                errorMessage: "Can not be empty"
            }
        }
    }
    const [secretItems, setSecretItems] = useState(initialSecretItems)
    const [secretItemsErrors, setSecretItemsErrors] = useState(initialSecretItemsError)
    const [openHelp, setOpenHelp] = useState(false);
    const [disableNextButton, setDisableNextButton] = useState(false);
    const [wrapResult, setWrapResult] = useState<IWrapResult | null>(null)
    const [vaultTokenMessage, setVaultTokenMessage] = useState('')

    function onChangeRecaptcha(value: string | null) {
        //console.log("Captcha value:", value);
        setRecaptchaToken(value);
    }

    function onExpiredRecaptcha() {
        //console.log("Captcha expired");
        setRecaptchaToken(null);
    }

    const handleNext = (event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
        event.preventDefault();
        if (activeStep === 1) {
            let wrapObj: IObjectToWrap = {}
            Object.keys(secretItems).forEach((key) => {
                wrapObj[secretItems[key].key] = secretItems[key].value
            })
            setObjectToWrap(wrapObj)
        }
        if (activeStep === steps.length - 1) {
            if (recaptchaToken !== null) {
                const dt = new Date().getTime()
                const expiry = Date.parse(vaultAuth.expiry!)
                if (dt >= expiry) {
                    setActiveStep(2)
                }
                else {
                    setResultLoading(true)
                    handleConfirmation()
                        .then(() => {
                            setResultLoading(false)
                        })
                        .catch((error) => {
                            setActiveStep((prevActiveStep) => prevActiveStep + 1)
                        })
                }
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

    const handleHelpOpen = () => {
        setOpenHelp(true);
    };

    const handleHelpClose = () => {
        setOpenHelp(false);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
    };

    const handleReset = () => {
        setActiveStep(0)
        setOpenResetDialog(false)
        setObjectToWrap({})
        setSecretItems(initialSecretItems)
        setSecretItemsErrors(initialSecretItemsError)
    };

    const handleResetOpen = () => {
        setOpenResetDialog(true);
    };

    const handleResetClose = () => {
        setOpenResetDialog(false);
    };

    const handleSendSms = () => {
        history.push({
            pathname: `/vault/sms`,
            state: {
                token: wrapResult?.wrap_info.token
            }
        })
    }

    const handleAddSecretItem = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        var cloneDeep = require('lodash/cloneDeep')
        let newSecretObj: ISecretItems = cloneDeep(secretItems)
        let newErrorObj: ISecretItemsErrors = cloneDeep(secretItemsErrors)
        const uuid = uuidv4()
        newSecretObj[uuid] = {
            key: '',
            value: ''
        }
        newErrorObj[uuid] = {
            key: {
                error: true,
                errorMessage: "Can not be empty"
            },
            value: {
                error: true,
                errorMessage: "Can not be empty"
            }
        }
        setSecretItems(newSecretObj)
        setSecretItemsErrors(newErrorObj)
    }

    const handleDeleteSecretItem = (event: React.MouseEvent<HTMLButtonElement>, key: string) => {
        event.preventDefault()
        var cloneDeep = require('lodash/cloneDeep')
        var omit = require('lodash/omit')
        let clonedObj: ISecretItems = cloneDeep(secretItems)
        let clonedErrorObj: ISecretItemsErrors = cloneDeep(secretItemsErrors)
        let newSecretObj: ISecretItems = omit(clonedObj, [key])
        let newErrorObj: ISecretItemsErrors = omit(clonedErrorObj, [key])
        setSecretItems(newSecretObj)
        setSecretItemsErrors(newErrorObj)
    }

    const handleSecretInput = (event: HTMLInputElement) => {
        var cloneDeep = require('lodash/cloneDeep')
        let newSecretObj: ISecretItems = cloneDeep(secretItems)
        let newErrorObj: ISecretItemsErrors = cloneDeep(secretItemsErrors)
        let keys = Object.keys(secretItemsErrors)
        let updateKey = event.id.split('_')
        let duplicateKey = keys.some(x => {
            if (secretItems[x].key === event.value) {
                return true
            }
            else {
                return false
            }
        })
        if (updateKey[1] === 'key') {
            if (event.value === '') {
                newSecretObj[updateKey[0]].key = event.value
                newErrorObj[updateKey[0]].key.error = true
            }
            else {
                if (duplicateKey) {
                    newSecretObj[updateKey[0]].key = event.value
                    newErrorObj[updateKey[0]].key.error = true
                    newErrorObj[updateKey[0]].key.errorMessage = "Key values must be unique"
                }
                else {
                    newSecretObj[updateKey[0]].key = event.value
                    newErrorObj[updateKey[0]].key.error = false
                }
            }
        }
        else if (updateKey[1] === 'value') {
            if (event.value === '') {
                newSecretObj[updateKey[0]].value = event.value
                newErrorObj[updateKey[0]].value.error = true
            }
            else {
                newSecretObj[updateKey[0]].value = event.value
                newErrorObj[updateKey[0]].value.error = false
            }
        }
        setSecretItemsErrors(newErrorObj)
        setSecretItems(newSecretObj)
    }

    useEffect(() => {
        document.title = pageTitle
    }, [props, pageTitle]);

    useEffect(() => {
        if (activeStep === 2 && vaultAuth === null) {
            setDisableNextButton(true)
        }
        else if (activeStep === 2 && vaultAuth !== null) {
            const dt = new Date().getTime()
            const expiry = Date.parse(vaultAuth.expiry!)
            if (dt < expiry) {
                setVaultTokenMessage(`Vault client token obtained. Your Vault token expires at: ${vaultAuth.expiry}. Please ensure you complete this operation before the token expires`)
                setDisableNextButton(false)
            }
            else {
                setVaultTokenMessage(`Your token expired at: ${vaultAuth.expiry}. Please refresh`)
                setDisableNextButton(true)
            }
        }
    }, [activeStep, vaultAuth]);

    useEffect(() => {
        let keys = Object.keys(secretItemsErrors)
        let errors = keys.some(x => {
            if (secretItemsErrors[x].key.error || secretItemsErrors[x].value.error) {
                return true
            }
            else {
                return false
            }
        })
        if (errors) {
            setDisableNextButton(true)
        }
        else {
            setDisableNextButton(false)
        }
    }, [secretItemsErrors]);

    async function handleConfirmation() {
        let headers = {
            headers: {
                Authorization: `Bearer ${(await Auth.currentSession()).getAccessToken().getJwtToken()}`,
            },
            body: {
                client_token: vaultAuth.auth.client_token,
                secret: JSON.stringify(objectToWrap),
                wrap_ttl: wrapDuration
            }
        };
        await API.post('console', '/vault/wrap', headers)
            .then((data) => {
                const dt = new Date().getTime()
                const expiry = new Date(dt)
                expiry.setSeconds(expiry.getSeconds() + data.wrap_info.ttl)
                data.wrap_info.expiry = expiry.toString()
                setWrapResult(data)
                setActiveStep((prevActiveStep) => prevActiveStep + 1)
            })
    }

    function getSteps() {
        return ['Input secrets to wrap', 'Select duration', 'Login to Vault', 'Confirmation'];
    }

    function getStepContent(step: number) {
        switch (step) {
            case 0: {
                return (
                    <React.Fragment>
                        {Object.keys(secretItems).map((key, index) => (
                            <Grid xs={12} container spacing={1} item key={index}>
                                <Grid xs={3} item>
                                    <FormControl fullWidth margin="dense">
                                        <TextField
                                            variant="outlined"
                                            required
                                            autoFocus
                                            id={key + "_key"}
                                            label="Key"
                                            name={key + "_key"}
                                            size="small"
                                            autoComplete="off"
                                            defaultValue={secretItems[key].key}
                                            error={secretItemsErrors[key].key.error}
                                            helperText={secretItemsErrors[key].key.error ? secretItemsErrors[key].key.errorMessage : null}
                                            onInput={e => handleSecretInput((e.target as HTMLInputElement))}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid xs={3} item>
                                    <FormControl fullWidth margin="dense">
                                        <TextField
                                            variant="outlined"
                                            required
                                            type="text"
                                            id={key + "_value"}
                                            label="Value"
                                            name={key + "_value"}
                                            size="small"
                                            autoComplete="off"
                                            defaultValue={secretItems[key].value}
                                            error={secretItemsErrors[key].value.error}
                                            helperText={secretItemsErrors[key].value.error ? secretItemsErrors[key].value.errorMessage : null}
                                            onInput={e => handleSecretInput((e.target as HTMLInputElement))}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid xs={3} item>
                                    {index === Object.keys(secretItems).length - 1 ?
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            className={classes.button}
                                            onClick={handleAddSecretItem}
                                            type="submit"
                                        >
                                            Add
                                        </Button>
                                        : null}
                                    {index !== 0 ?
                                        <Tooltip title="Delete">
                                            <IconButton color="primary" aria-label="unhide"
                                                onClick={e => handleDeleteSecretItem(e, key)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                        : null}
                                </Grid>
                            </Grid>
                        ))}
                    </React.Fragment>
                )
            }
            case 1: {
                return (
                    <FormControl className={classes.durationFormControl}>
                        <InputLabel id="wrapDurationLabel">Wrap duration</InputLabel>
                        <Select
                            labelId="wrapDurationLabel"
                            id="wrapDurationSelect"
                            value={wrapDuration}
                            onChange={e => setWrapDuration((e.target as HTMLInputElement).value)}
                        >
                            {Object.keys(wrapDurations).map((key) => (
                                <MenuItem key={key} value={wrapDurations[key]}>{key}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )
            }
            case 2: {
                if (vaultAuth === null) {
                    return (
                        <VaultOidc
                            oidcBaseUrl={awsConfig.vault_oidc.oidc_base_url}
                            windowName="VaultOIDC"
                            centerScreen={true}
                            buttonName="Vault Login"
                            disableButton={false}
                        />
                    )
                }
                else {
                    const dt = new Date().getTime()
                    const expiry = Date.parse(vaultAuth.expiry!)
                    if (dt >= expiry) {
                        return (
                            <React.Fragment>
                                <Typography>
                                    {vaultTokenMessage}
                                </Typography>
                                <VaultOidc
                                    oidcBaseUrl={awsConfig.vault_oidc.oidc_base_url}
                                    windowName="VaultOIDC"
                                    centerScreen={true}
                                    buttonName="Refresh token"
                                    disableButton={false}
                                />
                            </React.Fragment>
                        )
                    }
                    else {
                        return (
                            <React.Fragment>
                                <Typography>
                                    {vaultTokenMessage}
                                </Typography>
                                <VaultOidc
                                    oidcBaseUrl={awsConfig.vault_oidc.oidc_base_url}
                                    windowName="VaultOIDC"
                                    centerScreen={true}
                                    buttonName="Refresh token"
                                    disableButton={true}
                                />
                            </React.Fragment>
                        )
                    }
                }
            }
            case 3:
                {
                    return (
                        <React.Fragment>
                            <TableContainer>
                                <Typography gutterBottom={true}>Will attempt to wrap the following for: <code>{wrapDuration}</code></Typography>
                                <Table className={classes.table} size="small" aria-label="a dense table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center">Key</TableCell>
                                            <TableCell align="center">Value</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Object.keys(objectToWrap).map((key) => (
                                            <TableRow key={key}>
                                                <TableCell align="center" component="th" scope="row">
                                                    {key}
                                                </TableCell>
                                                <TableCell align="center" component="th" scope="row">
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
                                                    {unhideSelected.key === key && unhideSelected.unhide ? objectToWrap[key] : "********"}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <ReCAPTCHA
                                sitekey={awsConfig.recaptcha_v2_site_key}
                                onChange={onChangeRecaptcha}
                                onExpired={onExpiredRecaptcha}
                            />
                        </React.Fragment>
                    )
                }
        }
    }

    function getStepHelp(step: number) {
        switch (step) {
            case 0:
                return (
                    <Typography>
                        Input key value pairs to be wrapped. Each key should be unique and each key value pair should be filled out.
                        You can add and remove extra lines by clicking the Add or Delete buttons at the end of each line
                    </Typography>
                )
            case 1:
                return (
                    <Typography>
                        Select from the drop down the duration to wrap the secrets for. Once wrapped this duration will control when the wrapped token will expire and no longer be accessiable
                    </Typography>
                )
            case 2:
                return (
                    <Typography>
                        Login to ADFS to obtain a obtain your temporary Vault token that will be used to wrap your secrets under your credentials
                    </Typography>
                )
            case 3:
                return (
                    <Typography>
                        Confirm the secrets you input are correct
                    </Typography>
                )
            default:
                return null;
        }
    }

    function displayUnwrapResult() {
        if ('wrap_info' in wrapResult!) {
            return (
                <React.Fragment>
                    <Typography align="center" gutterBottom={true}>Your Wrapped token is: <code>{wrapResult['wrap_info']['token']}</code></Typography>
                    <Typography align="center" gutterBottom={true}>The wrapped token expires at: <code>{wrapResult['wrap_info']['expiry']}</code></Typography>
                    <Button onClick={handleResetOpen} variant="contained" color="secondary" className={classes.button}>
                        Reset
                    </Button>
                    <Button variant="contained" onClick={handleSendSms} color="primary" className={classes.button}>
                        SMS wrapped token
                    </Button>
                </React.Fragment>
            )
        }
        else if ('errors' in wrapResult!) {
            return (
                <React.Fragment>
                    <Typography align="center" gutterBottom={true}>Error: <code>{wrapResult!['errors']![0]}</code></Typography>
                    <Button onClick={handleReset} variant="contained" color="secondary" className={classes.button}>
                        Reset
                    </Button>
                </React.Fragment >
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
                    <form>
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
                                                    {'wrap_info' in wrapResult! ? "This will reset the form back to the start. If you have not recorded your wrapped token it will be lost and your secret will need to be re-wrapped" : "Start over?"}
                                                </DialogContentText>
                                            </DialogContent>
                                            <DialogActions>
                                                <Button onClick={handleReset} color="secondary" variant="contained" autoFocus>
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
