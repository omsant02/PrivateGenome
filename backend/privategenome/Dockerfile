FROM python:3.13.3-slim
WORKDIR /app
# Install build tools and libraries for pandas/numpy
RUN apt-get update && apt-get install -y gcc g++ build-essential
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENTRYPOINT ["python3", "/app/src/app.py"]
