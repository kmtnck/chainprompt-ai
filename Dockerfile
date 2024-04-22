FROM node:20.11.0-alpine3.18

# Upgrade packages
RUN apk --no-cache --update --available upgrade
RUN apk --no-cache add --virtual builds-deps build-base python3
RUN apk add --no-cache make gcc g++

# Changing working dir
WORKDIR /usr/app
ADD package*.json ./
RUN npm update && npm upgrade && npm install

# Copy app to working dir
COPY . .