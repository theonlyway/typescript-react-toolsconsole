import React, { useState, useEffect } from 'react';
import { useTheme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { useAppSelector } from '../../redux/hooks'
import VaultOidc from "./oidc";
import { DefaultStyles } from '../../styles/common'

interface IProps {
    pageTitle: string
}

export default function Home(props: IProps) {
    const awsConfig = useAppSelector(state => state.generalState.awsConfig)
    // eslint-disable-next-line no-unused-vars
    const theme = useTheme();
    // eslint-disable-next-line no-unused-vars
    const [pageTitle, setPageTitle] = useState(props.pageTitle)
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
            <VaultOidc
                oidcBaseUrl={awsConfig.vault_oidc.oidc_base_url}
                windowName="VaultOIDC"
                centerScreen={true}
                buttonName="Vault Login"
                debug={true}
            />
        </main>
    )
}
