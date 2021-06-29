import json
import logging
import os
import boto3
import base64
import requests
from botocore.exceptions import ClientError
import common

logging.basicConfig(format='%(levelname)s: %(asctime)s: %(message)s')
logger = logging.getLogger()
logger.setLevel(os.environ['LOGGING_LEVEL'])

secrets = boto3.client('secretsmanager')


def get_secret(id, context):
    try:
        resp = secrets.get_secret_value(SecretId=id)
        # Decrypts secret using the associated KMS CMK.
        # Depending on whether the secret is a string or binary, one of these fields will be populated.
        if 'SecretString' in resp:
            logger.info("Found Secret String")
            return resp['SecretString']
        else:
            logger.info("Found Binary Secret")
            return base64.b64decode(resp['SecretBinary'])
    except ClientError as err:
        logger.info('Error Talking to SecretsManager: ' +
                    err.response['Error']['Code'] + ', Message: ' + str(err))
        raise Exception(err)


def lambda_handler(event, context):
    # Log the values received in the event and context arguments
    logger.info(json.dumps(event))
    logger.info(context)
    body = json.loads(event['body'])
    logger.info(json.dumps(body))
    trustedGroups = set(os.environ['TRUSTED_GROUPS'].split(','))
    userGroups = set(
        (event['requestContext']['authorizer']['groups']).split(','))
    if common.confirmgroups(trustedGroups, userGroups) == False:
        return common.response({'message': "Unauthorized", 'aws_request_id': context.aws_request_id}, 403)
    if event['path'] == '/vault/oidc':
        secret = json.loads(get_secret(os.environ['SECRET_NAME'], context))
        try:
            oidcDiscovery = requests.get(
                os.environ['OIDC_DISCOVERY_URL'], verify=False)
            oidcMetdata = json.loads(oidcDiscovery.text)
            logger.debug(json.dumps(oidcMetdata))
        except Exception as e:
            logger.error(e)
            raise Exception(e)
        payload = body.copy()
        payload.update({'client_secret': secret['client_secret']})

        try:
            headers = {
                'Content-Type': 'application/x-www-url-form-urlencoded'
            }
            response = requests.post(
                oidcMetdata['token_endpoint'], headers=headers, data=payload, verify=True)
            if response.ok == True:
                logger.debug(json.dumps(response.text))
                return common.response(response.json(), 200)
            else:
                logger.error(response.text)
                errorMessage = json.loads(response.text)
                return common.response(response.json(), 200)
        except Exception as e:
            logger.error(e)
            errorMessage = json.loads(e.args[0])
            return common.response({
                'message': errorMessage['error_description'],
                'error': errorMessage['error'],
                'aws_request_id': context.aws_request_id
            }, 500)
    elif event['path'] == '/vault/login':
        try:
            data = {
                'jwt': body['id_token']
            }
            response = requests.post(
                os.environ['VAULT_API_URL'] + 'auth/jwt/login', data=json.dumps(data))
            if response.ok == True:
                logger.debug(json.dumps(response.text))
                return common.response(response.json(), 200)
            else:
                logger.error(response.text)
                errorMessage = json.loads(response.text)
                return common.response(response.json(), 200)
        except Exception as e:
            logger.error(e)
            errorMessage = json.loads(e.args[0])
            return common.response({
                'message': errorMessage['error_description'],
                'error': errorMessage['error'],
                'aws_request_id': context.aws_request_id
            }, 500)
