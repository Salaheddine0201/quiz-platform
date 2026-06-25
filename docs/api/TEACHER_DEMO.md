# Teacher API — Demo copy-paste guide

Use this during your demo. Run requests **in order**.

**Base URL:** `http://localhost:8000/api`  
**Before starting:** `php artisan serve` + `php artisan migrate:fresh --seed`

---

## Setup in Postman (once)

1. Import `Quiz-Platform.postman_collection.json` (optional)
2. Or create a new request each time using the blocks below
3. For every request **after login**, add header:

```
Authorization: Bearer PASTE_YOUR_TOKEN_HERE
Accept: application/json
```

4. For POST/PUT, also add:

```
Content-Type: application/json
```

---

## 0) LOGIN — get your token first

**POST** `http://localhost:8000/api/login`

**Body (raw JSON):**
```json
{
  "email": "prof@quizmaster.com",
  "password": "Password1"
}
```

**Copy from response:** `token` → use it in `Authorization: Bearer ...` for all next requests.

---

## 1) Dashboard — overview stats

**GET** `http://localhost:8000/api/teacher/dashboard`

No body.

**Demo point:** shows quiz count, assigned students, completed sessions, recent results.

---

## 2) List all teacher quizzes

**GET** `http://localhost:8000/api/teacher/quizzes`

No body.

**Demo point:** 3 seeded quizzes (Maths, Physique, Histoire) + any you create.

---

## 3) Create a new quiz

**POST** `http://localhost:8000/api/teacher/quizzes`

**Body:**
```json
{
  "title": "Démo PFE — Quiz Laravel",
  "description": "Quiz créé en live pendant la soutenance",
  "duration_minutes": 20,
  "expires_at": "2026-12-31T23:59:59",
  "grading_system": "standard"
}
```

**Copy from response:** `quiz.id` → use as `QUIZ_ID` below (probably `4` after seed).

---

## 4) Show quiz detail (before questions)

**GET** `http://localhost:8000/api/teacher/quizzes/4`

Replace `4` with your `QUIZ_ID`.

**Demo point:** quiz metadata, empty `questions` array.

---

## 5) Add question #1 (with 4 answers)

**POST** `http://localhost:8000/api/teacher/quizzes/4/questions`

Replace `4` with your `QUIZ_ID`.

**Body:**
```json
{
  "text_content": "Quelle commande lance le serveur Laravel ?",
  "points": 5,
  "penalty_points": 0,
  "answers": [
    { "text_content": "php artisan serve", "is_correct": true },
    { "text_content": "npm run dev", "is_correct": false },
    { "text_content": "composer start", "is_correct": false },
    { "text_content": "laravel run", "is_correct": false }
  ]
}
```

**Copy from response:** `question.id` → `QUESTION_ID`

---

## 6) Add question #2 (système canadien / pénalités)

**POST** `http://localhost:8000/api/teacher/quizzes/4/questions`

**Body:**
```json
{
  "text_content": "Quel ORM utilise Laravel ?",
  "points": 5,
  "penalty_points": 2,
  "answers": [
    { "text_content": "Eloquent", "is_correct": true },
    { "text_content": "Doctrine", "is_correct": false },
    { "text_content": "Sequelize", "is_correct": false }
  ]
}
```

---

## 7) Update quiz metadata

**PUT** `http://localhost:8000/api/teacher/quizzes/4`

**Body:**
```json
{
  "title": "Démo PFE — Quiz Laravel (modifié)",
  "description": "Description mise à jour en live",
  "duration_minutes": 25,
  "grading_system": "canadien"
}
```

**Demo point:** teacher can edit quiz settings after creation.

---

## 8) Update a question

**PUT** `http://localhost:8000/api/teacher/questions/1`

Replace `1` with your `QUESTION_ID`.

**Body:**
```json
{
  "text_content": "Quelle commande démarre le serveur de développement Laravel ?",
  "points": 6,
  "penalty_points": 1
}
```

---

## 9) Add one more answer to a question

**POST** `http://localhost:8000/api/teacher/questions/1/answers`

Replace `1` with your `QUESTION_ID`.

