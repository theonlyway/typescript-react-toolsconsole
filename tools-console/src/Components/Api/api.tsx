import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"
import { RouteComponentProps } from 'react-router-dom';
import { DefaultStyles } from '../../styles/common'
import { useAppSelector } from '../../redux/hooks'

interface IProps extends RouteComponentProps {
    pageTitle: string
}

export default function Api(props: IProps) {
    const [pageTitle] = useState(props.pageTitle)
    const defaultClasses = DefaultStyles()
    const open = useAppSelector(state => state.generalState.drawerOpen);

    useEffect(() => {
        document.title = pageTitle
    }, [props, pageTitle]);

    return (
        <main
            className={clsx(defaultClasses.content, {
                [defaultClasses.contentShift]: open,
            })}
        >
            <SwaggerUI url={process.env.PUBLIC_URL + "/swagger.yaml"} />
        </main>
    )
}
