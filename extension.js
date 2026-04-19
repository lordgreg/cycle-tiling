import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

import * as Main from "resource:///org/gnome/shell/ui/main.js";
import Shell from "gi://Shell";
import Meta from "gi://Meta";

const STEPS = [0.25, 0.33, 0.5];

export default class CycleTilingExtension extends Extension {
  constructor(metadata) {
    super(metadata);

    this._windowStates = new Map();
    this._bindings = [];
  }

  enable() {
    this._settings = this.getSettings();

    console.log("[Cycle-Tiling] enabled");

    this._bind("cycle-tiling-left", () => this._cycle("left"));
    this._bind("cycle-tiling-right", () => this._cycle("right"));
    this._bind("cycle-tiling-maximize", () => this._maximize());
    this._bind("cycle-tiling-restore", () => this._restore());
  }

  disable() {
    for (const name of this._bindings) {
      console.log(`[Cycle-Tiling] Removing ${name} from stack.`);
      Main.wm.removeKeybinding(name);
    }

    this._bindings = [];
    this._windowStates.clear();

    console.log("[Cycle-Tiling] disabled");
  }

  // ----------------------------
  // KEYBINDINGS (GNOME 49 SAFE)
  // ----------------------------

  _bind(name, handler) {
    Main.wm.addKeybinding(
      name,
      this._settings,
      Meta.KeyBindingFlags.NONE,
      Shell.ActionMode.NORMAL,
      () => {
        try {
          handler();
        } catch (e) {
          console.error(`[Cycle-Tiling] failed binding ${name}:`, e);
        }
      },
    );

    console.log(`[Cycle-Tiling] Adding ${name} to stack.`);
    this._bindings.push(name);
  }

  // ----------------------------
  // WINDOW LOGIC
  // ----------------------------

  _getWindow() {
    return global.display.get_focus_window();
  }

  _cycle(direction) {
    const win = this._getWindow();
    if (!win) {
      console.log(`[Cycle-Tiling] Cannot get active window.`);
      return;
    }
    console.log(`[Cycle-Tiling] ${direction} called for ${win}.`);

    let state = this._windowStates.get(win) || {
      direction,
      step: -1,
    };

    if (state.direction !== direction) {
      state.direction = direction;
      state.step = -1;
    }

    if (state.step + 1 >= STEPS.length || state.step < 0) {
      state.step = 0;
    } else {
      state.step = state.step + 1;
    }

    const ratio = STEPS[state.step];
    this._tile(win, direction, ratio);

    this._windowStates.set(win, state);

    console.log(`[Cycle-Tiling] ${direction} → ${ratio}`);
  }

  _tile(win, direction, ratio) {
    const monitor = win.get_monitor();
    const workspace = global.workspace_manager.get_active_workspace();
    const workArea = workspace.get_work_area_for_monitor(monitor);

    let x = workArea.x;
    let y = workArea.y;

    const width = Math.floor(workArea.width * ratio);
    const height = workArea.height;

    if (direction === "right") {
      x = workArea.width - width;
    }

    console.log(
      `[Cycle-Tiling] ${direction}: (${workArea.width}x${workArea.height}) ${x} ${y} ${width} ${height}`,
    );

    win.unmaximize();

    win.move_resize_frame(true, x, y, width, height);
  }

  _maximize() {
    const win = this._getWindow();
    if (!win) return;

    win.maximize();
  }

  _restore() {
    const win = this._getWindow();
    if (!win) return;

    win.unmaximize();
  }
}
