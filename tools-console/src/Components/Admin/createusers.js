import React, { useState, useEffect } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { CircularProgress, Step, Stepper, StepLabel, StepContent, Button, Paper, Typography } from "@material-ui/core";
import { useSelector } from 'react-redux'


export default function Users(props) {

    const useStyles = makeStyles((theme) => ({
        root: {
            width: '100%'
        },
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
            "align-items": "center",
            margin: "2px"
        },
        loginBtn: {
            marginTop: theme.spacing(2),
            flexGrow: 1
        },
        header: {
            textAlign: 'center',
            background: theme.palette.primary.main,
            color: theme.palette.type === "light" ? "#FFFFFF" : "#000000"
        },
        paper: {
        },
        snackBar: {
            width: '100%',
            '& > * + *': {
                marginTop: theme.spacing(2),
            },
        },
        loading: {
            display: "flex",
            "justify-content": "center",
            "align-items": "center",
            margin: "auto"
        }
    }));

    const [openSnackBar, setOpenSnackBar] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const drawerWidth = useSelector(state => state.generalState.drawerWidth);
    const [pageTitle, setPageTitle] = useState(props.pageTitle)
    const [isLoading, setIsLoading] = useState(false)
    const classes = useStyles();
    const theme = useTheme();
    const open = useSelector(state => state.generalState.drawerOpen);
    const [activeStep, setActiveStep] = React.useState(0);
    const steps = getSteps();
    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    useEffect(() => {
        document.title = pageTitle
    }, [props, pageTitle]);

    function getSteps() {
        return ['Create or update user', 'Create an ad group', 'Create an ad'];
    }

    function getStepContent(step) {
        switch (step) {
            case 0:
                return `For each ad campaign that you create, you can control how much
              you're willing to spend on clicks and conversions, which networks
              and geographical locations you want your ads to show on, and more.`;
            case 1:
                return 'An ad group contains one or more ads which target a shared set of keywords.';
            case 2:
                return `Try out different ad text to see what brings in the most customers,
              and learn how to enhance your ads using features like ad extensions.
              If you run into any problems with your ads, find out how to tell if
              they're running and how to resolve approval issues.`;
            default:
                return 'Unknown step';
        }
    }

    return (
        <main
            className={clsx(classes.content, {
                [classes.contentShift]: open,
            })}
        >
            {isLoading ? <CircularProgress className={classes.loading} /> :
                <div className={classes.root}>
                    <Stepper activeStep={activeStep} orientation="vertical">
                        {steps.map((label, index) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                                <StepContent>
                                    <Typography>{getStepContent(index)}</Typography>
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
                                            >
                                                {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                                            </Button>
                                        </div>
                                    </div>
                                </StepContent>
                            </Step>
                        ))}
                    </Stepper>
                    {activeStep === steps.length && (
                        <Paper square elevation={0} className={classes.resetContainer}>
                            <Typography>All steps completed - you&apos;re finished</Typography>
                            <Button onClick={handleReset} className={classes.button}>
                                Reset
                            </Button>
                        </Paper>
                    )}
                </div>
            }

        </main>
    )
}
