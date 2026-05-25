from auth import hash_password
from database import SessionLocal
from models import User

def main():
    db = SessionLocal()
    try:
        u = db.query(User).filter(User.username == 'admin').first()
        if not u:
            print('admin not found')
            return
        u.password_hash = hash_password('adminpass')
        db.add(u)
        db.commit()
        print('admin password hash updated')
    finally:
        db.close()

if __name__ == '__main__':
    main()
