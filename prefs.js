import Adw from "gi://Adw";
import Gtk from "gi://Gtk";
import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class CycleTilingPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    this._settings = this.getSettings();

    const page = new Adw.PreferencesPage();
    window.add(page);

    const group = new Adw.PreferencesGroup({
      title: "Cycle Tiling Settings",
    });

    page.add(group);

    group.add(this._createEntry("Cycle-Left", "cycle-left"));
    group.add(this._createEntry("Cycle-Right", "cycle-right"));
    group.add(this._createEntry("Maximize", "maximize"));
    group.add(this._createEntry("Restore", "restore"));
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
