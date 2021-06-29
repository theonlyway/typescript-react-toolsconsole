import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Auth, Hub } from 'aws-amplify';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Link from '@material-ui/core/Link';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Icon from '@material-ui/core/Icon';
import allActions from '../../redux/actions/allactions'
import { useAppSelector, useAppDispatch } from '../../redux/hooks'
import { IMenuItem, ISubMenuItem, IMenuItems } from './menuitems'

interface ICheckIfExpandable {
    heading: String,
    item: IMenuItem
}

interface IProps {
    menuItems: any
}

export default function SideNavBar(props: IProps) {

    const drawerWidth = useAppSelector(state => state.generalState.drawerWidth);

    const useStyles = makeStyles((theme) => ({
        drawer: {
            width: drawerWidth,
            flexShrink: 0,
        },
        drawerPaper: {
            width: drawerWidth,
            boxSizing: 'border-box',
        },
        drawerHeader: {
            display: 'flex',
            alignItems: 'center',
            padding: theme.spacing(0, 1),
            // necessary for content to be below app bar
            ...theme.mixins.toolbar,
            justifyContent: 'flex-end',
        },
        nested: {
            paddingLeft: theme.spacing(4),
        },
        bottomPush: {
            position: "fixed",
            bottom: 0,
            textAlign: "left",
            paddingBottom: theme.spacing(2),
            paddingLeft: theme.spacing(2)
        }
    }));

    const classes = useStyles();
    const theme = useTheme();
    const open: boolean = useAppSelector(state => state.generalState.drawerOpen);
    const dispatch = useAppDispatch()
    // eslint-disable-next-line no-unused-vars
    const [sidbarMenuItems, setSidbarMenuItems] = useState<IMenuItems>(props.menuItems)
    const [actualSidbarMenuItems, setActualSidbarMenuItems] = useState<null | IMenuItems>(null)
    const [expandedPanel, setExpandedPanel] = useState<string | null>();
    const [user, setUser] = useState(null);
    const [userGroups, setUserGroups] = useState([]);

    function CheckIfExpandable(props: ICheckIfExpandable): JSX.Element | null {
        if (props.item.SubMenuItems.length > 0) {
            if (props.item.Path == null) {
                return (
                    <React.Fragment key={props.item.Id}>
                        <ListItem button key={props.item.Id} onClick={handlePanelChange(props.item.Id)}>
                            <ListItemIcon>
                                <Icon>{props.item.Icon}</Icon>
                            </ListItemIcon>
                            <ListItemText primary={props.heading} />
                            {expandedPanel === props.item.Id ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                    </React.Fragment>
                )
            }
            else {
                return (
                    <React.Fragment key={props.item.Id}>
                        <ListItem button key={props.item.Id} to={props.item.Path} component={RouterLink} onClick={handlePanelChange(props.item.Id)}>
                            <ListItemIcon>
                                <Icon>{props.item.Icon}</Icon>
                            </ListItemIcon>
                            <ListItemText primary={props.heading} />
                            {expandedPanel === props.item.Id ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                    </React.Fragment>
                )
            }
        }
        else if (props.item.SubMenuItems.length === 0) {
            if (props.item.Path == null) {
                return (
                    <React.Fragment key={props.item.Id}>
                        <ListItem button key={props.item.Id}>
                            <ListItemIcon>
                                <Icon>{props.item.Icon}</Icon>
                            </ListItemIcon>
                            <ListItemText primary={props.heading} />
                        </ListItem>
                    </React.Fragment>
                )
            }
            else {
                return (
                    <React.Fragment key={props.item.Id}>
                        <ListItem button key={props.item.Id} to={props.item.Path} component={RouterLink}>
                            <ListItemIcon>
                                <Icon>{props.item.Icon}</Icon>
                            </ListItemIcon>
                            <ListItemText primary={props.heading} />
                        </ListItem>
                    </React.Fragment>
                )
            }
        }
        return null;
    }

    useEffect(() => {
        filterMenuItems()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, userGroups]);

    useEffect(() => {
        getUser().then((userData) => {
            if (userData !== null && userData !== undefined) {
                setUser(userData);
                setUserGroups(userData.signInUserSession.accessToken.payload["cognito:groups"]);
            } else {
                setUser(null)
                setUserGroups([]);
            }
        });
        filterMenuItems()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDrawer = () => {
        dispatch(allActions.generalActions.setDrawerOpen(!open))
    };

    const handlePanelChange = (panel: string) => () => {
        if (panel === expandedPanel) {
            setExpandedPanel(null);
        }
        else {
            setExpandedPanel(panel);
        }
    };

    function filterMenuItems() {
        // eslint-disable-next-line no-undef
        var cloneDeep = require('lodash/cloneDeep')
        // eslint-disable-next-line no-undef
        var intersection = require('lodash/intersection')
        let subMenuItemsToRemove: { heading: string; index: number; }[] = []
        let headingsToRemove: { heading: string; index: number; }[] = []
        let newMenu = cloneDeep(sidbarMenuItems)

        Object.keys(newMenu).forEach((heading, index) => {
            if (user === null) {
                if (newMenu[heading].AuthRequired && newMenu[heading].Groups.length > 0) {
                    let comparison = intersection(userGroups, newMenu[heading].Groups)
                    if (comparison.length === 0) {
                        headingsToRemove.push({
                            "heading": heading,
                            "index": index
                        })
                    }
                }
                else if (newMenu[heading].AuthRequired && newMenu[heading].Groups.length === 0) {
                    headingsToRemove.push({
                        "heading": heading,
                        "index": index
                    })
                }

                newMenu[heading].SubMenuItems.forEach((item: ISubMenuItem, index: number) => {
                    if (item.AuthRequired && item.Groups.length > 0) {
                        let comparison = intersection(userGroups, item.Groups)
                        if (comparison.length === 0) {
                            subMenuItemsToRemove.push({
                                "heading": heading,
                                "index": index
                            })
                        }
                    }
                })
            }
            if (user !== null) {
                if (newMenu[heading].AuthRequired && newMenu[heading].Groups.length > 0) {
                    let comparison = intersection(userGroups, newMenu[heading].Groups)
                    if (comparison.length === 0) {
                        headingsToRemove.push({
                            "heading": heading,
                            "index": index
                        })
                    }
                }
                newMenu[heading].SubMenuItems.forEach((item: ISubMenuItem, index: number) => {
                    if (item.AuthRequired && item.Groups.length > 0) {
                        let comparison = intersection(userGroups, item.Groups)
                        if (comparison.length === 0) {
                            subMenuItemsToRemove.push({
                                "heading": heading,
                                "index": index
                            })
                        }
                    }
                })
            }
        });

        subMenuItemsToRemove.reverse().forEach((item) => {
            newMenu[item.heading].SubMenuItems.splice(item.index, 1)
        })

        headingsToRemove.forEach((item) => {
            delete newMenu[item.heading]
        })
        setActualSidbarMenuItems(newMenu)
    }

    useEffect(() => {
        Hub.listen("auth", ({ payload: { event, data } }) => {
            switch (event) {
                case "signIn":
                    getUser().then((userData) => {
                        if (userData !== null && userData !== undefined) {
                            setUser(userData);
                            setUserGroups(userData.signInUserSession.accessToken.payload["cognito:groups"]);
                        } else {
                            setUser(null)
                            setUserGroups([]);
                        }
                    });
                    filterMenuItems()
                    break;
                case "tokenRefresh":
                    getUser().then((userData) => {
                        if (userData !== null && userData !== undefined) {
                            setUser(userData);
                            setUserGroups(userData.signInUserSession.accessToken.payload["cognito:groups"]);
                        } else {
                            setUser(null)
                            setUserGroups([]);
                        }
                    });
                    filterMenuItems()
                    break;
                case "signOut":
                    setUser(null);
                    setUserGroups([]);
                    filterMenuItems()
                    break;
                case "signIn_failure":
                    //console.log("Sign in failure", data);
                    setUser(null);
                    setUserGroups([]);
                    filterMenuItems()
                    break;
                default:
                    setUser(null);
                    setUserGroups([]);
                    filterMenuItems()
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function getUser() {
        return Auth.currentAuthenticatedUser()
            .then((userData) => userData)
            .catch(() => {
                setUser(null);
            });
    }

    return (
        <React.Fragment>
            <Drawer
                className={classes.drawer}
                variant="persistent"
                anchor="left"
                open={open}
                classes={{
                    paper: classes.drawerPaper,
                }}
            >
                <div className={classes.drawerHeader}>
                    <IconButton aria-label="close drawer" onClick={handleDrawer}>
                        {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </IconButton>
                </div>
                <React.Fragment>
                    {actualSidbarMenuItems !== null && actualSidbarMenuItems !== undefined ?
                        <React.Fragment>
                            {Object.keys(actualSidbarMenuItems).map((heading) => (
                                <React.Fragment key={actualSidbarMenuItems[heading].Id}>
                                    <Divider />
                                    <List key={actualSidbarMenuItems[heading].Id}>
                                        <CheckIfExpandable heading={heading} item={actualSidbarMenuItems[heading]} />
                                        {actualSidbarMenuItems[heading].SubMenuItems.length > 0 ? actualSidbarMenuItems[heading].SubMenuItems.map((menuItem) => (
                                            <React.Fragment key={menuItem.Id}>
                                                <Collapse in={expandedPanel === actualSidbarMenuItems[heading].Id} timeout="auto" unmountOnExit>
                                                    <ListItem button className={classes.nested} key={menuItem.Id} to={menuItem.Path} component={RouterLink}>
                                                        <ListItemIcon>
                                                            <Icon>{menuItem.Icon}</Icon>
                                                        </ListItemIcon>
                                                        <ListItemText primary={menuItem.Name} />
                                                    </ListItem>
                                                </Collapse>
                                            </React.Fragment>
                                        )) : null}
                                    </List>
                                </React.Fragment>
                            ))
                            }
                        </React.Fragment>
                        : null}
                    <div className={classes.bottomPush}>
                        <Typography variant="caption">Copyright (C) {new Date().getFullYear()}</Typography>
                        {"\n"}
                        <Link
                            href="https://bitbucket.org/Theonlywaye/react-tools-console/src/master/"
                        >
                            Theonlyway
                        </Link>
                    </div>
                </React.Fragment>
            </Drawer>
        </React.Fragment >
    );
}