**Body:**
```json
{
  "text_content": "php -S localhost:8000",
  "is_correct": false
}
```

**Copy from response:** `answer.id` → `ANSWER_ID`

---

## 10) Update an answer

**PUT** `http://localhost:8000/api/teacher/answers/1`

Replace `1` with your `ANSWER_ID`.

**Body:**
```json
{
  "text_content": "php artisan serve ✅",
  "is_correct": true
}
```

---

## 11) Show quiz — full content with questions & answers

**GET** `http://localhost:8000/api/teacher/quizzes/4`

**Demo point:** teacher sees `is_correct` on each answer (students never do).

---

## 12) Search students to assign

**GET** `http://localhost:8000/api/teacher/students?search=sophie&quiz_id=4`

Replace `4` with your `QUIZ_ID`.

**Demo point:** finds Sophie Martin, excludes already-assigned students.

---

## 13) Assign quiz to student

**POST** `http://localhost:8000/api/teacher/quizzes/4/assignments`

**Body:**
```json
{
  "user_ids": [2]
}
```

`2` = Sophie Martin (étudiant du seeder).

**Demo point:** quiz must have at least 1 question before assign.

---

## 14) List assigned students

**GET** `http://localhost:8000/api/teacher/quizzes/4/assignments`

**Demo point:** shows who received the quiz.

---

## 15) View all sessions on seeded quiz (existing results)

**GET** `http://localhost:8000/api/teacher/quizzes/3/sessions`

Quiz `3` = Histoire (has 1 completed session after seed).

**Demo point:** stats + list of student attempts with scores.

---

## 16) View session detail (student answers)

**GET** `http://localhost:8000/api/teacher/quizzes/3/sessions/1`

**Demo point:** per-question breakdown, correct/incorrect, full answer key.

---

## 17) Unassign a student (optional cleanup demo)

**DELETE** `http://localhost:8000/api/teacher/quizzes/4/assignments/2`

Removes student `2` from quiz `4`.

---

## 18) Delete demo quiz (optional cleanup)

**DELETE** `http://localhost:8000/api/teacher/quizzes/4`

Only if you want to clean up the quiz you created during demo.

---

# Quick reference — all teacher endpoints

| # | Method | URL |
|---|--------|-----|
| 1 | GET | `/teacher/dashboard` |
| 2 | GET | `/teacher/quizzes` |
| 3 | POST | `/teacher/quizzes` |
| 4 | GET | `/teacher/quizzes/{quiz}` |
| 5 | PUT | `/teacher/quizzes/{quiz}` |
| 6 | DELETE | `/teacher/quizzes/{quiz}` |
| 7 | POST | `/teacher/quizzes/{quiz}/questions` |
| 8 | PUT | `/teacher/questions/{question}` |
| 9 | DELETE | `/teacher/questions/{question}` |
| 10 | POST | `/teacher/questions/{question}/answers` |
| 11 | PUT | `/teacher/answers/{answer}` |
| 12 | DELETE | `/teacher/answers/{answer}` |
| 13 | GET | `/teacher/students?search=&quiz_id=` |
| 14 | GET | `/teacher/quizzes/{quiz}/assignments` |
| 15 | POST | `/teacher/quizzes/{quiz}/assignments` |
| 16 | DELETE | `/teacher/quizzes/{quiz}/assignments/{user}` |
| 17 | GET | `/teacher/quizzes/{quiz}/sessions` |
| 18 | GET | `/teacher/quizzes/{quiz}/sessions/{session}` |

---

# Suggested live demo script (5 min)

1. **Login** → show token
2. **Dashboard** → stats + recent session (Histoire)
3. **Create quiz** → new quiz id
4. **Add 2 questions** → show validation (min 2 answers, 1 correct)
5. **Show quiz** → full structure with correct answers
6. **Search students** → find Sophie
7. **Assign** → link quiz to student
8. **Sessions on quiz 3** → show completed attempt + score
9. **Session detail** → show question-by-question results

---

# Test accounts

| Role | Email | Password |
|------|-------|----------|
| Enseignant | prof@quizmaster.com | Password1 |
| Étudiant | etudiant@quizmaster.com | Password1 |
