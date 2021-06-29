import React, { useEffect } from 'react';
import './App.css';
import FullNav from './Components/Navigation/fullnav'
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Typography, Container } from "@material-ui/core";
import { createMuiTheme, ThemeProvider, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import {
  orange,
  lightBlue,
  deepPurple,
  deepOrange
} from "@material-ui/core/colors";
import CssBaseline from '@material-ui/core/CssBaseline';
import { Hub, Auth } from "aws-amplify";
import Home from './Components/Home/home'
import menuItems, { ISubMenuItem } from './Components/Navigation/menuitems'
import WithSuspense from './Components/Hocs/withsuspense'
import RequireAuth from './Components/Hocs/authguard'
import allActions from './redux/actions/allactions'
import { useAppSelector, useAppDispatch } from './redux/hooks'
import { RouteComponentProps } from 'react-router-dom';

interface IState {
  from: string;
}
interface IUnAuth extends RouteComponentProps<{}, {}, IState> {

}

export default function App() {
  const dispatch = useAppDispatch()
  const darkState = useAppSelector(state => state.generalState.darkState);
  const palletType = darkState ? "dark" : "light";
  const mainPrimaryColor = darkState ? orange[500] : lightBlue[800];
  const mainSecondaryColor = darkState ? deepOrange[900] : deepPurple[500];
  const drawerWidth = useAppSelector(state => state.generalState.drawerWidth);
  const open = useAppSelector(state => state.generalState.drawerOpen);
  const theme = createMuiTheme({
    palette: {
      type: palletType,
      primary: {
        main: mainPrimaryColor
      },
      secondary: {
        main: mainSecondaryColor
      }
    }
  });

  const useStyles = makeStyles((theme) => ({
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
      "align-items": "center"
    },
    paper: {
      padding: theme.spacing(2),
      display: "flex",
      overflow: "auto",
      flexDirection: "column"
    },
    fixedHeight: {
      height: 400
    },
    spinner: {
      display: 'flex',
      '& > * + *': {
        marginLeft: theme.spacing(2),
      },
    },
  }));
  const classes = useStyles();

  // Hub examples https://www.sufle.io/blog/aws-amplify-authentication-part-2
  useEffect(() => {
    Hub.listen("auth", ({ payload: { event, data } }) => {
      switch (event) {
        case "signIn":
          getUser().then((userData) => {
            if (userData !== null && userData !== undefined) {
              dispatch(allActions.userActions.setUserProps(userData))
              dispatch(allActions.userActions.setUserGroups(userData.signInUserSession.accessToken.payload["cognito:groups"]))
            } else {
              dispatch(allActions.userActions.resetUserProps())
            }
          });
          break;
        case "tokenRefresh":
          getUser().then((userData) => {
            if (userData !== null && userData !== undefined) {
              dispatch(allActions.userActions.setUserProps(userData))
              dispatch(allActions.userActions.setUserGroups(userData.signInUserSession.accessToken.payload["cognito:groups"]))
            } else {
              dispatch(allActions.userActions.resetUserProps())
            }
          });
          break;
        case "signOut":
          dispatch(allActions.userActions.resetUserProps())
          break;
        case "signIn_failure":
          //console.log("Sign in failure", data);
          dispatch(allActions.userActions.resetUserProps())
          break;
        default:
          dispatch(allActions.userActions.resetUserProps())
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getUser() {
    return Auth.currentAuthenticatedUser()
      .then((userData) => userData)
      .catch(() => {
        dispatch(allActions.userActions.resetUserProps())
        //console.log("Not signed in");
      });
  }

  useEffect(() => {
    getUser().then((userData) => {
      if (userData !== null && userData !== undefined) {
        dispatch(allActions.userActions.setUserProps(userData))
        dispatch(allActions.userActions.setUserGroups(userData.signInUserSession.accessToken.payload["cognito:groups"]))
      } else {
        dispatch(allActions.userActions.resetUserProps())
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const noMatch = (location: RouteComponentProps) => {
    return (
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}
      >
        <Container className={classes.container}>
          <Typography>
            Page not found: <code>{location.location.pathname}</code>
          </Typography>
        </Container>
      </main>
    );
  }

  const unauthorized = (location: IUnAuth) => {
    return (
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}
      >
        <Container className={classes.container}>
          <Typography>
            You are not authorized to access: <code>{location.location.state.from}</code>
          </Typography>
        </Container>
      </main>
    );
  }

  const Profile = React.lazy(() => import('./Components/Profile/profile'));
  const ProfileWithSuspense = WithSuspense(Profile, classes)

  const Api = React.lazy(() => import('./Components/Api/api'));
  const ApiWithWithAuthGuard = RequireAuth(Api, classes, menuItems['API'])

  const Login = React.lazy(() => import('./Components/Login/login'));
  const LoginWithSuspense = WithSuspense(Login, classes)

  const VaultUnwrap = React.lazy(() => import('./Components/Vault/unwrap'));
  const VaultUnwrapWithSuspense = WithSuspense(VaultUnwrap, classes)

  const VaultSms = React.lazy(() => import('./Components/Vault/sendsms'));
  const VaultSendSmsWithAuthGuard = RequireAuth(VaultSms, classes, menuItems.Secrets.SubMenuItems.find(x => x.Path === "/vault/sms") as ISubMenuItem)

  /*
  const Dashboard = React.lazy(() => import('./Components/Dashboard/dashboard'));
  const DashboardWithAuthGuard = RequireAuth(Dashboard, classes, menuItems.Dashboard)
  */
  const ForgotPassword = React.lazy(() => import('./Components/Login/forgotpassword'));
  const ForgotPasswordWithSuspense = WithSuspense(ForgotPassword, classes)

  const ResetPassword = React.lazy(() => import('./Components/Login/forgotpasswordsubmit'));
  const ResetPasswordWithSuspense = WithSuspense(ResetPassword, classes)

  const ChangePassword = React.lazy(() => import('./Components/Login/changepassword'));
  const ChangePasswordWithSuspense = WithSuspense(ChangePassword, classes)
  /*
  const BookTripBot = React.lazy(() => import('./Components/Bots/booktrip'));
  const BookTripBotWithAuthGuard = RequireAuth(BookTripBot, classes, menuItems['Chat bot'])
  */
  const VaultOidcCallback = React.lazy(() => import('./Components/Vault/callback'));
  const VaultOidcCallbackWithSuspense = WithSuspense(VaultOidcCallback, classes)

  const VaultWrap = React.lazy(() => import('./Components/Vault/wrap'));
  const VaultWraptWithAuthGuard = RequireAuth(VaultWrap, classes, menuItems.Secrets.SubMenuItems.find(x => x.Path === "/vault/wrap") as ISubMenuItem)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <React.Fragment>
          <FullNav />
          <Switch>
            <Route path="/" exact render={(props) => <Home {...props} pageTitle="Home" />} />
            <Route path="/login" exact render={(props) => <LoginWithSuspense {...props} pageTitle="Login" />} />
            <Route path="/login/forgotpassword" exact render={(props) => <ForgotPasswordWithSuspense {...props} pageTitle="Forgot password" />} />
            <Route path="/login/resetpassword" exact render={(props) => <ResetPasswordWithSuspense {...props} pageTitle="Reset password" />} />
            <Route path="/login/changepassword" exact render={(props) => <ChangePasswordWithSuspense {...props} pageTitle="Change password" />} />
            <Route path="/profile" exact render={(props) => <ProfileWithSuspense {...props} pageTitle="Profile" />} />
            <Route path="/api" exact render={(props) => <ApiWithWithAuthGuard {...props} pageTitle="API" />} />
            <Route path="/vault/unwrap" exact render={(props) => <VaultUnwrapWithSuspense {...props} pageTitle="Vault - Unwrap" />} />
            <Route path="/vault/unwrap/:token" exact render={(props) => <VaultUnwrapWithSuspense {...props} pageTitle="Vault - Unwrap" />} />
            <Route path="/vault/oidc/callback" exact render={(props) => <VaultOidcCallbackWithSuspense {...props} pageTitle="Vault - Callback" />} />
            <Route path="/vault/sms" exact render={(props) => <VaultSendSmsWithAuthGuard {...props} pageTitle="Vault - SMS" />} />
            <Route path="/vault/wrap" exact render={(props) => <VaultWraptWithAuthGuard {...props} pageTitle="Vault - Wrap" />} />
            <Route path="/unauthorized" component={unauthorized} />
            <Route component={noMatch} />
          </Switch>
        </React.Fragment>
      </Router>
    </ThemeProvider >
  )
}
