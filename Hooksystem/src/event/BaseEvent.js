// eslint-disable-next-line import/no-cycle
import HookManager from "../hook/HookManager";

/**
 * Abstract base class for event classes. Contains some utility methods.
 */
export default class BaseEvent {
  /**
   * Returns the name of the event.
   * @returns {string}
   */
  static getEventName() {
    return this._eventName;
  }

  /**
   * Sets the name of this event.
   * @param {string} name the name of this event.
   */
  static setEventName(name) {
    this._eventName = name;
  }

  /**
   * Fires this event into the pipeline.
   * **Note:** this only works if {@link HookManager} was set singelton!
   * @throws Error if {@link HookManager} is not singelton.
   * @returns {Promise<void>}
   */
  async fire() {
    if (!HookManager.getInstance()) throw new Error("HookManager is not singelton!");
    await HookManager.getInstance().fire(this);
  }

  /**
   * Registers a hook for this event.
   * **Note:** this only works if {@link HookManager} was set singelton!
   * @param {Function} callback the method that shall be called when this event is fired into
   * the pipeline.
   * @param {number} priority the priority of this hook.
   * @throws Error if {@link HookManager} is not singelton.
   */
  static hook(callback, priority = 0) {
    if (!HookManager.getInstance()) throw new Error("HookManager is not singelton!");
    HookManager.getInstance().hook(this.getEventName(), callback, priority);
  }
}
