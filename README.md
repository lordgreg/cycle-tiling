# Helping develop

> Maybe it would be wise to read the (GNOME Extension Development)[https://gjs.guide/extensions/development/creating.html].

## Testing locally

1. Create a symlink

```bash
ln -s . ~/.local/share/gnome-shell/extensions/cycle-tiling@lordgreg/
```

2. Updating schema

```bash
glib-compile-schemas schemas/
```

3. Execute local gnome vm

```bash
dbus-run-session gnome-shell --devkit --wayland

# within, enable extension
gnome-extensions enable cycle-tiling@lordgreg
```
