FROM node:18.15-alpine
ARG NPM_TOKEN
WORKDIR /app
COPY . .
RUN echo -e "\n//npm.pkg.github.com/:_authToken=$NPM_TOKEN" >> .npmrc
RUN yarn
RUN yarn build
# RUN yarn install --production

FROM node:18.15-alpine
ARG NPM_TOKEN
# ENV NODE_ENV=production

WORKDIR /app
COPY --from=0 /app/package.json .
COPY --from=0 /app/yarn.lock .
# COPY --from=0 /app/assets ./assets
# COPY --from=0 /app/views ./views
COPY --from=0 /app/node_modules ./node_modules
# COPY .npmrc .
COPY --from=0 /app/dist ./dist
COPY --from=0 /app/apps ./apps
COPY --from=0 /app/libs ./libs
# COPY --from=0 /app/database ./database

# RUN ["yarn", "--prod"]
RUN ["mkdir", "upload"]
RUN ["mkdir", "assets"]

VOLUME ["/app/upload"]
VOLUME ["/app/assets"]
# VOLUME ["/app/logs"]
EXPOSE 3000
CMD [ "yarn", "start:prod" ]
# CMD [ "yarn", "start:prod"]