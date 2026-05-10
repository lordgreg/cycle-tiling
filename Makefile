NAME=cycle-tiling
DOMAIN=lordgreg

.PHONY: all pack install clean

all: dist/extension.js

node_modules/.modules.yaml: package.json
	pnpm install

dist/extension.js dist/prefs.js: node_modules/.modules.yaml src/*.ts
	pnpm run build

schemas/gschemas.compiled: schemas/org.gnome.shell.extensions.$(NAME).gschema.xml
	glib-compile-schemas schemas

$(NAME).zip: dist/extension.js dist/prefs.js schemas/gschemas.compiled
	@cp -r schemas dist/
	@cp metadata.json dist/
	@(cd dist && zip ../$(NAME).zip -9r .)

pack: $(NAME).zip

install: $(NAME).zip
	gnome-extensions install --force $(NAME).zip

clean:
	@rm -rf dist node_modules $(NAME).zip
