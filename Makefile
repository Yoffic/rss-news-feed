install:
	npm install

develop:
	npx webpack-dev-server

build:
	rm -rf public
	NODE_ENV=production npx webpack
	now --prod

lint:
	npx eslint .

publish:
	npm publish

.PHONY: test