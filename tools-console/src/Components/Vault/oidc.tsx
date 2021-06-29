import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useAppSelector, useAppDispatch } from '../../redux/hooks'
import {
    Button,
    CircularProgress,
    Paper,
    TextField
} from "@material-ui/core";
import allActions from '../../redux/actions/allactions'
import { API, Auth } from 'aws-amplify';
import { v4 as uuidv4 } from 'uuid';
import { IOidcRequest } from '../../redux/reducers/vaultoidc'

//https://codepen.io/davidgilbertson/pen/xPVMqp
//https://dev.to/dinkydani21/how-we-use-a-popup-for-google-and-outlook-oauth-oci
//https://medium.com/the-new-control-plane/getting-an-adfs-jwt-token-73aeb1c0fcc
//https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
//https://stackoverflow.com/questions/58732237/oauth-popup-cross-domain-security-react-js
//https://github.com/hashicorp/vault-plugin-auth-jwt/issues/72 Need to sort out auth backends because can't do both OIDC and JWT

interface IProps {
    oidcBaseUrl: string,
    windowName: string,
    opts: string,
    centerScreen: boolean,
    buttonName: string,
    disableButton: boolean,
    debug: boolean
}

export default function Oidc(props: IProps) {
    const dispatch = useAppDispatch()
    const awsConfig = useAppSelector(state => state.generalState.awsConfig)
    const vaultOidcState = useAppSelector(state => state.vaultOidcState)
    const [oidcRequest, setOidcRequest] = useState<IOidcRequest | null>(null)
    const [oidcRequestState, setOidcRequestState] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [buttonDisabled, setButtonDisabled] = useState(false)
    const oauthAuthorizeRequestUrl = props.oidcBaseUrl + `/oauth2/authorize?client_id=${awsConfig.vault_oidc.client_id}&response_type=code&redirect_uri=${awsConfig.vault_oidc.redirect_uri}&response_mode=query&scope=openid&resource=${awsConfig.vault_oidc.resource}&nonce=${awsConfig.app_id}&state=`
    const useStyles = makeStyles((theme) => ({
        buttonContainer: {
            paddingTop: theme.spacing(2),
            paddingBottom: theme.spacing(4),
            display: "flex",
            "justify-content": "center",
            "align-items": "center",
            margin: "auto",
            width: '80%',
        },
        oidcContainer: {
            paddingTop: theme.spacing(2),
            paddingBottom: theme.spacing(4),
            display: "block",
            "justify-content": "center",
            "align-items": "center",
            margin: "auto",
            width: '80%',
            marginTop: theme.spacing(2)
        },
        codes: {
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(2),
            paddingTop: theme.spacing(2),
            paddingBottom: theme.spacing(2)
        },

    }));
    // eslint-disable-next-line no-unused-vars
    const theme = useTheme();
    const classes = useStyles();
    function centerScreen(height = 800, width = 600) {
        const y = window.top.outerHeight / 2 + window.top.screenY - (height / 2)
        const x = window.top.outerWidth / 2 + window.top.screenX - (width / 2)
        return {
            x: x,
            y: y
        }
    }

    function onClickHandler(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        setButtonDisabled(true)
        setIsLoading(true)
        let opts = props.opts
        if (props.centerScreen) {
            const center = centerScreen()
            opts = props.opts + `, top=${center.y}, left=${center.x}`
        }
        let state = uuidv4()
        setOidcRequestState(state)
        let windowObjectReference = window.open(oauthAuthorizeRequestUrl + state, props.windowName, opts)
        if (windowObjectReference !== null) {
            var timer = setInterval(() => {
                if (windowObjectReference!.closed) {
                    clearInterval(timer)
                    ////console.log('authorize window closed')
                    setButtonDisabled(false)
                }
            }, 1000)
        }
    }

    async function getJwt(code: string) {
        let init = {
            headers: {
                Authorization: `Bearer ${(await Auth.currentSession()).getAccessToken().getJwtToken()}`,
            },
            body: {
                code: code,
                client_id: awsConfig.vault_oidc.client_id,
                scope: 'openid',
                redirect_uri: awsConfig.vault_oidc.redirect_uri,
                grant_type: 'authorization_code',
                resource: awsConfig.vault_oidc.resource
            }
        };
        await API.post('console', '/vault/oidc', init)
            .then(data => {
                dispatch(allActions.vaultOidcActions.oidcJwtTokens(data))
                getVaultToken(data.id_token)
            })
            .catch(error => {
                //console.log(error)
            })
    }

    async function getVaultToken(idToken: string) {
        let init = {
            headers: {
                Authorization: `Bearer ${(await Auth.currentSession()).getAccessToken().getJwtToken()}`,
            },
            body: {
                id_token: idToken,
            }
        };
        await API.post('console', '/vault/login', init)
            .then(data => {
                const dt = new Date().getTime()
                const expiry = new Date(dt)
                expiry.setSeconds(expiry.getSeconds() + data.auth.lease_duration)
                data.expiry = expiry.toString()
                dispatch(allActions.vaultOidcActions.oidcVaultTokens(data))
            })
            .catch(error => {
                //console.log(error)
            })
    }

    useEffect(() => {
        window.addEventListener("message", (event) => {
            event.preventDefault()
            if (event.origin !== awsConfig.app_origin || event.data.source === "react-devtools-bridge" || event.data.source === "react-devtools-content-script") {
                return
            }
            ////console.log(event)
            dispatch(allActions.vaultOidcActions.oidcJwtCode(event.data))
            setOidcRequest(event.data)
            window.removeEventListener("message", (event) => {
                event.preventDefault()
                if (event.origin !== awsConfig.app_origin || event.data.source === "react-devtools-bridge" || event.data.source === "react-devtools-content-script") {
                    return
                }
                dispatch(allActions.vaultOidcActions.oidcJwtCode(event.data))
                setOidcRequest(event.data)
            }, false)
        }, false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (oidcRequest !== null && oidcRequest.state === oidcRequestState) {
            getJwt(oidcRequest.code)
            setButtonDisabled(false)
            setIsLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [oidcRequest]);

    useEffect(() => {
        if (vaultOidcState.jwt !== null) {
            setIsLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <React.Fragment>
            <Button variant="contained" color="secondary" disabled={buttonDisabled || props.disableButton ? true : false} onClick={onClickHandler}
                endIcon={buttonDisabled ? <CircularProgress size={18} /> : null}>
                {props.buttonName}
            </Button>
            {!isLoading && props.debug && (
                <Paper className={classes.oidcContainer}>
                    {oidcRequest !== null ?
                        <React.Fragment>
                            {Object.keys(oidcRequest).map((key) => (
                                <React.Fragment key={key}>
                                    <TextField className={classes.codes} id={key} label={key} defaultValue={oidcRequest[key as keyof IOidcRequest]} fullWidth />
                                </React.Fragment>
                            ))}
                        </React.Fragment>
                        : null}
                    {vaultOidcState.jwt !== null ?
                        <React.Fragment>
                            {Object.keys(vaultOidcState.jwt).map((key) => (
                                <React.Fragment key={key}>
                                    <TextField className={classes.codes} id={key} label={key} defaultValue={vaultOidcState.jwt[key]} fullWidth />
                                </React.Fragment>
                            ))}
                        </React.Fragment>
                        : null}
                </Paper>)}
        </React.Fragment >
    )
}


Oidc.propTypes = {
    oidcBaseUrl: PropTypes.string.isRequired,
    windowName: PropTypes.string,
    opts: PropTypes.string,
    centerScreen: PropTypes.bool,
    buttonName: PropTypes.string,
    disableButton: PropTypes.bool,
    debug: PropTypes.bool
}
Oidc.defaultProps = {
    windowName: "Oidc",
    opts: `alwaysOnTop=${1}, alwaysRaised=${1}, width=${600}, height=${800}`,
    centerScreen: false,
    disableButton: false,
    debug: false
}
