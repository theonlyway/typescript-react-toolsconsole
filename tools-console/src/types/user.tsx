import { CognitoUserInterface } from '@aws-amplify/ui-components'
/*
 * Custom attributes type defined according to the attributes used in this app
 */
export type IAuthChallengeName =
    | "NEW_PASSWORD_REQUIRED"
    | "SMS_MFA"
    | "SOFTWARE_TOKEN_MFA"
    | "MFA_SETUP";

/*
 * The following interface extends the CognitoUser type because it has issues
 * (see github.com/aws-amplify/amplify-js/issues/4927). Eventually (when you
 * no longer get an error accessing a CognitoUser's 'attribute' property) you
 * will be able to use the CognitoUser type instead of CognitoUserExt.
 */
export type ICognitoUserExt = CognitoUserInterface & {

}

export interface IJwt {
    access_token: string,
    token_type: string,
    expires_in: number,
    resource: string,
    refresh_token: string,
    refresh_token_expires_in: number,
    scope: string,
    id_token: string
}
