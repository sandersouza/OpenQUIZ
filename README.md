# OpenQUIZ Game API
Create your own QUIZ server game with a simple management API. This project is in an early stage and can be an Open Source alternative to other QUIZ team games like Kahoot.

## Technologies
- Docker Container
- MySQL ( Data Persist )
- Redis ( Fast Memory DB )
- Python w/ Flask ( Rest API )
- HTML 3.0 and CSS ( Frontend )
- NGINX / QUIC ( Fast Response )
- Maybe... RabbitMQ ( Queue )

## In development:
- Frontend for Admin
- Frontend for Logged Players
  - Player Profile
    - Preferred Themes
    - About Me
    - Social Media Share
  - Game Community
    - Friend List
    - Random QUIZZES
  - Scoreboard for played QUIZZES
  - Random Create Trivias
- Frontend for Ephemeral Players
- OAUTH / SSO Login with Google

## Setup Instructions
1. Build the containers:
   ```bash
   docker-compose build
   ```

2. Start the containers:
   ```bash
   docker-compose up
   ```

## API Endpoints
### 1. Create a Quiz
**POST** `/quizzes`
- Body:
  ```json
  {
      "name": "Quiz Name"
  }
  ```

### 2. List Quizzes
**GET** `/quizzes`

### 3. Get a Quiz with Questions and Answers
**GET** `/quizzes/<id>`

### 4. Edit a Quiz
**PUT** `/quizzes/<id>`
- Body:
  ```json
  {
      "name": "Updated Quiz Name"
  }
  ```

### 5. Delete a Quiz
**DELETE** `/quizzes/<id>`

### 6. Create Questions and Answers
**POST** `/questions`
- Body:
  ```json
  {
    "quiz_id": 1,
    "question_text": "What is the capital of France?",
    "points": 100,
    "answers": [
        {"answer_text": "Paris", "is_correct": true},
        {"answer_text": "London", "is_correct": false},
        {"answer_text": "Rome", "is_correct": false},
        {"answer_text": "Berlin", "is_correct": false}
    ]
  }
  ```

### 7. List Questions by Quiz
**GET** `/questions/<quiz_id>`

### 8. Update a Question and Answers
**PUT** `/questions/<question_id>`
- Body:
  ```json
  {
    "question_text": "Updated: What is the capital of France?",
    "points": 200,
    "answers": [
        {"id": 14, "answer_text": "London", "is_correct": true},
        {"answer_text": "Tokyo", "is_correct": false}
    ]
  }
  ```
#### **Comportamento da Rota:**
- **Atualizar Respostas:**
  - Se uma resposta contém o campo `id`, ela será atualizada no banco.
- **Adicionar Novas Respostas:**
  - Respostas sem `id` serão adicionadas como novas no banco.
- **Remover Respostas:**
  - Respostas existentes no banco, mas ausentes no corpo da requisição, serão removidas.

### 9. Delete a Question
**DELETE** `/questions/<question_id>`

---

## Examples
Using `curl`:
```bash
# Create QUIZ
curl -X POST -H "Content-Type: application/json" -d '{"name": "Math Quiz"}' http://localhost:5001/quizzes

# List QUIZZES
curl -X GET http://localhost:5001/quizzes

# Get QUIZ Details
curl -X GET http://localhost:5001/quizzes/1

# Update QUIZ ( where {id} = QUIZ ID )
curl -X PUT -H "Content-Type: application/json" -d '{"name": "Updated Quiz Name"}' http://localhost:5001/quizzes/{id}

# Delete QUIZ ( where {id} = QUIZ ID )
curl -X DELETE http://localhost:5001/quizzes/1

# Add question and answers into an existing QUIZ
curl -X POST -H "Content-Type: application/json" -d '{
    "quiz_id": 1,
    "question_text": "What is the capital of France?",
    "points": 100,
    "answers": [
        {"answer_text": "Paris", "is_correct": true},
        {"answer_text": "London", "is_correct": false},
        {"answer_text": "Rome", "is_correct": false},
        {"answer_text": "Berlin", "is_correct": false}
    ]
}' http://localhost:5001/questions

# List Questions by Quiz
curl -X GET http://localhost:5001/questions/1

# Update a Question ( where {id} = Question ID )
curl -X PUT -H "Content-Type: application/json" -d '{
    "question_text": "Updated: What is the capital of France?",
    "points": 200,
    "answers": [
        {"id": 14, "answer_text": "London", "is_correct": true},
        {"answer_text": "Tokyo", "is_correct": false}
    ]
}' http://localhost:5001/questions/{id}

# Delete a Question ( where {id} = Question ID )
curl -X DELETE http://localhost:5001/questions/1
```