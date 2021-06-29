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
    logger.info(json.dumps(body))
    token = body['token']
    if event['path'] == '/vault/unwrap':
        try:
            headers = {
                'X-Vault-Token': token
            }
            response = requests.post(
                os.environ['VAULT_API_URL'] + 'sys/wrapping/unwrap', headers=headers)
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
    elif event['path'] == '/vault/lookup':
        try:
            data = {
                'token': token
            }
            response = requests.post(
                os.environ['VAULT_API_URL'] + 'sys/wrapping/lookup', data=json.dumps(data))
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
