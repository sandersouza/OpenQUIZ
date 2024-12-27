FROM ymuski/curl-http3:latest
ENV PYTHONUNBUFFERED=1
WORKDIR /app

COPY requirements.txt .
# RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
RUN python3 get-pip.py --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org --break-system-packages --root-user-action ignore
RUN pip install --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org --no-cache-dir -r requirements.txt

EXPOSE 8082

CMD ["python3", "main.py"]