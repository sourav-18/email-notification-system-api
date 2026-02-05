FROM node:24.13.0

WORKDIR /server

RUN npm install pm2 -g

COPY package-lock.json /server/package-lock.json
COPY package.json /server/package.json

RUN npm install

COPY . /server/



EXPOSE 5000

CMD ["pm2-runtime", "start", "pm2.config.js"]