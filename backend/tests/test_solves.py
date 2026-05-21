import uuid
from database import SessionLocal


def cleanup_user(username):
    s = SessionLocal()
    s.query(__import__('models').User).filter(__import__('models').User.username==username).delete()
    s.commit()
    s.close()


def test_create_list_delete_solve(client):
    uname = f"solve_{uuid.uuid4().hex[:8]}"
    email = f"{uname}@example.com"
    pw = "solvepass123"

    # register and login
    r = client.post('/auth/register', json={'username': uname, 'email': email, 'password': pw})
    assert r.status_code == 201
    r = client.post('/auth/login', json={'username': uname, 'password': pw})
    assert r.status_code == 200
    token = r.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    # create solve
    payload = {'time_ms': 12000, 'scramble': 'R U R\'', 'dnf': False, 'plus_two': False}
    r = client.post('/solves', json=payload, headers=headers)
    assert r.status_code == 201
    sid = r.json()['id']

    # list my solves
    r = client.get('/solves/me', headers=headers)
    assert r.status_code == 200
    assert any(s['id'] == sid for s in r.json())

    # delete
    r = client.delete(f'/solves/{sid}', headers=headers)
    assert r.status_code == 200

    cleanup_user(uname)
