# OpenQUIZ Game API
Create your owner QUIZ server game with a simple management API. This project stay in early state, and can be a Open Source alternative to others QUIZ team games like Kahoot.

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
    - Prefered Themes
    - About ME
    - Social Media Share
  - Game Community
    - Friend List
    - Random QUIZZES
  - Score board for played QUIZZES
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

### 3. Edit a Quiz
**PUT** `/quizzes/<id>`
- Body:
  ```json
  {
      "name": "Updated Quiz Name"
  }
  ```

### 4. Delete a Quiz
**DELETE** `/quizzes/<id>`

### 5. Create questions and responses
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

## Examples
Using `curl`:
```bash
# Create QUIZ
curl -X POST -H "Content-Type: application/json" -d '{"name": "Math Quiz"}' http://localhost:5001/quizzes

# List QUIZZES
curl -X GET http://localhost:5001/quizzes

# Update QUIZ ( where {id} = QUIZ ID )
curl -X PUT -H "Content-Type: application/json" -d '{"name": "Updated Quiz Name"}' http://localhost:5001/quizzes/{id}

# Delete QUIZ ( where {id} = QUIZ ID )
curl -X DELETE http://localhost:5001/quizzes/1

# Add question and answers into a existent QUIZ
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
```