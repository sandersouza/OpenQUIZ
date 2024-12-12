# OpenQUIZ Game API 🎮
Create your own QUIZ server game with a simple management API. This project is in an early stage and can be an Open Source alternative to other QUIZ team games like Kahoot. This is a new version refactored to simplify the structure of Rest API, Routes and endpoints and many more other simplified schemes to speedup, and make this API 100% compliance with OpenAPI Specifications.

In time...I change from old loved Flask RestAPI, to FastAPI + Hypercorn framework and support to HTTP/3 and QUIC with Python aioquic library. FastAPI is a framework with high performance, easy to learn, fast to code, ready for production 🚀

## Technologies 🖨️
- 🖥️ Docker Container
- 💾 MongoDB ( Data Persist )
- 🐍 Python w/ FastAPI ( Support to HTTP/3 and QUIC )
- 🌐 HTML 3.0 and CSS ( Frontend )
- 🧪 Maybe... RabbitMQ ( Queue )

## In development 🪒
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

## Setup Instructions 🛠️
```bash
### Build the stack and be happy 🎉
$ docker compose -up -d --build
```

## How can I test? 🧪
```txt
At this time no one update yours API Test tools ( like postman or insomnia ), to support HTTP/3 or QUIC. Then... use everything UI you want, I preffer Postman, and put into root of this repo, a Postman Collection with all you need.

"And All You need is Love" ❤️ - Lenon. John

But... if you wanna make great tests in shell, use CURL with --http3 support! read more around the internet, how can you install it for your OS.

Above, endpoint, routes and payloads to testing.
```


## Create a Quiz 🎲
```txt
Method  : { POST }
Endpoint: https://{server}/quizzes/
Request Body ↓↓↓
```
```json
{
    "name": "Quiz Example",
    "questions": [
        {
            "question_text": "What is FastAPI?",
            "points": 100,
            "answers": [
                {
                    "answer_text": "The ONE! Fastest API Rest Framework",
                    "is_correct": true
                },
                {
                    "answer_text": "An generic API Rest Framework",
                    "is_correct": false
                }
            ]
        }
    ]
}
```

## List Quizzes 🔎
```txt
Method  : { GET }
Endpoint: https://{server}/quizzes/
```

## Edit a Quiz ✂️
```txt
Method  : { PUT }
Endpoint: https://{server}/quizzes/{id}
Request Body↓↓↓
```
```json
{
    "name": "Quiz Example",
    "questions": [
        {
            "question_text": "FastAPI or Flask RestAPI?",
            "points": 100,
            "answers": [
                {
                    "answer_text": "Both are an good choice!",
                    "is_correct": false
                },
                {
                    "answer_text": "But... FastAPI is FAST!",
                    "is_correct": true
                }
            ]
        }
    ]
}
  ```

## Delete a Quiz 🧨
```txt
Method  : { DEL }
Endpoint: https://{server}/quizzes/{id}
```