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

USERNAME = 'admin'
PASSWORD = 'adminpass'

# upewnij sie ze seed zostal wykonany
from utils.seed import seed_db
db = SessionLocal()
try:
    seed_db(db)
finally:
    db.close()
# login
r = client.post('/auth/login', json={'username': USERNAME, 'password': PASSWORD})
print('login', r.status_code, r.json())
if r.status_code != 200:
    raise SystemExit('login failed')

token = r.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

# stats
r = client.get('/admin/stats', headers=headers)
print('stats', r.status_code, r.json())

# seed via endpoint
r = client.post('/admin/seed', headers=headers)
print('seed endpoint', r.status_code, r.json())

# cleanup
cleanup_user(USERNAME)
print('cleanup done')
