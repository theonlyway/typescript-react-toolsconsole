import React, { useState, useEffect } from 'react';
import PropTypes from "prop-types";
import Alert, { Color } from '@material-ui/lab/Alert';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Snackbar } from "@material-ui/core";

interface ISnackBar {
    openSnackBar: boolean,
    snackBarSeverity: Color,
    snackBarMessage: string,
    autoHideDuration: number,
    elevation: number,
    parentState?: React.Dispatch<React.SetStateAction<boolean>>
}

export default function SnackBar(props: ISnackBar) {

    const [openSnackBar, setOpenSnackBar] = useState(props.openSnackBar);
    const useStyles = makeStyles((theme) => ({
        snackBar: {
            width: '100%',
            '& > * + *': {
                marginTop: theme.spacing(2),
            },
        },
    }));
    const classes = useStyles();
    // eslint-disable-next-line no-unused-vars
    const theme = useTheme();

    const handleCloseSnackBar = (event: React.SyntheticEvent<Element, Event>) => {
        setOpenSnackBar(false);
        if (props.parentState !== undefined) {
            props.parentState(false)
        }
    };

    useEffect(() => {
        setOpenSnackBar(props.openSnackBar)
    }, [props.openSnackBar]);

    return (
        <Snackbar open={openSnackBar} autoHideDuration={props.autoHideDuration} onClose={handleCloseSnackBar} className={classes.snackBar}>
            <Alert elevation={6} variant="filled" severity={props.snackBarSeverity} onClose={handleCloseSnackBar}>
                {props.snackBarMessage}
            </Alert>
        </Snackbar>
    )
}

SnackBar.propTypes = {
    openSnackBar: PropTypes.bool.isRequired,
    snackBarSeverity: PropTypes.string,
    snackBarMessage: PropTypes.string.isRequired,
    autoHideDuration: PropTypes.number,
    elevation: PropTypes.number,
    parentState: PropTypes.func.isRequired
}

SnackBar.defaultProps = {
    autoHideDuration: 10000,
    elevation: 6
}
