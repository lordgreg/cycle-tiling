# Automatically extract the UUID from metadata.json
UUID = $(shell grep -Po '(?<="uuid": ")[^"]*' metadata.json)
NAME = cycle-tiling
ZIP_NAME = $(DIST_DIR)/$(NAME).shell-extension.zip
INSTALL_DIR = $(HOME)/.local/share/gnome-shell/extensions/$(UUID)

.PHONY: all build install uninstall clean enable disable

all: build

build: clean
	@mkdir -p dist
	@echo "Compiling schemas..."
	glib-compile-schemas schemas/
	@echo "Packing extension into $(ZIP_NAME)..."
	zip -r dist/$(UUID).shell-extension.zip metadata.json extension.js prefs.js schemas/*.xml

install: schema
	@mkdir -p $(dir $(INSTALL_DIR))
	@if [ -L "$(INSTALL_DIR)" ]; then \
		@echo "Symlink exists, removing."; \
		rm "$(INSTALL_DIR)"; \
	elif [ -d "$(INSTALL_DIR)" ]; then \
		@echo "Extension $(UUID) is already installed. Uninstalling first..."; \
		$(MAKE) uninstall; \
	fi

	@echo "Symlinking extension to $(INSTALL_DIR)..."
	ln -s "$(CURDIR)" "$(INSTALL_DIR)"
	
	@echo "Re-logging may be required to see the extension in the list of installed extensions."
	@echo "Use 'make enable' to enable the extension afterwards."

uninstall:
	@echo "Uninstalling $(UUID)..."
	rm -rf "$(INSTALL_DIR)"

clean:
	@echo "Cleaning up..."
	rm -rf dist
	rm -f schemas/gschemas.compiled

schema:
	@echo "Compiling schemas..."
	glib-compile-schemas schemas/

enable:
	@echo "Enabling $(UUID)..."
	gnome-extensions enable $(UUID)

disable:
	@echo "Disabling $(UUID)..."
	gnome-extensions disable $(UUID)

debug:
	@echo "Start local gnome environment..."
	dbus-run-session gnome-shell --devkit --wayland

log:
	@echo "Showing logs for $(UUID)..."
	journalctl /usr/bin/gnome-shell -f