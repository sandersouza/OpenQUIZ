# OpenQUIZ API
A simple quiz management API.

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

## Examples
Using `curl`:
```bash
curl -X POST -H "Content-Type: application/json" -d '{"name": "Math Quiz"}' http://localhost:5001/quizzes
curl -X GET http://localhost:5001/quizzes
curl -X PUT -H "Content-Type: application/json" -d '{"name": "Updated Quiz Name"}' http://localhost:5001/quizzes/1
curl -X DELETE http://localhost:5001/quizzes/1
```