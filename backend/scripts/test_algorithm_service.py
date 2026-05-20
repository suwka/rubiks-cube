#!/usr/bin/env python3
from database import SessionLocal
from services import algorithm_service
import os

class DummyUpload:
    def __init__(self, data: bytes, content_type: str):
        from io import BytesIO
        self.file = BytesIO(data)
        self.content_type = content_type


def main():
    s = SessionLocal()
    # cleanup previous test algs
    s.query(__import__('models').Algorithm).filter(__import__('models').Algorithm.name.like('test_algo_%')).delete()
    s.commit()

    alg_plain = algorithm_service.create_algorithm(s, 'pll', 'test_algo_plain', "R U R'", 'desc', None)
    print('created no-image:', alg_plain.id, alg_plain.image_path)

    img = DummyUpload(b'PNGDATA', 'image/png')
    alg_img = algorithm_service.create_algorithm(s, 'oll', 'test_algo_img', "R U2 R'", None, img)
    print('created with-image:', alg_img.id, alg_img.image_path)

    static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static', 'algs')
    img_path = os.path.join(static_dir, alg_img.image_path) if alg_img.image_path else None
    print('image exists:', os.path.exists(img_path), img_path)

    # update image
    img2 = DummyUpload(b'NEWPNG', 'image/png')
    alg_img = algorithm_service.update_algorithm(s, alg_img.id, image_file=img2)
    new_img_path = os.path.join(static_dir, alg_img.image_path) if alg_img.image_path else None
    print('updated image path:', alg_img.image_path, 'exists:', os.path.exists(new_img_path))

    # delete both
    algorithm_service.delete_algorithm(s, alg_plain.id)
    algorithm_service.delete_algorithm(s, alg_img.id)
    print('deleted algs')

    print('file still exists after delete:', os.path.exists(new_img_path))
    s.close()

if __name__ == '__main__':
    main()
