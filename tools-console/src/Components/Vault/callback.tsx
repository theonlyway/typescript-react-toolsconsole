import React, { useEffect } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {
    useHistory
} from "react-router-dom";
import clsx from 'clsx';
import {
    Container
} from "@material-ui/core";
import { useAppSelector } from '../../redux/hooks'

interface IProps {
    pageTitle: string
}

export default function VaultOidcCallback(props: IProps) {
    // eslint-disable-next-line no-unused-vars
    const theme = useTheme();
    const awsConfig = useAppSelector(state => state.generalState.awsConfig)
    const history = useHistory();
    const drawerWidth = useAppSelector(state => state.generalState.drawerWidth);
    const useStyles = makeStyles((theme) => ({
        content: {
            flexGrow: 1,
            padding: theme.spacing(3),
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            marginLeft: 0,
        },
        contentShift: {
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
            marginLeft: +drawerWidth,
        },
        container: {
            paddingTop: theme.spacing(2),
            paddingBottom: theme.spacing(4),
            height: `calc(100% - 64px)`,
            display: "flex",
            "justify-content": "center",
            "align-items": "center"
        },
        paper: {
            padding: theme.spacing(2),
            display: "flex",
            overflow: "auto",
            flexDirection: "column"
        },
        fixedHeight: {
            height: 400
        }
    }));
    const classes = useStyles();
    const open = useAppSelector(state => state.generalState.drawerOpen);

    useEffect(() => {
        const currentUrl = window.location.href;
        const params = new URL(currentUrl).searchParams;
        const code = params.get('code');
        const state = params.get('state');
        const client_request_id = params.get('client-request-id');
        const response = {
            code: code,
            state: state,
            'client-request-id': client_request_id
        }
        if (code === null) {
            history.push('/')
        }
        else {
            if (window.opener !== null) {
                window.opener.postMessage(response, awsConfig.app_origin)
                window.close()
            }
            else {
                history.push('/')
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <main
            className={clsx(classes.content, {
                [classes.contentShift]: open,
            })}
        >
            <Container maxWidth={false} className={classes.container}>
                <code>Processing...</code>
            </Container>
        </main>
    )
}
