from fastapi.testclient import TestClient
from main import app
from database import SessionLocal

client = TestClient(app)

def cleanup(username):
    s = SessionLocal()
    s.query(__import__('models').User).filter(__import__('models').User.username==username).delete()
    s.commit()
    s.close()

USERNAME = 'api_test_user'
EMAIL = 'api_test_user@example.com'
PASSWORD = 'testpassword'

cleanup(USERNAME)

# register
r = client.post('/auth/register', json={'username': USERNAME, 'email': EMAIL, 'password': PASSWORD})
print('register', r.status_code, r.json())
if r.status_code != 201:
    raise SystemExit('register failed')
uid = r.json()['id']

# login
r = client.post('/auth/login', json={'username': USERNAME, 'password': PASSWORD})
print('login', r.status_code, r.json())
if r.status_code != 200:
    raise SystemExit('login failed')
token = r.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

# get user
r = client.get(f'/users/{uid}')
print('get user public', r.status_code, r.json())

# update profile
r = client.put('/users/me', json={'bio':'hello','cube_setup':'3x3'}, headers=headers)
print('update me', r.status_code, r.json())

# change password (wrong old -> expect 400)
r = client.put('/users/me/password', json={'old_password':'wrong','new_password':'newpass123','new_password_confirm':'newpass123'}, headers=headers)
print('change pw wrong', r.status_code, r.json())

# change password (correct)
r = client.put('/users/me/password', json={'old_password':PASSWORD,'new_password':'newpass123','new_password_confirm':'newpass123'}, headers=headers)
print('change pw ok', r.status_code, r.json())

# cleanup
cleanup(USERNAME)
print('cleanup done')
