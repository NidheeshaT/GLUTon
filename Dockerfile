FROM ubuntu:22.04

WORKDIR /app
COPY . .

RUN apt update

RUN apt install -y python3
RUN python3 get-pip.py
RUN apt-get install -y gcc g++
RUN apt install -y freeglut3-dev libfreeimage-dev
RUN apt-get install -y xvfb
RUN pip install --no-cache-dir -r requirements.txt


EXPOSE 8000

CMD  gunicorn --bind 0.0.0.0:8000 "views:app" -w 4

