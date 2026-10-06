FROM python:3.14-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    EMBEDDING_STORE_PATH=/data/animals.sqlite3 \
    OPENBLAS_NUM_THREADS=1 \
    OMP_NUM_THREADS=1
COPY backend/requirements-demo.txt backend/requirements-demo.txt
RUN pip install --no-cache-dir -r backend/requirements-demo.txt
COPY backend/app backend/app
COPY backend/demo backend/demo
COPY backend/gunicorn.conf.py backend/gunicorn.conf.py
CMD ["gunicorn", "--config", "backend/gunicorn.conf.py", "backend.demo.app:create_app()"]
