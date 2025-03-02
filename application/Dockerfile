FROM python:3.10-slim
ENV PYTHONUNBUFFERED=1
WORKDIR /app

COPY *.pem .
COPY requirements.txt .
RUN pip install --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org --no-cache-dir -r requirements.txt

EXPOSE 4433

CMD ["hypercorn", "app.main:app", "-c", "hypercorn_config.toml","--reload"]