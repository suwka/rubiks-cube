from fastapi.testclient import TestClient
from main import app
from database import SessionLocal
from auth import hash_password

client = TestClient(app)

def cleanup_user(username):
    s = SessionLocal()
    s.query(__import__('models').User).filter(__import__('models').User.username==username).delete()
    s.commit()
    s.close()

def cleanup_algorithm(name):
    s = SessionLocal()
    s.query(__import__('models').Algorithm).filter(__import__('models').Algorithm.name==name).delete()
    s.commit()
    s.close()

USERNAME = 'api_alg_admin'
EMAIL = 'api_alg_admin@example.com'
PASSWORD = 'adminpass123'
ALG_NAME = 'api_test_alg'

cleanup_algorithm(ALG_NAME)
cleanup_user(USERNAME)

# create admin directly in db
s = SessionLocal()
User = __import__('models').User
admin = User(username=USERNAME, email=EMAIL, password_hash=hash_password(PASSWORD), role='admin')
s.add(admin)
s.commit()
admin_id = admin.id
s.close()

# login
r = client.post('/auth/login', json={'username': USERNAME, 'password': PASSWORD})
print('login', r.status_code, r.json())
if r.status_code != 200:
    raise SystemExit('login failed')

token = r.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

# create algorithm (multipart)
files = {'image': ('alg.png', b'PNG', 'image/png')}
data = {'category':'pll','name':ALG_NAME,'moves':'R U R\'','description':'test alg'}
r = client.post('/algorithms', files=files, data=data, headers=headers)
print('create alg', r.status_code, r.json())
if r.status_code != 201:
    raise SystemExit('create alg failed')
alg_id = r.json()['id']

# get list
r = client.get('/algorithms')
print('list algs', r.status_code, len(r.json()))

# get by id
r = client.get(f'/algorithms/{alg_id}')
print('get alg', r.status_code, r.json())

# delete
r = client.delete(f'/algorithms/{alg_id}', headers=headers)
print('delete alg', r.status_code, r.json())

# cleanup
cleanup_algorithm(ALG_NAME)
cleanup_user(USERNAME)
print('cleanup done')
