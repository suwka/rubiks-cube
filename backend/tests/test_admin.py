from database import SessionLocal


def test_seed_and_stats(client):
    # ensure seed run
    from utils.seed import seed_db
    db = SessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()

    # login as default admin
    r = client.post('/auth/login', json={'username':'admin','password':'adminpass'})
    assert r.status_code == 200
    token = r.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    r = client.get('/admin/stats', headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert 'total_users' in data and 'total_algorithms' in data
