
# Potwierdzenie spełnienia wymagań — ocena 5.0

Ocena 3.0 (Dostateczny)
- Działający backend: serwer uruchamia się, udostępnia dokumentację i zwraca status.
  - Przykład: endpoint główny i start serwera w [backend/main.py](backend/main.py#L1).
- Połączenie z bazą danych: trwałe ustawienie połączenia i inicjalizacja schematu.
  - Przykład: SQLite + engine w [backend/database.py](backend/database.py#L1).
- CRUD dla 1 encji: podstawowe operacje Create/Read/Update/Delete działają dla encji.
  - Przykład: CRUD algorytmów dostępny pod `/algorithms` (router + service).
- Demo video: krótki film pokazujący podstawowe użycie API/aplikacji.
  - Przykład: nagranie pokazujące timer i zapis rezultatu (dołączyć link w README).

Ocena 4.0 (Dobry)
- Warstwowa struktura (Controller/Service/Repository): separacja odpowiedzialności, łatwiejsze testowanie i utrzymanie.
  - Przykład: `routers/` (kontrolery) i `services/` (logika biznesowa) w projekcie.
- DTO + Walidacja danych: wejścia i wyjścia opisane schematami, walidacja pól.
  - Przykład: Pydantic schematy w [backend/schemas.py](backend/schemas.py#L1) (min/max, patterny).
- Obsługa błędów: błędy walidacji i operacyjne są zwracane jako HTTPException z kodami.
  - Przykład: wyjątki rzucone w routerach i zamieniane na odpowiednie kody HTTP.
- Security (JWT lub Basic Auth): autoryzacja i ochrona endpointów, tokeny dostępowe.
  - Przykład: JWT w [backend/auth.py](backend/auth.py#L1) i zależność `get_current_user`.

Ocena 5.0 (Bardzo dobry)
- Unit Testy: testy automatyczne pokrywające kluczowe scenariusze.
  - Przykład: testy integracyjne i jednostkowe w `backend/tests/` uruchamiane `pytest`.
- Events LUB Kolejki (Rabbit/Kafka): asynchroniczne zadania / komunikacja między komponentami (alternatywnie background tasks).
  - Przykład: background task przeliczający statystyki w [backend/routers/solves.py](backend/routers/solves.py#L1). (Brak zewnętrznej kolejki, ale mechanizm asynchroniczny jest obecny.)
- Czysty kod: czytelna organizacja, nazwy, brak duplications, separacja warstw.
  - Przykład: modularna struktura `models` / `services` / `routers` i czytelne schematy.
- Frontend: prosta aplikacja Angular konsumująca API i prezentująca podstawowe widoki.
  - Przykład: aplikacja w folderze [frontend](frontend) korzystająca z endpointów API
