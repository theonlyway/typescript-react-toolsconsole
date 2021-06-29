import json
import logging
import os
import common
import re
from jose import jwt
from six.moves.urllib.request import urlopen

logging.basicConfig(format='%(levelname)s: %(asctime)s: %(message)s')
logger = logging.getLogger()
logger.setLevel(os.environ['LOGGING_LEVEL'])


def lambda_handler(event, context):
    # Log the values received in the event and context arguments
    logger.info(json.dumps(event))
    logger.info(context)
    return common.response("hello world", 200)
