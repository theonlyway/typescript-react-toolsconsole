import pytest
import os
import sys
import random
sys.path.append(os.path.dirname(os.path.abspath('./')))

event = {
    'type': 'TOKEN',
    'methodArn': 'arn:aws:execute-api:ap-southeast-2:646801089018:m91hyxrkt6/Test/GET/pets',
    'authorizationToken': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik5yMXZHMEdVNVQzTkI2V2k3MzMtQ0RjUnhSUSIsImtpZCI6Ik5yMXZHMEdVNVQzTkI2V2k3MzMtQ0RjUnhSUSJ9.eyJhdWQiOiJhNmE3MzUyYi04NzVkLTRkYmUtYjg2Zi05NjU5MWUxMjg1NDgiLCJpc3MiOiJodHRwczovL2ZlZGVyYXRpb24uYXJxLmdyb3VwL2FkZnMiLCJpYXQiOjE2MjIxMDc2NjYsImV4cCI6MTYyMjExMTI2NiwiYXV0aF90aW1lIjoxNjIyMTA3NjUzLCJtZmFfYXV0aF90aW1lIjoxNjIyMTA3NjY2LCJub25jZSI6ImZiZWVkMzY1LWM1NDAtNDQ2MS1iZmJkLWVkYTAxNzk1MmQ3OCIsInN1YiI6ImFpQmFUcVdTSkZxcjEyUWhYWVhYYkNqUEt2a3dmMytjVzVaYXVlbmpIWlE9IiwidXBuIjoiYW50aG9ueS53YXllQGFycS5ncm91cCIsInVuaXF1ZV9uYW1lIjoiQVJRR1JPVVBcXGFudGhvbnkud2F5ZSIsInB3ZF91cmwiOiJodHRwczovL2ZlZGVyYXRpb24uYXJxLmdyb3VwL2FkZnMvcG9ydGFsL3VwZGF0ZXBhc3N3b3JkLyIsInNpZCI6IlMtMS01LTIxLTI1MjE1OTcyMDItNDcwNzQ1NTIwLTEzNTU1NTM5OTgtNDk5MCIsImVtYWlsIjoiYW50aG9ueS53YXllQGFycS5ncm91cCIsImdyb3VwcyI6WyJEb21haW4gVXNlcnMiLCJPMzY1U0FMIC0gT2ZmaWNlIDM2NSBFbnRlcnByaXNlIEUzIiwiUFBFIEV4dGVuZGVkIE1heGltdW0gQWdlIFVzZXJzIiwiTUJBTSAtIERhdGFiYXNlIFJlYWQiLCJNSVRBVUNTUC1NSVRfQ3VzdG9tZXJfRVMtQWRtaW4iLCJBREZTIC0gQ2xvdWRIZWFsdGggLSBQb3dlciBVc2VycyIsIkFERlMgLSBDbG91ZEhlYWx0aCAtIFN0YW5kYXJkIFVzZXJzIiwiTUlUQVVDU1AtTUlUX0N1c3RvbWVyX0FSUVZTVFMtQURPQWRtaW5zIiwiX00zIC0gVENBQiBSZXZpZXciLCJBREZTIC0gU3BsdW5rIC0gVXNlcnMiLCJPMzY1U0FMIC0gT2ZmaWNlIDM2NSBFbnRlcnByaXNlIEUzIC0gUGhvbmUgU3lzdGVtIEFkZCBPbiIsIl9FbnRlcnByaXNlIC0gTWFuYWdlZCBTZXJ2aWNlcyIsIk1JVEFVQ1NQLU1JVF9DdXN0b21lcl9FUy1TdGFmZi1BY2NvdW50cyIsIl9FbnRlcnByaXNlIC0gTWFuYWdlZCBTZXJ2aWNlcyAtIEJORSIsIl9FbnRlcnByaXNlIC0gQnJpc2JhbmUiLCJfRW50ZXJwcmlzZSAtIEFsbCIsIk1JVEFVQ1NQLU1JVF9DdXN0b21lcl9BWjIwLUFET19UZXN0IiwiTUlUQVVDU1AtTUlUX0N1c3RvbWVyX0FaMTYtQXpkb0FycUdyb3VwLUxpY2Vuc2VkIiwiTUlUQVVDU1AtTUlUX0N1c3RvbWVyX0FaMTYtQXpkb0FycUdyb3VwSW50LUFkbWlucyIsIk1JVEFVQ1NQLU1JVF9DdXN0b21lcl9BWjE2LUF6ZG9BcnFHcm91cEludC1MaWNlbnNlZCIsIkFERlMgLSBEeW5hdHJhY2UgU1NPIEFjY2VzcyIsIk1lcmFraSBBY2Nlc3MgLSBDbGllbnQgVlBOIiwiQVdTQWNjZXNzLVNlY0NsZWFyYW5jZSIsIkppcmEtVXNlciIsIl9FbnRlcnByaXNlIC0gTWFuYWdlZCBTZXJ2aWNlcyAtIE1pY3Jvc29mdCBIb3N0aW5nIFRlYW0iLCJBV1NBY2Nlc3MtRVNSZWFkT25seSIsIkFXU0FjY2Vzcy1Eb21pbm9zIiwiQVdTQWNjZXNzLUVTQWRtaW4iLCJDb25mbHVlbmNlLUJUIiwiQ29uZmx1ZW5jZS1TeXNhZG1pbiIsIkNvbmZsdWVuY2UtVXNlciIsIk1JVEFVQ1NQLU1JVF9DdXN0b21lcl9BWjMxLVRyb2JleGlzLU5PTlBST0QtQWRtaW5zIiwiTUlUQVVDU1AtTUlUX0N1c3RvbWVyX0FaMzctVHJvYmV4aXMtUFJPRC1BZG1pbnMiLCJBRE8tSW5mcmEtVXNlcnMiLCJBUlFBVUNTUF9DdXN0b21lcl9BWjIwLUFET19UZXN0IiwiQVJRQVVDU1BfQ3VzdG9tZXJfQVozMC1Ucm9iZXhpcy1BZG1pbnMiLCJBUlFBVUNTUF9DdXN0b21lcl9FUy1TdGFmZi1BY2NvdW50cyIsIkFSUUFVQ1NQX0N1c3RvbWVyX0FaMzUtTkNJLUFkbWlucyIsIkFSUUFVQ1NQX0N1c3RvbWVyX0VTLUFkbWluIiwiQVJRQVVDU1BfQ3VzdG9tZXJfQVozMS1Ucm9iZXhpcy1OT05QUk9ELUFkbWlucyIsIkFSUUFVQ1NQX0N1c3RvbWVyX0FaMzctVHJvYmV4aXMtUFJPRC1BZG1pbnMiLCJfRW50ZXJwcmlzZSAtIFByaW9yaXR5IFNlcnZpY2VzIENhbGwgUXVldWUgLSBvdmVyZmxvdyIsIk1JVEFVQ1NQLU1JVF9DdXN0b21lcl9BWjMwLVRyb2JleGlzLUFkbWlucyIsIk1JVEFVQ1NQLU1JVF9DdXN0b21lcl9BWjM1LU5DSS1EZXYtQWRtaW5zIiwiQURPLUluZnJhLUFkbWluIiwiX0FSUSAtIEFXUyBBY2NvdW50cyIsIl9DdXN0b21lciBPcHMgLSBTb2x1dGlvbiBSZWxpYWJpbGl0eSBFbmdpbmVlcmluZyIsIl9DdXN0b21lciBPcHMgLSBTb2x1dGlvbiBSZWxpYWJpbGl0eSBhbmQgU3VwcG9ydCIsIlVuaWZpIEFjY2VzcyAtIENsaWVudCBWUE4iLCJVbmlmaSBBY2Nlc3MgLSBXaXJlZCBcdTAwMjYgV2lyZWxlc3MiXSwiYXBwdHlwZSI6IkNvbmZpZGVudGlhbCIsImFwcGlkIjoiYTZhNzM1MmItODc1ZC00ZGJlLWI4NmYtOTY1OTFlMTI4NTQ4IiwiYXV0aG1ldGhvZCI6InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDphYzpjbGFzc2VzOlBhc3N3b3JkUHJvdGVjdGVkVHJhbnNwb3J0IiwidmVyIjoiMS4wIiwic2NwIjoib3BlbmlkIn0.GJx_f2K2nxZN53cgzXRC4PR36dUyqgxYZrQV6XvAlElPg_x0EhwrQEQjSZQ9iKvl_bYyn78dh-cwJ19hmol8iBxVqkxnBBu4WGeRvJ0BfOmUwTmZ1Ogyrbom4XVA027EPxRN25SRqfgBWzIAh93OUK-Vk3BmDD2xl7DftuNsMszDCFnZQTO7AbFa-GzbROcN0TvRqQGGmQ55x-snYy1R4gB6fF0tK6Fy2mlgYguc0OY0DQJu3MwxolD95k96eqU4Ai154luuhw5ZYz5jQjT3yHCakJOHL0bNJcwizuoOJM2NgpwC7JsNa7rYMEXqz3BVJZM1znn7adPPB1ay7tUZeg'
}


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
def patch_env_vars(monkeypatch):
    monkeypatch.setitem(os.environ, 'LOGGING_LEVEL', 'INFO')
    monkeypatch.setitem(os.environ, 'TOKEN_ISSUER',
                        'https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_ghQBKhZ0u')
    monkeypatch.setitem(os.environ, 'AUDIENCE', '5rns6717ak7rhharuhv9vcctag')
    monkeypatch.setitem(os.environ, 'JWKS_URI',
                        'https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_ghQBKhZ0u/.well-known/jwks.json')


class Test_Authorizer(object):

    def test_authorizer(self, patch_env_vars):
        context = MockContext("authorizer", "3.8")
        from authorizer import lambda_handler
        lambda_handler(event, context)
        assert 1 == 1
