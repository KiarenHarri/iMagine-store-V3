# FRONTEND IMAGE — builds the React app, then serves it with nginx.
# Stage 1: build the static site
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
# Empty backend URL = the browser calls /api on the SAME domain,
# and nginx (stage 2) forwards those calls to the backend container.
ENV REACT_APP_BACKEND_URL=""
RUN yarn build

# Stage 2: serve the built site + proxy /api to the backend
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
