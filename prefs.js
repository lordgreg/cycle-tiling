import Adw from "gi://Adw";
import Gtk from "gi://Gtk";
import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class CycleTilingPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const page = new Adw.PreferencesPage();
    window.add(page);

    const group_init = new Adw.PreferencesGroup({
      title: "Cycle Tiling",
    });

    page.add(group_init);

    const thankYouRow = new Adw.ActionRow({
      title: "Thank you for using the extension! 🍻",
    });
    group_init.add(thankYouRow);

    const group_keybinds = new Adw.PreferencesGroup({
      title: "Default Keybinds",
    });

    const keybinds = [
      { action: "Cycle Left", keys: "Super+Left, Alt+Shift+q" },
      { action: "Cycle Right", keys: "Super+Right, Alt+Shift+r" },
      { action: "Maximize", keys: "Super+Up, Alt+Shift+w" },
      { action: "Restore", keys: "Super+Down, Alt+Shift+e" },
    ];
    for (const kb of keybinds) {
      group_keybinds.add(
        new Adw.ActionRow({ title: kb.action, subtitle: kb.keys }),
      );
    }

    page.add(group_keybinds);
  }
}
