import os
import sys
import boto3
import pytest
import json
import mock
import random
from moto import mock_secretsmanager
sys.path.append(os.path.dirname(os.path.abspath('./')))

secret_name = "dummysecret"
oidc_discovery_url = "https://adfs.theonlywaye.com/adfs/.well-known/openid-configuration"
vault_api_url = "https://dev-vault.aws-150.aws.managedcloud.solutions/v1/"
client_secret = "dummyclientsecret"


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


@pytest.fixture
def aws_credentials():
    """Mocked AWS Credentials for moto."""
    os.environ['AWS_ACCESS_KEY_ID'] = 'testing'
    os.environ['AWS_SECRET_ACCESS_KEY'] = 'testing'
    os.environ['AWS_SECURITY_TOKEN'] = 'testing'
    os.environ['AWS_SESSION_TOKEN'] = 'testing'


@pytest.fixture
def mock_ssm_secret(patch_env_vars):
    with mock_secretsmanager():
        conn = boto3.client('secretsmanager', region_name='ap-southeast-2')
        create_secret = conn.create_secret(Name=secret_name,
                                           SecretString=json.dumps({
                                               "client_secret": client_secret,
                                           }))
        result = conn.get_secret_value(SecretId=secret_name)
        yield result


@pytest.fixture
def patch_env_vars(monkeypatch):
    monkeypatch.setitem(os.environ, 'LOGGING_LEVEL', 'DEBUG')
    monkeypatch.setitem(os.environ, 'SECRET_NAME', secret_name)
    monkeypatch.setitem(os.environ, 'OIDC_DISCOVERY_URL', oidc_discovery_url)
    monkeypatch.setitem(os.environ, 'TRUSTED_GROUPS', "Administrators")
    monkeypatch.setitem(os.environ, 'VAULT_API_URL', vault_api_url)


@pytest.fixture
def oidcEvent():
    with open(os.path.join(os.path.dirname(__file__), 'oidc_event.json'), 'r') as json_file:
        event = json.load(json_file)
    yield event


@pytest.fixture
def loginEvent():
    with open(os.path.join(os.path.dirname(__file__), 'login_event.json'), 'r') as json_file:
        event = json.load(json_file)
    yield event


class Test_Entry(object):

    def test_oidc_response(self, mocker, patch_env_vars, oidcEvent, mock_ssm_secret):
        context = MockContext("vaultoidc", "3.8")
        from vaultoidc import lambda_handler
        lambda_handler(oidcEvent, context)
        assert 1 == 1

    def test_login_response(self, mocker, patch_env_vars, loginEvent, mock_ssm_secret):
        context = MockContext("vaultoidc", "3.8")
        from vaultoidc import lambda_handler
        lambda_handler(loginEvent, context)
        assert 1 == 1
