# cycle-tiling Gnome Extension

This extension overwrites the default Gnome default Super + Left/Right/Up/Down keybinds so that a user has more size settings to cycle through when using Left/Right. You know Rectangle for Mac? Well, that's basically it, but for Gnome! :)

Any good suggestions can be added to the issues, I will try to get to those as soon as possible :)

# Developing

> I tried to understand how to develop an extension reading through (GNOME Extension Development)[https://gjs.guide/extensions/development/creating.html]. I suggest you do that too.

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

# or disable, if you require to do so
gnome-extensions enable cycle-tiling@lordgreg
```
