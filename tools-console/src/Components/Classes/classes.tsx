import { ICognitoUserExt } from '../../types/user'

export class SignInState {
    UserObject: ICognitoUserExt | null
    NewPasswordRequired: boolean
    TOTPSetup: boolean
    TOTPChallenge: boolean
    AuthComplete: boolean
    constructor(userobject: ICognitoUserExt | null = null, newpasswordrequired: boolean = false, totpsetup: boolean = false, totpchallenge: boolean = false, authcomplete: boolean = false) {
        this.UserObject = userobject
        this.NewPasswordRequired = newpasswordrequired
        this.TOTPSetup = totpsetup
        this.TOTPChallenge = totpchallenge
        this.AuthComplete = authcomplete
    }
}

export class User {
    FirstName: string | undefined
    LastName: string | undefined
    Username: string | undefined
    Sub: string | undefined
    Email: string | undefined
    EmailVerified: string | undefined
    PhoneNumber: string | undefined
    Groups: Array<string>
    constructor(firstname?: string, lastname?: string, username?: string, sub?: string, email?: string, emailverified?: string, phonenumber?: string, groups: Array<string> = []) {
        this.FirstName = firstname
        this.LastName = lastname
        this.Username = username
        this.Sub = sub
        this.Email = email
        this.EmailVerified = emailverified
        this.PhoneNumber = phonenumber
        this.Groups = groups
    }
}
