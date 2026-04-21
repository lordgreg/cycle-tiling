# cycle-tiling Gnome Shell Extension

## Demo

https://github.com/user-attachments/assets/40ceaf39-9fc7-4a2f-95a3-1dad38152d2d

## About

This extension overwrites the default Gnome default Super + Left/Right/Up/Down keybinds so that a user has more size settings to cycle through when using Left/Right. You know Rectangle for Mac? Well, that's basically it, but for Gnome! :)

Any good suggestions can be added to the issues, I will try to get to those as soon as possible :)

# Developing

I tried to understand how to develop an extension reading through [GNOME Extension Development](https://gjs.guide/extensions/development/creating.html). It explains the basics and how to get starting. Everyhing else is just javascript :)

## Testing locally

```bash
# Install extension (creates symlink and compiles schema)
make install

# Compile schema only
make schema

# Start local gnome environment
make debug
# within, enable extension
make enable
```

Other make tasks are available and are self-explanatory :)
