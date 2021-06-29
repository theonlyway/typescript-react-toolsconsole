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


def lambda_handler(event, context):
    # Log the values received in the event and context arguments
    logger.info(json.dumps(event))
    logger.info(context)
    body = json.loads(event['body'])
    secret = json.loads(body['secret'])
    logger.debug(json.dumps(body))
    trustedGroups = set(os.environ['TRUSTED_GROUPS'].split(','))
    userGroups = set(
        (event['requestContext']['authorizer']['groups']).split(','))
    if common.confirmgroups(trustedGroups, userGroups):
        try:
            headers = {
                'X-Vault-Wrap-TTL': body['wrap_ttl'],
                'X-Vault-Token': body['client_token']
            }
            response = requests.post(
                os.environ['VAULT_API_URL'] + 'sys/wrapping/wrap', headers=headers, data=json.dumps(secret))
            if response.ok:
                logger.info(json.dumps(response.json()))
                return common.response(response.json(), 200)
            else:
                logger.error(response.text)
                errorMessage = json.loads(response.text)
                return common.response(response.json(), 200)
        except Exception as e:
            logger.error(e)
            errorMessage = json.loads(e.args[0])
            return common.response({
                'message': errorMessage['errors'][0],
                'aws_request_id': context.aws_request_id
            }, 500)
    else:
        return common.response({'message': "Unauthorized", 'aws_request_id': context.aws_request_id}, 403)
