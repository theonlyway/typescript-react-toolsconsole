import json
import logging
import os
import boto3
from botocore.exceptions import ClientError
import common

logging.basicConfig(format='%(levelname)s: %(asctime)s: %(message)s')
logger = logging.getLogger()
logger.setLevel(os.environ['LOGGING_LEVEL'])

snsClient = boto3.client('sns')


def send_sms(body):
    message = "Hello, You can unwrap your token here: " + \
        os.environ['UNWRAP_URL'] + body['wrapped_secret']
    try:
        snsClient.publish(
            PhoneNumber=body['mobile_number'],
            Message=message,
            MessageAttributes={'AWS.SNS.SMS.SenderID': {'DataType': 'String', 'StringValue': os.environ['SMS_SENDER_ID']}, 'AWS.SNS.SMS.SMSType': {'DataType': 'String', 'StringValue': 'Transactional'}})
    except ClientError as e:
        logger.error(e)
        raise ConnectionAbortedError(e)


def lambda_handler(event, context):
    # Log the values received in the event and context arguments
    logger.info(json.dumps(event))
    logger.info(context)
    body = json.loads(event['body'])
    logger.debug(json.dumps(body))
    trustedGroups = set(os.environ['TRUSTED_GROUPS'].split(','))
    userGroups = set(
        (event['requestContext']['authorizer']['groups']).split(','))
    if common.confirmgroups(trustedGroups, userGroups):
        send_sms(body)
        return common.response("SMS was successfully submitted", 200)
    else:
        return common.response({'message': "Unauthorized", 'aws_request_id': context.aws_request_id}, 403)
