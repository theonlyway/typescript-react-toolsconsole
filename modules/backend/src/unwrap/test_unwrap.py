import os
import sys
import boto3
import pytest
import json
import mock
import random
sys.path.append(os.path.dirname(os.path.abspath('./')))

vault_api_url = "https://dev-vault.aws-150.aws.managedcloud.solutions/v1/"


@pytest.fixture
def patch_env_vars(monkeypatch):
    monkeypatch.setitem(os.environ, 'LOGGING_LEVEL', 'DEBUG')
    monkeypatch.setitem(os.environ, 'VAULT_API_URL', vault_api_url)


@pytest.fixture
def unwrapEvent():
    with open(os.path.join(os.path.dirname(__file__), 'unwrap_event.json'), 'r') as json_file:
        event = json.load(json_file)
    yield event


@pytest.fixture
def lookupEvent():
    with open(os.path.join(os.path.dirname(__file__), 'lookup_event.json'), 'r') as json_file:
        event = json.load(json_file)
    yield event


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

    def test_unwrap_response(self, mocker, patch_env_vars, unwrapEvent):
        context = MockContext("unwrap", "3.8")
        from unwrap import lambda_handler
        lambda_handler(unwrapEvent, context)
        assert 1 == 1

    def test_lookup_response(self, mocker, patch_env_vars, lookupEvent):
        context = MockContext("unwrap", "3.8")
        from unwrap import lambda_handler
        lambda_handler(lookupEvent, context)
        assert 1 == 1
