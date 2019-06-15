FROM node:12-alpine

RUN apk update \
    && apk upgrade \
    && apk add bash curl gnupg \
    && curl -o- -L https://yarnpkg.com/install.sh | bash \
    && apk del bash curl gnupg

ENV NODE_ENV production

WORKDIR /app

COPY package.json .
COPY yarn.lock .
RUN yarn \
    && yarn cache clean

COPY .babelrc .
COPY tsconfig.json .
COPY src ./src
RUN yarn build

VOLUME /app/env/api-keys.json

CMD yarn start:production
