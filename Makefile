install:
	npm install

uninstall:
	npm uninstall

test:
	npm run test

lint:
	ejslint .\pages\

server:
	node --env-file=.env indito.js
