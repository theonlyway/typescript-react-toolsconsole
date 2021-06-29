import React from 'react';
import clsx from 'clsx';
import { CircularProgress } from "@material-ui/core";

export default function WithSuspense<T>(WrappedComponent: React.ComponentType<T>, classes: any) {

    function withSuspense(props: T) {
        return (
            <React.Suspense fallback={<div className={clsx(classes.spinner, classes.container)}><CircularProgress /></div>}>
                <WrappedComponent {...props} />
            </React.Suspense>
        );
    }
    return withSuspense
}
