FROM ymuski/curl-http3:latest
ENV PYTHONUNBUFFERED=1
WORKDIR /app

COPY requirements.txt .
RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
RUN python3 get-pip.py --break-system-packages --root-user-action ignore
RUN pip3 install --no-cache-dir --break-system-packages --root-user-action ignore -r requirements.txt

EXPOSE 8082

CMD ["python3", "main.py"]