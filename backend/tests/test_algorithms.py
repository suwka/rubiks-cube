import uuid
from database import SessionLocal
from auth import hash_password


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


def test_algorithms_crud(client):
    # create admin directly
    uname = f"adm_{uuid.uuid4().hex[:8]}"
    pw = 'adminpass123'
    s = SessionLocal()
    User = __import__('models').User
    admin = User(username=uname, email=f"{uname}@example.com", password_hash=hash_password(pw), role='admin')
    s.add(admin)
    s.commit()
    s.refresh(admin)
    s.close()

    # login
    r = client.post('/auth/login', json={'username': uname, 'password': pw})
    assert r.status_code == 200
    token = r.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    ALG_NAME = f"alg_{uuid.uuid4().hex[:6]}"
    files = {'image': ('alg.png', b'PNG', 'image/png')}
    data = {'category':'pll','name':ALG_NAME,'moves':'R U R\'','description':'test alg'}
    r = client.post('/algorithms', files=files, data=data, headers=headers)
    assert r.status_code == 201
    aid = r.json()['id']

    # list
    r = client.get('/algorithms')
    assert r.status_code == 200

    # get by id
    r = client.get(f'/algorithms/{aid}')
    assert r.status_code == 200

    # delete
    r = client.delete(f'/algorithms/{aid}', headers=headers)
    assert r.status_code == 200

    cleanup_algorithm(ALG_NAME)
    cleanup_user(uname)
