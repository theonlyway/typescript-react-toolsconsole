import json
import logging
import os
import boto3
from botocore.exceptions import ClientError

logging.basicConfig(format='%(levelname)s: %(asctime)s: %(message)s')
logger = logging.getLogger()
logger.setLevel(os.environ['LOGGING_LEVEL'])

cognito = boto3.client('cognito-idp')


def lambda_handler(event, context):
    # Log the values received in the event and context arguments
    logger.info(json.dumps(event))
    logger.info(context)
    identities = json.loads(event['request']['userAttributes']['identities'])
    if event['triggerSource'] == 'PostConfirmation_ConfirmSignUp' and event['request']['userAttributes']['cognito:user_status'] == 'EXTERNAL_PROVIDER' and identities[0]['issuer'] == os.environ['TRUSTED_ISSUER']:
        try:
            response = cognito.admin_add_user_to_group(
                UserPoolId=event['userPoolId'],
                Username=event['userName'],
                GroupName='Staff'
            )
        except ClientError as err:
            logger.error(err)
            raise Exception(err)
        logger.info(json.dumps(response))
    return event
