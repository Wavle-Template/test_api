# 빌드용
FROM node:16-alpine
WORKDIR /build

## 파일 복사
COPY .npmrc .
COPY nest-cli.json .
COPY package.json .
COPY tsconfig.build.json .
COPY tsconfig.json .
COPY yarn.lock .

## 의존성 패키지 설치
RUN yarn

## 소스 복사
COPY src ./src

## 빌드
RUN yarn build

## 불필요한 node_modules 제거
RUN yarn install --production

# 실행용
FROM node:16-alpine
WORKDIR /app

## 서버 실행에 필요한 파일만 이동
COPY --from=0 /build/package.json .
COPY --from=0 /build/node_modules ./node_modules
COPY --from=0 /build/dist ./dist

EXPOSE 3000
CMD [ "yarn", "start:prod" ]
