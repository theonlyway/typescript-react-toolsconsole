#!/bin/bash
mkdir assets
cat > assets/aws_config.js <<EOF
const awsConfig = {
    app_id: "fbeed365-c540-4461-bfbd-eda017952d78",
    app_origin: "$CONSOLE_URL_NO_TRAILING_SLASH",
    recaptcha_v2_site_key: "$RECAPTCHA_V2_SITE_KEY",
    aws_project_region: "$AWS_REGION", // (optional) Default region for project
    aws_cognito_region: "$AWS_REGION", // (required) - Region where Amazon Cognito project was created
    aws_user_pools_id: "$AWS_COGNITO_USER_POOLS_ID", // (optional) -  Amazon Cognito User Pool ID
    aws_user_pools_web_client_id: "$AWS_COGNITO_USER_POOLS_WEB_CLIENT_ID", // (optional) - Amazon Cognito App Client ID (App client secret needs to be disabled)
    aws_cognito_identity_pool_id: "$AWS_CONGITO_IDENTITY_POOL_ID", // (optional) - Amazon Cognito Identity Pool ID
    aws_mandatory_sign_in: "enable", // (optional) - Users are not allowed to get the aws credentials unless they are signed in
    unauth_api_key: "$CONSOLE_UNAUTH_API_KEY",
    vault_oidc: {
        oidc_base_url: "$OIDC_BASE_URL",
        client_id: "$OIDC_CLIENT_ID",
        redirect_uri: "$CONSOLE_URL_NO_TRAILING_SLASH/vault/oidc/callback",
        resource: "$OIDC_RESOURCE_ID"
    },
    "oauth": {
        "domain": "$AWS_COGNITO_USER_POOLS_DOMAIN",
        "name": "$AWS_COGNITO_IDENTITY_PROVIDER",
        "scope": [
            "phone",
            "email",
            "openid",
            "profile",
            "aws.cognito.signin.user.admin"
        ],
        "redirectSignIn": "$CONSOLE_URL",
        "redirectSignOut": "$CONSOLE_URL",
        "responseType": "code"
    },
    aws_cloud_logic_custom: [
        {
            name: "console",
            endpoint: "$API_ENDPOINT",
            region: "$AWS_REGION"
        }
    ]
}
EOF
