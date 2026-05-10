NAME=cycle-tiling
DOMAIN=lordgreg
ZIP=dist/$(NAME)@$(DOMAIN).zip

.PHONY: all pack install clean

all: dist/extension.js

node_modules/.modules.yaml: package.json
	pnpm install

dist/extension.js dist/prefs.js: node_modules/.modules.yaml src/*.ts
	pnpm run build

schemas/gschemas.compiled: schemas/org.gnome.shell.extensions.$(NAME).gschema.xml
	glib-compile-schemas schemas

$(ZIP): dist/extension.js dist/prefs.js schemas/gschemas.compiled
	@cp -r schemas dist/
	@cp metadata.json dist/
	@(cd dist && zip ../$(ZIP) -9 extension.js prefs.js metadata.json schemas)

pack: $(ZIP)

install: $(ZIP)
	gnome-extensions install --force $(ZIP)

clean:
	@rm -rf dist node_modules
