import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import { Auth } from 'aws-amplify';
import { useAppSelector, useAppDispatch } from '../../redux/hooks'
import allActions from '../../redux/actions/allactions'
import {
    Switch,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Button,
    Tooltip,
    Menu,
    MenuItem
} from "@material-ui/core";
import { Link as RouterLink, useHistory } from 'react-router-dom';
import WbSunnyIcon from '@material-ui/icons/WbSunny';
import Brightness2Icon from '@material-ui/icons/Brightness2';
import AccountCircle from '@material-ui/icons/AccountCircle';

export default function TopNavBar() {

    const drawerWidth = useAppSelector(state => state.generalState.drawerWidth);
    const [anchorEl, setAnchorEl] = useState<null | HTMLButtonElement>(null);
    const isMenuOpen = Boolean(anchorEl);
    const history = useHistory();
    // eslint-disable-next-line no-unused-vars
    const theme = useTheme();


    const useStyles = makeStyles((theme) => ({
        root: {
            display: 'flex',
            margin: 15
        },
        appBar: {
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
        },
        appBarShift: {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: drawerWidth,
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
        menuButton: {
            marginRight: theme.spacing(2),
        },
        hideMenuButton: {
            display: 'none',
        },
        title: {
            flexGrow: 1
        },
        appBarButtons: {
            marginLeft: '5px'
        }
    }));

    const classes = useStyles();
    const open = useAppSelector(state => state.generalState.drawerOpen);
    const dispatch = useAppDispatch()
    const darkState = useAppSelector(state => state.generalState.darkState);
    const userData = useAppSelector(state => state.userState);
    const [adfsUser, setAdfsUser] = useState(false)

    const handleDrawer = () => {
        dispatch(allActions.generalActions.setDrawerOpen(!open))
    };

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleProfileClick = () => {
        setAnchorEl(null);
        history.push('/profile')
    };

    const handleChangePasswordClick = () => {
        setAnchorEl(null);
        history.push('/login/changepassword')
    };

    const handleLogoutClick = () => {
        setAnchorEl(null);
        signOut()
    };

    useEffect(() => {
        if (userData.user !== null && 'identities' in userData.user.attributes) {
            let identity = JSON.parse(userData.user.attributes.identities)[0]
            if (identity.providerType === "SAML") {
                setAdfsUser(true)
            }
        }
    }, [userData]);

    const menuId = 'primary-search-account-menu';
    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            getContentAnchorEl={null}
            id={menuId}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
            {!adfsUser ? <MenuItem onClick={handleChangePasswordClick}>Change password</MenuItem> : null}
            <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
        </Menu>
    );

    const handleThemeChange = () => {
        dispatch(allActions.generalActions.setDarkState(!darkState))
    }

    async function signOut() {
        try {
            await Auth.signOut()
                .catch(await Auth.signOut())
            history.push('/')
        } catch (error) {
            //console.log('error signing out: ', error);
        }
    }

    return (
        <div className={classes.root}>
            <AppBar
                position="fixed"
                className={clsx(classes.appBar, {
                    [classes.appBarShift]: open,
                })}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawer}
                        edge="start"
                        className={clsx(classes.menuButton, open && classes.hideMenuButton)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        component="h1"
                        variant="h6"
                        color="inherit"
                        noWrap
                        className={classes.title}
                    >
                        Tools Console
                    </Typography>
                    <IconButton aria-label="light mode" color="inherit" onClick={handleThemeChange}>
                        <Tooltip title="Light mode">
                            <WbSunnyIcon />
                        </Tooltip>
                    </IconButton>
                    <Switch aria-label="theme switch" checked={darkState} onChange={handleThemeChange} />
                    <IconButton aria-label="dark mode" color="inherit" onClick={handleThemeChange}>
                        <Tooltip title="Dark mode">
                            <Brightness2Icon />
                        </Tooltip>
                    </IconButton>
                    {userData.user !== null ?
                        <IconButton
                            edge="end"
                            aria-label="account of current user"
                            aria-controls={menuId}
                            aria-haspopup="true"
                            onClick={handleProfileMenuOpen}
                            color="inherit"
                        >
                            <AccountCircle />
                        </IconButton>
                        :
                        <Button to="/login" component={RouterLink} variant="contained" color="secondary">Login</Button>
                    }
                </Toolbar>
            </AppBar>
            {renderMenu}
            <Toolbar />
        </div>
    );
}
