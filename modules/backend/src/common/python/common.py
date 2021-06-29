import json
import logging
import os

logging.basicConfig(format='%(levelname)s: %(asctime)s: %(message)s')
logger = logging.getLogger()
logger.setLevel(os.environ['LOGGING_LEVEL'])


def response(body, status_code: int, error: bool = False, errorType: str = None):
    if error:
        response = {
            'statusCode': str(status_code),
            'body': json.dumps(body, default=str),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'X-Amzn-ErrorType': "InternalServerError" if errorType == None else errorType
            },
        }
    else:
        response = {
            'statusCode': str(status_code),
            'body': json.dumps(body, default=str),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
        }
    logger.info(json.dumps(response))
    return response


def confirmgroups(trustedgroups, usergroups):
    userGroups = usergroups
    trustedGroups = trustedgroups
    logger.debug(f"Trusted groups: {trustedGroups}")
    logger.debug(f"User groups: {userGroups}")
    intersection = trustedGroups.intersection(userGroups)
    if len(intersection) > 0:
        logger.debug(f"User is in the following group(s): {intersection}")
        return True
    else:
        return False
