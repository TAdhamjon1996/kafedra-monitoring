import unittest
import os
import sys

# Ensure backend root is on sys.path
backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.services.rating_engine import calculate_coauthor_coefficient, preview_activity_points
from app.services.file_validator import detect_mime_type


class TestBackend(unittest.TestCase):
    def test_password_hashing(self):
        raw = "maxfiy_parol_2026"
        hashed = hash_password(raw)
        self.assertNotEqual(hashed, raw)
        self.assertTrue(verify_password(raw, hashed))
        self.assertFalse(verify_password("noto'g'ri_parol", hashed))

    def test_jwt_token(self):
        payload = {"sub": "1", "fio": "Egamberdiyev Nodir", "role": "teacher"}
        token = create_access_token(payload)
        decoded = decode_access_token(token)
        self.assertIsNotNone(decoded)
        self.assertEqual(decoded["sub"], "1")
        self.assertEqual(decoded["fio"], "Egamberdiyev Nodir")
        self.assertEqual(decoded["role"], "teacher")

    def test_coauthor_coefficient(self):
        # 1 author -> 1.0
        self.assertEqual(calculate_coauthor_coefficient(1), 1.0)
        # 2 authors -> 0.6
        self.assertEqual(calculate_coauthor_coefficient(2), 0.6)
        # 3 authors -> 1/3 = 0.333
        self.assertEqual(calculate_coauthor_coefficient(3), 0.333)
        # 4 authors -> 1/4 = 0.25
        self.assertEqual(calculate_coauthor_coefficient(4), 0.25)

    def test_preview_points(self):
        scopus_1 = preview_activity_points("scopus", 1)
        self.assertEqual(scopus_1["estimated_points"], 50.0)

        scopus_2 = preview_activity_points("scopus", 2)
        self.assertEqual(scopus_2["estimated_points"], 30.0) # 50 * 0.6

        oak_1 = preview_activity_points("oak", 1)
        self.assertEqual(oak_1["estimated_points"], 30.0)

        dgu_1 = preview_activity_points("dgu", 1)
        self.assertEqual(dgu_1["estimated_points"], 25.0)

        tezis_xalqaro = preview_activity_points("tezis_xalqaro", 1)
        self.assertEqual(tezis_xalqaro["estimated_points"], 10.0)

        tezis_res = preview_activity_points("tezis_res", 1)
        self.assertEqual(tezis_res["estimated_points"], 5.0)

    def test_mime_magic_bytes(self):
        pdf_bytes = b"%PDF-1.4\r\nsome content"
        self.assertEqual(detect_mime_type(pdf_bytes), "application/pdf")

        jpeg_bytes = b"\xFF\xD8\xFF\xE0\x00\x10JFIF"
        self.assertEqual(detect_mime_type(jpeg_bytes), "image/jpeg")

        png_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR"
        self.assertEqual(detect_mime_type(png_bytes), "image/png")

        fake_bytes = b"MZ\x90\x00\x03\x00\x00\x00" # EXE
        self.assertEqual(detect_mime_type(fake_bytes), "application/octet-stream")


if __name__ == "__main__":
    unittest.main()
