import uuid
from database import SessionLocal


def cleanup_user(username):
    s = SessionLocal()
    s.query(__import__('models').User).filter(__import__('models').User.username==username).delete()
    s.commit()
    s.close()


def test_register_login_update_change_password(client):
    uname = f"testuser_{uuid.uuid4().hex[:8]}"
    email = f"{uname}@example.com"
    pw = "strongpass123"

    # register
    r = client.post('/auth/register', json={'username': uname, 'email': email, 'password': pw})
    assert r.status_code == 201
    uid = r.json()['id']

    # login
    r = client.post('/auth/login', json={'username': uname, 'password': pw})
    assert r.status_code == 200
    token = r.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    # get public
    r = client.get(f'/users/{uid}')
    assert r.status_code == 200

    # update profile
    r = client.put('/users/me', json={'bio':'hello','cube_setup':'3x3'}, headers=headers)
    assert r.status_code == 200

    # change password
    r = client.put('/users/me/password', json={'old_password':pw,'new_password':'newpass123','new_password_confirm':'newpass123'}, headers=headers)
    assert r.status_code == 200

    cleanup_user(uname)
