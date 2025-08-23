# Backend Dockerfile para The Wheel Screener
FROM python:3.11-slim

# Definir diretório de trabalho
WORKDIR /app

# Copiar requirements primeiro para aproveitar cache do Docker
COPY requirements.txt .

# Instalar dependências Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código fonte
COPY src/ ./src/

# Criar diretório para logs
RUN mkdir -p /app/logs

# Definir variáveis de ambiente
ENV FLASK_APP=src/main.py
ENV FLASK_ENV=production
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Expor porta
EXPOSE 5000

# Comando para iniciar a aplicação
CMD ["python", "src/main.py"]

