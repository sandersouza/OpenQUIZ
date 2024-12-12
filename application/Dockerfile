FROM python:3.10-slim
ENV PYTHONUNBUFFERED=1
WORKDIR /app

COPY *.pem .
COPY hypercorn_config.py .
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 4433

CMD ["hypercorn", "app.main:app", "-c", "hypercorn_config.py"]