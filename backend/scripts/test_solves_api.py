from fastapi.testclient import TestClient
from main import app
from database import SessionLocal

client = TestClient(app)

def cleanup(username):
    s = SessionLocal()
    user = s.query(__import__('models').User).filter(__import__('models').User.username==username).first()
    if user:
        s.query(__import__('models').Solve).filter(__import__('models').Solve.user_id==user.id).delete()
        s.delete(user)
        s.commit()
    s.close()

USERNAME = 'solvetest'
EMAIL = 'solvetest@example.com'
PASSWORD = 'testpassword'

cleanup(USERNAME)

# register
r = client.post('/auth/register', json={'username': USERNAME, 'email': EMAIL, 'password': PASSWORD})
print('register', r.status_code)
uid = r.json()['id']

# login
r = client.post('/auth/login', json={'username': USERNAME, 'password': PASSWORD})
print('login', r.status_code)
token = r.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

# create solve
r = client.post('/solves/', json={'time_ms': 12345, 'scramble':'R U R\'','dnf':False,'plus_two':False}, headers=headers)
print('create solve', r.status_code, r.json())
solve_id = r.json()['id']

# get my solves
r = client.get('/solves/me', headers=headers)
print('my solves', r.status_code, r.json())

# get user top10 public
r = client.get(f'/solves/user/{uid}')
print('user top10', r.status_code, r.json())

# delete solve
r = client.delete(f'/solves/{solve_id}', headers=headers)
print('delete', r.status_code, r.json())

# cleanup
cleanup(USERNAME)
print('cleanup done')
