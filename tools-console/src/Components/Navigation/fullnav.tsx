import React, { useState } from 'react';
import SideNavBar from './sidenavbar'
import TopNavBar from './topnavbar'
import menuItems from './menuitems'

export default function FullNav() {

    const [sidbarMenuItems] = useState(menuItems)

    return (
        <React.Fragment>
            <TopNavBar />
            <SideNavBar menuItems={sidbarMenuItems} />
        </React.Fragment>
    )
}
