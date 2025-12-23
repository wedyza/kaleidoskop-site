FROM python:3.13-slim

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc g++ make \
        libglib2.0-0 libsm6 libxext6 libxrender-dev \
        libgl1-mesa-glx libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r /code/requirements.txt

RUN pip install -r /code/requirements.txt

COPY ./app /code/app