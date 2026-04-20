import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

import * as Main from "resource:///org/gnome/shell/ui/main.js";
import Shell from "gi://Shell";
import Meta from "gi://Meta";
import Clutter from "gi://Clutter";
import Graphene from "gi://Graphene";

const STEPS = [0.25, 0.33, 0.5, 0.75, 0.83];

export default class CycleTilingExtension extends Extension {
  constructor(metadata) {
    super(metadata);

    this._windowStates = new Map();
    this._bindings = [];
    this._overriddenBindings = [];
  }

  enable() {
    this._settings = this.getSettings();

    console.log("[Cycle-Tiling] enabled");

    // override system defaults BEFORE adding custom keybindings
    this._bind_override_system("toggle-tiled-left", () => this._cycle("left"));
    this._bind_override_system("toggle-tiled-right", () =>
      this._cycle("right"),
    );
    this._bind_override_system("maximize", () => this._maximize());
    this._bind_override_system("unmaximize", () => this._restore());

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
    for (const name of this._overriddenBindings) {
      console.log(`[Cycle-Tiling] Removing overridden ${name} from stack.`);
      Meta.keybindings_set_custom_handler(name, null);
    }

    this._bindings = [];
    this._overriddenBindings = [];
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

  _bind_override_system(name, handler) {
    Meta.keybindings_set_custom_handler(name, () => {
      try {
        handler();
      } catch (e) {
        console.error(`[Cycle-Tiling] failed override binding ${name}:`, e);
      }
    });

    console.log(`[Cycle-Tiling] Adding ${name} to overridinen bindings.`);
    this._overriddenBindings.push(name);
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

    // initial state
    let state = this._initWindowState(win, direction);

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

  _initWindowState(win, direction) {
    if (!win) return;
    if (!direction) direction = "left";

    let state = this._windowStates.get(win);

    if (!state) {
      state = {
        direction,
        step: -1,
        size: win.get_frame_rect(),
      };

      this._windowStates.set(win, state);
    }

    return state;
  }

  _tile(win, direction, ratio, animate = true) {
    const monitor = win.get_monitor();
    const workspace = global.workspace_manager.get_active_workspace();
    const workArea = workspace.get_work_area_for_monitor(monitor);

    let x = workArea.x;
    let y = workArea.y;

    const width = Math.floor(workArea.width * ratio);
    const height = workArea.height;

    if (direction === "right") {
      x = workArea.x + workArea.width - width;
    }

    console.log(
      `[Cycle-Tiling] ${direction}: (${workArea.width}x${workArea.height}) ${x} ${y} ${width} ${height}`,
    );

    win.unmaximize();

    if (animate) {
      this._animateWindow(win, x, y, width, height);
    } else {
      win.move_frame(true, x, y);
      win.move_resize_frame(true, x, y, width, height);
    }
  }

  _animateWindow(win, targetX, targetY, targetWidth, targetHeight) {
    const actor = win.get_compositor_private();
    if (!actor) {
      win.move_frame(true, targetX, targetY);
      win.move_resize_frame(true, targetX, targetY, targetWidth, targetHeight);
      return;
    }

    const oldRect = win.get_frame_rect();
    const newX = targetX;
    const newY = targetY;
    const newW = targetWidth;
    const newH = targetHeight;

    const dx = Math.abs(oldRect.x - newX);
    const dy = Math.abs(oldRect.y - newY);
    const dw = Math.abs(oldRect.width - newW);
    const dh = Math.abs(oldRect.height - newH);

    if (dx < 2 && dy < 2 && dw < 2 && dh < 2) {
      win.move_frame(true, newX, newY);
      win.move_resize_frame(true, newX, newY, newW, newH);
      return;
    }

    const xShadow = oldRect.x - actor.get_x();
    const yShadow = oldRect.y - actor.get_y();

    actor.remove_all_transitions();

    let clone;
    const cloneX = oldRect.x - xShadow;
    const cloneY = oldRect.y - yShadow;
    const cloneW = oldRect.width + 2 * xShadow;
    const cloneH = oldRect.height + 2 * yShadow;

    try {
      clone = new Clutter.Clone({
        source: actor,
        reactive: false,
        pivot_point: new Graphene.Point({ x: 0.5, y: 0.5 }),
      });
      clone.set_position(cloneX, cloneY);
      clone.set_size(cloneW, cloneH);
      global.window_group.add_child(clone);
    } catch (_e) {
      win.move_frame(true, newX, newY);
      win.move_resize_frame(true, newX, newY, newW, newH);
      return;
    }

    actor.opacity = 0;

    win.move_frame(true, newX, newY);
    win.move_resize_frame(true, newX, newY, newW, newH);

    clone.ease({
      x: newX - xShadow,
      y: newY - yShadow,
      width: newW + 2 * xShadow,
      height: newH + 2 * yShadow,
      duration: 200,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      onStopped: () => {
        try {
          actor.opacity = 255;
          actor.scale_x = 1;
          actor.scale_y = 1;
          actor.translation_x = 0;
          actor.translation_y = 0;
        } catch (_e) {}
        try {
          clone.destroy();
        } catch (_e) {}
      },
    });
  }

  _maximize() {
    const win = this._getWindow();
    if (!win) return;
    if (win.is_maximized()) return;

    this._initWindowState(win);

    console.log(`[Cycle-Tiling] Maximizing`);

    win.maximize();
  }

  _restore() {
    const win = this._getWindow();
    if (!win) return;

    const state = this._windowStates.get(win);

    // no state, do a random size
    if (!state || !state.size) {
      const monitor = win.get_monitor();
      const workspace = global.workspace_manager.get_active_workspace();
      const workArea = workspace.get_work_area_for_monitor(monitor);
      const width = Math.floor(workArea.width * 0.4);
      const height = Math.floor(workArea.height * 0.6);
      const x = Math.floor(workArea.x + (workArea.width - width) / 2);
      const y = Math.floor(workArea.y + (workArea.height - height) / 2);

      win.unmaximize();
      win.move_resize_frame(true, x, y, width, height);

      console.log(`[Cycle-Tiling] Restoring to random size`);
    } else {
      const r = state.size;
      win.unmaximize();
      win.move_resize_frame(true, r.x, r.y, r.width, r.height);
      this._windowStates.delete(win);

      console.log(`[Cycle-Tiling] Restoring to last known size`);
    }
  }
}
