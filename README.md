CubeTracker — README

Krótki opis
- CubeTracker to aplikacja webowa do ćwiczenia i rejestrowania układania kostki Rubika. Zawiera timer ze sposobem uzbrajania (przytrzymaj spację), zapis czasów, kolekcję algorytmów z obrazkami oraz panel administracyjny.

Główne funkcje (poziom użytkownika)
- Niezalogowany:
	- losowy scramble, timer (przytrzymaj spację → puść = start; zatrzymaj spacją), przegląd algorytmów (metoda zaawansowana podzielona na 4 sekcje, 3 z opisami)
- Zalogowany:
	- wszystkie funkcje niezalogowanego
	- zapis czasów (zapis; +2 dodaje 2s; DNF nie zapisuje), lista własnych czasów, `bio`, `cube setup`, zmiana hasła, logout
- Administrator:
	- CRUD algorytmów (dodawanie/edycja/usuwanie + upload obrazka)
	- panel admina: lista użytkowników, zarządzanie kontami (reset hasła, usunięcie)

Mapowanie do kryteriów oceny (dowód krótkie wskazówki)
- Ocena 3.0 (Dostateczny):
	- Działający backend: `backend/main.py` (FastAPI + Uvicorn).  — uruchom serwer, odwiedź `/docs`.
	- Połączenie z bazą: `backend/database.py` (SQLite).
	- CRUD dla 1 encji: przykładowo `algorithms` w `backend/routers/algorithms.py`.
	- Demo video: pokaż timer i zapis czasu (screeny poniżej).
- Ocena 4.0 (Dobry):
	- Controller/Service/Repository: kod rozdzielony między `backend/routers/` i `backend/services/`.
	- DTO + walidacja: `backend/schemas.py` (Pydantic v2).
	- Obsługa błędów: wyjątki mapowane na `HTTPException` w routerach.
	- Security: JWT w `backend/auth.py` i Angular interceptor.
- Ocena 5.0 (Bardzo dobry):
	- Unit testy: `backend/tests/` (uruchom `pytest -q`).
	- Events / background tasks: background tasks przeliczające statystyki (`backend/services/stats_service.py`).
	- Frontend Angular: kod w `frontend/` konsumuje API.

Jak uruchomić (skrót)
1) Backend
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
2) Frontend
```bash
cd frontend
npm install
npm run dev
```

Ważne pliki
- backend/main.py — start serwera, mount StaticFiles
- backend/routers/ — definicje endpointów
- backend/services/ — logika aplikacji
- backend/schemas.py — DTO
- frontend/ — aplikacja Angular

Lista screenów (nazwij i wrzuć do repo przed push)
1. `1_timer.png` — ekran główny: timer armed + running
2. `2_register.png` — rejestracja + logowanie (pokaż token w localStorage)
3. `3_add_solve.png` — dodawanie ułożenia: normal / +2 / DNF
4. `4_profile.png` — profil użytkownika z `ao5/ao12/best` i `bio`
5. `5_algs.png` — lista algorytmów i detal z obrazkiem
6. `6_admin.png` — panel admina: lista użytkowników, CRUD algorytmów
7. `7_tests.png` — wynik `pytest -q` lub fragment logów serwera

Wideo demo (2–3 min) — kolejność ujęć
1. Timer: uzbrajanie i pomiar (1 min)
2. Rejestracja/logowanie i zapis czasu (30–45 s)
3. Profil i statystyki (15–30 s)
4. Panel admina: dodanie algorytmu + upload obrazka (30 s)

Po dodaniu screenów możesz od razu pushować — README gotowe.
