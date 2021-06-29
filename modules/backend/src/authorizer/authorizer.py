import json
import logging
import os
import re
from jose import jwt
from six.moves.urllib.request import urlopen
import common

logging.basicConfig(format='%(levelname)s: %(asctime)s: %(message)s')
logger = logging.getLogger()
logger.setLevel(os.environ['LOGGING_LEVEL'])


def getPolicyDocument(effect, resource):
    return {
        'Version': '2012-10-17',
        'Statement': [{
            'Action': 'execute-api:Invoke',
            'Effect': effect,
            'Resource': resource,
        }]
    }


def getToken(event):
    if 'type' not in event or event['type'] != 'TOKEN':
        logger.error('Expected "event.type" parameter to have value "TOKEN"')
        raise ValueError(
            'Expected "event.type" parameter to have value "TOKEN"')

    if 'authorizationToken' not in event or event['authorizationToken'] == None:
        logger.error('Expected "event.authorizationToken" parameter to be set')
        raise ValueError(
            'Expected "event.authorizationToken" parameter to be set')

    tokenString = event['authorizationToken']
    regex = "^Bearer (.*)$"
    match = re.match(regex, tokenString)
    if match == None or len(match.groups()) != 1:
        logger.error(
            f"Invalid Authorization token - {tokenString} does not match \"Bearer .*\"")
        raise ValueError(
            f"Invalid Authorization token - {tokenString} does not match \"Bearer .*\"")
    return match.groups()[0]


def getRsaKey(event):
    logger.info('Getting RSA key')
    token = getToken(event)
    jsonurl = urlopen(os.environ['JWKS_URI'])
    jwks = json.loads(jsonurl.read())
    try:
        unverified_header = jwt.get_unverified_header(token)
    except jwt.JWTError:
        logger.error('Error decoding token headers')
        raise Exception('Unauthorized')
    except Exception:
        logger.error('Error decoding token')
        raise Exception('Unauthorized')
    rsa_key = {}
    for key in jwks["keys"]:
        if key["kid"] == unverified_header["kid"]:
            rsa_key = {
                "kty": key["kty"],
                "kid": key["kid"],
                "use": key["use"],
                "n": key["n"],
                "e": key["e"]
            }
    return rsa_key


def verifyToken(event, algorithms=["RS256"]):
    token = getToken(event)
    rsa_key = getRsaKey(event)
    logger.info('Verifying token')
    if rsa_key:
        try:
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=algorithms,
                audience=os.environ['AUDIENCE'],
                issuer=os.environ['TOKEN_ISSUER']
            )
            logger.debug(json.dumps(payload))
            return payload
        except jwt.ExpiredSignatureError:
            logger.error('Token expired')
            raise Exception('Unauthorized')
        except jwt.JWTClaimsError:
            logger.error('Invalid claims')
            raise Exception('Unauthorized')
        except Exception:
            logger.error('Invalid header')
            raise Exception('Unauthorized')
    else:
        logger.error('No RSA key found')
        raise Exception('Unauthorized')


def hasRequiredScopes(payload, required_scopes=[]):
    logger.info(f"Checking payload has required scopes")
    logger.debug(f"Required scopes {required_scopes}")
    token_scopes = payload["scope"].split()
    intersection = set(required_scopes).intersection(token_scopes)
    if len(intersection) != len(required_scopes):
        logger.error('Token does not have required scope')
        raise Exception('Unauthorized')


def lambda_handler(event, context):
    # Log the values received in the event and context arguments
    logger.info(json.dumps(event))
    logger.info(context)
    try:
        payload = verifyToken(event)
        if payload:
            response = {
                'principalId': payload.get('sub'),
                'policyDocument': getPolicyDocument('Allow', event.get('methodArn')),
                'context': {'groups': ','.join(payload.get('cognito:groups'))}
            }
            logger.info('Sending response')
            logger.debug(json.dumps(response))
            return response
    except:
        response = {
            'policyDocument': getPolicyDocument('Deny', event.get('methodArn'))
        }
        logger.info('Sending response')
        logger.debug(json.dumps(response))
        return response
