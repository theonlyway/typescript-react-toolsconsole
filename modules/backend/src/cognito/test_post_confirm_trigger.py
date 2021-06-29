import os
import sys
import boto3
import pytest
import json
import mock
import random
from moto import mock_cognitoidp
sys.path.append(os.path.dirname(os.path.abspath('./')))


@pytest.fixture
def patch_env_vars(monkeypatch):
    monkeypatch.setitem(os.environ, 'LOGGING_LEVEL', 'DEBUG')


@pytest.fixture
def event():
    with open(os.path.join(os.path.dirname(__file__), 'adfs_event.json'), 'r') as json_file:
        event = json.load(json_file)
    yield event


@pytest.fixture
def mock_cognito(patch_env_vars):
    with mock_cognitoidp():
        cognito = boto3.client('cognito-idp')
        yield cognito


class MockContext(object):
    def __init__(self, name, version):
        self.function_name = name
        self.function_version = version
        self.invoked_function_arn = (
            "arn:aws:lambda:us-east-1:123456789012:function:{name}:{version}".format(name=name, version=version))
        self.memory_limit_in_mb = float('inf')
        self.log_group_name = 'test-group'
        self.log_stream_name = 'test-stream'
        self.client_context = None

        self.aws_request_id = '-'.join(map(
            lambda n: ''.join(map(lambda _: random.choice(
                '0123456789abcdef'), range(0, n))),
            [8, 4, 4, 4, 12]
        ))

    def get_remaining_time_in_millis(self):
        return float('inf')


class Test_Entry(object):

    def test_wrap_response(self, mocker, patch_env_vars, event, mock_cognito):
        context = MockContext("unwrap", "3.8")
        from post_confirm_trigger import lambda_handler
        lambda_handler(event, context)
        assert 1 == 1
