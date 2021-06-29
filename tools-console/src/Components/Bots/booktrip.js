import React, { useState, useEffect } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { useSelector } from 'react-redux'
import {
    Container
} from "@material-ui/core";
import { ChatBot } from 'aws-amplify-react';




export default function BookTrip(props) {
    const theme = useTheme();
    const drawerWidth = useSelector(state => state.generalState.drawerWidth);
    // eslint-disable-next-line no-unused-vars
    const [pageTitle, setPageTitle] = useState(props.pageTitle)

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
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(4)
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
    const open = useSelector(state => state.generalState.drawerOpen);

    useEffect(() => {
        document.title = pageTitle
    }, [props, pageTitle]);

    return (
        <main
            className={clsx(classes.content, {
                [classes.contentShift]: open,
            })}
        >
            <ChatBot
                title="My Bot"
                botName="BookTrip_dev"
                welcomeMessage="Welcome, how can I help you today?"
                clearOnComplete={true}
                conversationModeOn={false}
                className={classes.container}
            />
        </main>
    )
}
