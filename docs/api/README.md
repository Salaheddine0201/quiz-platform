# Quiz Platform — API Testing

## Postman

Import the collection:

**File:** `Quiz-Platform.postman_collection.json`  
**Alternate name (same file):** `quiz-platform.postman_collection.json`

### Import steps

1. Open Postman (desktop app recommended)
2. Click **Import** (top-left)
3. Drag the `.json` file **or** click **Upload Files** and select it from:
   ```
   quiz-platform/docs/api/Quiz-Platform.postman_collection.json
   ```
4. Confirm import — you should see **Quiz Platform API** collection
5. Start the backend: `cd backend && php artisan serve`
6. Seed data (optional): `php artisan migrate:fresh --seed`
7. Run **Auth → Login (Enseignant)** or **Login (Étudiant)**
   - The `token` variable is set automatically
8. Call any Teacher or Student request

### Import not working?

| Problem | Fix |
|---------|-----|
| Nothing happens on import | Use **Postman desktop** (not browser preview of the file) |
| "Invalid format" | Re-download the file from `docs/api/` — do not copy-paste JSON into a `.txt` file |
| File not found | Full path: `Desktop/PFE/quiz-platform/docs/api/Quiz-Platform.postman_collection.json` |
| Collection empty | Click the collection → **Variables** tab → set `baseUrl` |
| 401 on requests | Run **Login** first, then check `token` variable is filled |

**Manual import:** Postman → Import → **Raw text** → paste the full JSON file contents.

### Collection variables

| Variable | Default | Description |
|----------|---------|-------------|
| `baseUrl` | `http://localhost:8000/api` | API base URL |
| `token` | *(empty)* | Sanctum token (auto-set on login) |
| `quiz_id` | `1` | Quiz ID for path params |
| `question_id` | `1` | Question ID |
| `answer_id` | `1` | Answer ID |
| `session_id` | `1` | Quiz session ID |
| `student_user_id` | `2` | Student user ID (seeder) |

Edit variables: collection → **Variables** tab.

### Test accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Enseignant | prof@quizmaster.com | Password1 |
| Étudiant | etudiant@quizmaster.com | Password1 |

### Suggested teacher flow

1. Login (Enseignant)
2. Dashboard
3. Create Quiz → `quiz_id` updated automatically
4. Add Question (with answers)
5. Assign Students
6. List Quiz Sessions (use `quiz_id=3` after seed for existing results)
