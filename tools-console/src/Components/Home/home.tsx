import React, { useState, useEffect } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import clsx from 'clsx';
import {
    Container,
    Grid,
    Card,
    CardContent,
    CardActionArea,
    Typography
} from "@material-ui/core";
import { useAppSelector } from '../../redux/hooks'
import { DefaultStyles } from '../../styles/common'
import menuItems from '../Navigation/menuitems'
import { Link as RouterLink } from 'react-router-dom';

interface IProps {
    pageTitle: string
}

export default function Home(props: IProps) {
    // eslint-disable-next-line no-unused-vars
    const theme = useTheme();
    // eslint-disable-next-line no-unused-vars
    const [pageTitle, setPageTitle] = useState(props.pageTitle)

    const useStyles = makeStyles((theme) => ({
        fixedHeight: {
            height: 400
        }
    }));
    // eslint-disable-next-line no-unused-vars
    const classes = useStyles();
    const defaultClasses = DefaultStyles()
    const open = useAppSelector(state => state.generalState.drawerOpen);
    const [vaultMenuItems, setVaultMenuItems] = useState(menuItems.Secrets.SubMenuItems)
    const user = useAppSelector(state => state.userState.user);
    const userGroups = useAppSelector(state => state.userState.userGroups);

    useEffect(() => {
        document.title = pageTitle
    }, [props, pageTitle]);

    useEffect(() => {
        filterMenuItems()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, userGroups]);

    function filterMenuItems() {
        // eslint-disable-next-line no-undef
        var cloneDeep = require('lodash/cloneDeep')
        var intersection = require('lodash/intersection')
        let newVaultMenuItems = cloneDeep(menuItems.Secrets.SubMenuItems)
        let indexToRemove: number[] = []
        // eslint-disable-next-line array-callback-return
        vaultMenuItems.map((item, index) => {
            if (user === null && item.AuthRequired) {
                indexToRemove.push(index)
            }

            if (user !== null && item.AuthRequired) {
                let comparison = intersection(userGroups, item.Groups)
                if (comparison.length === 0) {
                    indexToRemove.push(index)
                }
            }
        })
        indexToRemove.reverse().forEach((index) => {
            newVaultMenuItems.splice(index, 1)
        })
        setVaultMenuItems(newVaultMenuItems)
    }

    return (
        <main
            className={clsx(defaultClasses.content, {
                [defaultClasses.contentShift]: open,
            })}
        >
            <Container maxWidth={false} className={defaultClasses.container}>

                <Grid container spacing={2} direction="row" justify="center" alignItems="center">
                    <Grid item xs={12} className={defaultClasses.content}>
                        <Typography align="center" variant="h5" component="h5">Secrets</Typography>
                    </Grid>
                    {vaultMenuItems.map((item) => (
                        <Grid item xs={6} sm={3} key={item.Id}>
                            <Card className={defaultClasses.paper}>
                                <CardActionArea component={RouterLink} to={item.Path}>
                                    <CardContent>
                                        <Typography gutterBottom variant="h5" component="h2">
                                            {item.Name}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" component="p">
                                            {item.Description}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea >
                            </Card >
                        </Grid >
                    ))}
                </Grid >
            </Container >
        </main >
    )
}
