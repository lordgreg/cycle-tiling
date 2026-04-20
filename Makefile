# Automatically extract the UUID from metadata.json
UUID = $(shell grep -Po '(?<="uuid": ")[^"]*' metadata.json)
NAME = cycle-tiling
DIST_DIR = dist
ZIP_NAME = $(DIST_DIR)/$(NAME).shell-extension.zip

FILES = prefs.js extension.js metadata.json
SCHEMA_DIR = schemas
COMPILED_SCHEMA = $(SCHEMA_DIR)/gschemas.compiled

.PHONY: all build install uninstall clean enable disable

all: build

build:
	@mkdir -p $(DIST_DIR)
	@echo "Compiling schemas..."
	glib-compile-schemas $(SCHEMA_DIR)/
	@echo "Packing extension into $(ZIP_NAME)..."
	zip -r $(ZIP_NAME) $(FILES) $(SCHEMA_DIR)

install: build
	@echo "Installing $(UUID)..."
	gnome-extensions install --force $(ZIP_NAME)
	@echo "Re-logging may be required to see the extension in the list of installed extensions."

uninstall:
	@echo "Uninstalling $(UUID)..."
	gnome-extensions uninstall $(UUID)

clean:
	@echo "Cleaning up..."
	rm -rf $(DIST_DIR)
	rm -f $(COMPILED_SCHEMA)

enable:
	@echo "Enabling $(UUID)..."
	gnome-extensions enable $(UUID)

disable:
	@echo "Disabling $(UUID)..."
	gnome-extensions disable $(UUID)

debug:
	@echo "Start local gnome environment..."
	dbus-run-session gnome-shell --devkit --wayland