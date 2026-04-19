import Adw from "gi://Adw";
import Gtk from "gi://Gtk";
import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class CycleTilingPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    this._settings = this.getSettings();

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

  _createSwitch(title, key) {
    const row = new Adw.ActionRow({ title });

    const toggle = new Gtk.Switch({
      active: this._settings.get_boolean(key),
      valign: Gtk.Align.CENTER,
    });

    toggle.connect("notify::active", () => {
      this._settings.set_boolean(key, toggle.active);
      console.log(`[Cycle-Tiling] updated ${key} with ${toggle.active}`);
    });

    row.add_suffix(toggle);
    row.activatable_widget = toggle;

    return row;
  }

  _createEntry(title, key) {
    const row = new Adw.ActionRow({ title });

    const entry = new Gtk.Entry({
      text: this._settings.get_string(key),
      valign: Gtk.Align.CENTER,
      width_chars: 4,
    });

    entry.connect("changed", () => {
      if (!entry.text) return;
      this._settings.set_string(key, entry.text);
      console.log(`[Cycle-Tiling] updated ${key} with ${entry.text}`);
    });

    row.add_suffix(entry);
    row.activatable_widget = entry;

    return row;
  }
}
