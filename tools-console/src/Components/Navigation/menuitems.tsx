import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import HomeOutlinedIcon from '@material-ui/icons/HomeOutlined';
import LockOpenOutlinedIcon from '@material-ui/icons/LockOpenOutlined';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import SmsOutlinedIcon from '@material-ui/icons/SmsOutlined';
import GroupAddOutlinedIcon from '@material-ui/icons/GroupAddOutlined';
import PersonOutlinedIcon from '@material-ui/icons/PersonOutlined';
import DashboardOutlinedIcon from '@material-ui/icons/DashboardOutlined';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import GroupOutlinedIcon from '@material-ui/icons/GroupOutlined';
import AssessmentOutlinedIcon from '@material-ui/icons/AssessmentOutlined';
import HealingOutlinedIcon from '@material-ui/icons/HealingOutlined';
import ChatOutlinedIcon from '@material-ui/icons/ChatOutlined';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';

export interface IMenuItem {
    Id: string,
    AuthRequired: boolean,
    Icon: JSX.Element,
    Path?: string,
    Groups: Array<string>,
    SubMenuItems: Array<ISubMenuItem>
}

export interface ISubMenuItem {
    Name: string,
    Id: string,
    AuthRequired: boolean,
    Icon: JSX.Element,
    Path: string,
    Groups: Array<string>,
    Description?: string
}

export interface IMenuItems {
    [key: string]: IMenuItem
}

const menuItems: IMenuItems = {
    "Home": {
        "Id": uuidv4(),
        "AuthRequired": false,
        "Icon": <HomeOutlinedIcon />,
        "SubMenuItems": [],
        "Path": "/",
        "Groups": []
    },
    /*
    "Dashboard": {
        "Id": uuidv4(),
        "AuthRequired": true,
        "Icon": <DashboardOutlinedIcon />,
        "SubMenuItems": [],
        "Path": "/dashboard",
        "Groups": ["Administrators"]
    },
    */
    "Secrets": {
        "Id": uuidv4(),
        "AuthRequired": false,
        "Icon": <LockOutlinedIcon />,
        "Groups": [],
        "SubMenuItems": [
            {
                "Name": "Send SMS",
                "Icon": <SmsOutlinedIcon />,
                "AuthRequired": true,
                "Id": uuidv4(),
                "Path": "/vault/sms",
                "Groups": ["Administrators", "Allow_SMS", "Staff"],
                "Description": "Click here to SMS a secure one time use token to a mobile number"
            },
            {
                "Name": "Unwrap token",
                "Icon": <LockOpenOutlinedIcon />,
                "AuthRequired": false,
                "Id": uuidv4(),
                "Path": "/vault/unwrap",
                "Groups": [],
                "Description": "Click here to unwrap a secure one time use token"
            },
            {
                "Name": "Wrap secret",
                "Icon": <LockOutlinedIcon />,
                "AuthRequired": true,
                "Id": uuidv4(),
                "Path": "/vault/wrap",
                "Groups": ["Administrators", "Allow_Wrap", "Staff"],
                "Description": "Click here to wrap sensitive information in a secure one time use token"
            },
            /*
            {
                "Name": "Login test",
                "Icon": <SmsOutlinedIcon />,
                "AuthRequired": true,
                "Id": uuidv4(),
                "Path": "/vault/logintest",
                "Groups": ["Administrators"]
            }
            */
        ]
    },
    /*
    "Chat bot": {
        "Id": uuidv4(),
        "AuthRequired": true,
        "Icon": <ChatOutlinedIcon />,
        "Groups": ['Administrators'],
        "Path": "/bot/booktrip",
        "SubMenuItems": []
    },
    "Reports": {
        "Id": uuidv4(),
        "AuthRequired": true,
        "Icon": <AssessmentOutlinedIcon />,
        "Groups": ["Administrators"],
        "SubMenuItems": [
            {
                "Name": "Patching",
                "Icon": <HealingOutlinedIcon />,
                "AuthRequired": true,
                "Id": uuidv4(),
                "Path": "/reports/patching",
                "Groups": ["Administrators"]
            },
        ]
    },
    /*
    "Admin": {
        "Id": uuidv4(),
        "AuthRequired": true,
        "Icon": <GroupOutlinedIcon />,
        "Groups": ["Administrators"],
        "SubMenuItems": [
            {
                "Name": "Create Users",
                "Icon": <GroupAddOutlinedIcon />,
                "AuthRequired": true,
                "Id": uuidv4(),
                "Path": "/admin/users/create",
                "Groups": ["Administrators"]
            },
            {
                "Name": "Manage Users",
                "Icon": <PersonOutlinedIcon />,
                "AuthRequired": true,
                "Id": uuidv4(),
                "Path": "/admin/users/manage",
                "Groups": ["Administrators"]
            }
        ]
    },
    */
    "API": {
        "Id": uuidv4(),
        "AuthRequired": true,
        "Icon": <DescriptionOutlinedIcon />,
        "SubMenuItems": [],
        "Path": "/api",
        "Groups": ["Administrators"]
    },
    "Profile": {
        "Id": uuidv4(),
        "AuthRequired": true,
        "Icon": <AccountCircleOutlinedIcon />,
        "SubMenuItems": [],
        "Path": "/profile",
        "Groups": []
    },
}
export default menuItems
