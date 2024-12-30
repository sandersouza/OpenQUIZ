FROM alpine/curl-http3:latest
ENV PYTHONUNBUFFERED=1
WORKDIR /app

COPY requirements.txt .

USER root
RUN apk add python3 && apk add py3-pip
RUN pip install --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org --break-system-packages --no-cache-dir -r requirements.txt

EXPOSE 8082

CMD ["python3", "main.py"]