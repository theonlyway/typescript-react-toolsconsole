import React from 'react';
import clsx from 'clsx';
import { connect, ConnectedProps } from 'react-redux'
import { Redirect } from "react-router-dom";
import { CircularProgress } from "@material-ui/core";
import { RouteComponentProps } from 'react-router-dom';
import { IInitialState as UserState } from '../../redux/reducers/user'
import { IMenuItem, ISubMenuItem } from '../Navigation/menuitems'

export default function RequireAuth(WrappedComponent: React.ComponentType<any>, classes: any, menuItem: ISubMenuItem | IMenuItem) {

    function Authentication(props: Props) {
        if (!props.authenticated) {
            return <Redirect push to={{
                pathname: "/unauthorized",
                state: { from: props.match.path }
            }} />
        }
        return (
            <React.Suspense fallback={<div className={clsx(classes.spinner, classes.container)}><CircularProgress /></div>}>
                <WrappedComponent {...props} />
            </React.Suspense>
        )
    }

    function mapStateToProps(state: { userState: UserState }) {
        if (state.userState.user !== null) {
            // eslint-disable-next-line no-undef
            var intersection = require('lodash/intersection')
            let comparison = intersection(state.userState.userGroups, menuItem.Groups)
            if (comparison.length > 0) {
                return { authenticated: true }
            }
        }
        return { authenticated: false }
    }

    const connector = connect(mapStateToProps);
    type PropsFromRedux = ConnectedProps<typeof connector>
    type Props = PropsFromRedux & RouteComponentProps & {
        pageTitle: string
    }
    return connector(Authentication)
}
