FROM python:3.9

WORKDIR /code

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Hugging Face Spaces menggunakan port 7860
CMD ["gunicorn", "-b", "0.0.0.0:7860", "app:app"]
