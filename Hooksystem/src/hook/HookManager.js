import RegisteredHook from './RegisteredHook';
// eslint-disable-next-line import/no-cycle
import BaseEvent from '../event/BaseEvent';
import HookPriority from './EHookPriority';

/**
 * Managing class. Heart of this module.
 */
export default class HookManager {
  /**
   * Creates a new instance.
   */
  constructor() {
    if (HookManager.instance) return HookManager.instance;
    this._hooks = {};
  }

  /**
   * Updates this instance to be the singelton.
   * @throws Error if an existing instance is already singelton.
   */
  makeSingelton() {
    if (HookManager.instance && HookManager.instance !== this) throw new Error("Singelton instance already exists.");
    HookManager.instance = this;
  }

  /**
   * Hooks into an event with a specific priority
   * @param {string} eventName the event's name to hook on to.
   * @param {Function} callback called when the hook is executed
   * @param {number} priority the hook priority.
   */
  hook(eventName, callback, priority = 0) {
    if (!(eventName in this._hooks)) {
      this._hooks[eventName] = {};
    }

    const hookInstance = new RegisteredHook(callback, priority);

    this._hooks[eventName][hookInstance.getId()] = hookInstance;
  }

  /**
   * Base method for firing an event.
   * @param {BaseEvent | string} mv either an instance of {@link BaseEvent} to fire
   * or the name of the event to fire.
   * @param {object} [payload] if `mv` was provided with an event name,
   * then provide the payload here.
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-dupe-class-members
  async fire(mv, payload) {
    /** @type {string} */
    let eventName;

    /** @type {object} */
    let event;

    if (mv instanceof BaseEvent) {
      const EventClass = mv.constructor;
      eventName = EventClass.getEventName();
      event = mv;
    } else {
      eventName = mv;
      event = payload || {};
    }

    if (!(eventName in this._hooks)) {
      return;
    }

    const toBeExecuted = Object.values(this._hooks[eventName])
      .sort((ha, hb) => {
        const dPrio = ha.getPriority() - hb.getPriority();
        if (dPrio === 0 || Number.isNaN(dPrio)) {
          return ha.getId() - hb.getId();
        }

        return dPrio;
      });


    const execute = async (index) => {
      const hook = toBeExecuted[index];
      let ev = event;

      if (hook.getPriority() === HookPriority.Monitor) {
        ev = Object.create(event);
      }

      let returnValue = hook.exec(ev);

      if (returnValue instanceof Promise) {
        returnValue = await returnValue;
      }

      if (returnValue === false) {
        this.unhook(eventName, hook.getId());
      }

      if (index < toBeExecuted.length - 1) await execute(index + 1);
    };

    if (toBeExecuted.length) {
      await execute(0);
    }
  }

  /**
   * Unhooks a hook from an event.
   * @param {string} eventName the event's name.
   * @param {number} hookId the hook ID.
   */
  unhook(eventName, hookId) {
    delete this._hooks[eventName][hookId];
  }

  /**
   * Clears all hooks.
   * **Warning** using this mehtod in an uncontrolled environment can cause severe damage and
   * lead the application into an unexpected state. Thus it is intentionally disabled during
   * non-testing executions.
   * @throws Error when not in test environment.
   */
  clearHooks() {
    if (process.env.HEXALABS_ENV !== "test") throw new Error("This must only be used while testing!");
    Object.keys(this._hooks)
      .forEach((eventName) => {
        delete this._hooks[eventName];
      });
  }

  /**
   * Get the singelton instance of this manager.
   * @returns {HookManager}
   */
  static getInstance() {
    return HookManager.instance;
  }
}
