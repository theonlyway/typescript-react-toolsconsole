export interface IAwsConfig {
    app_origin: string,
    app_id: string,
    recaptcha_v2_site_key: string,
    aws_project_region: string,
    aws_cognito_region: string,
    aws_user_pools_id: string,
    aws_user_pools_web_client_id: string,
    aws_cognito_identity_pool_id: string,
    aws_mandatory_sign_in: string,
    unauth_api_key: string,
    vault_oidc: {
        oidc_base_url: string,
        client_id: string,
        redirect_uri: string,
        resource: string
    }
    oauth: {
        domain: string,
        name: string,
        scope: Array<"phone" | "email" | "openid" | "profile" | "aws.cognito.signin.user.admin">,
        redirectSignIn: string,
        redirectSignOut: string,
        responseType: string
    },
    aws_cloud_logic_custom: [
        {
            name: string,
            endpoint: string,
            region: string
        }
    ],
    aws_bots?: string,
    aws_bots_config?: [
        {
            name: string,
            alias: string,
            region: string
        }
    ]
}
