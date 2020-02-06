/**
 * This class represents a registered hook.
 */
class RegisteredHook {
  /**
   * Constructs a new instance.
   * @param {Function} callback the callback method.
   * @param {number} priority the priority. (See {@link EHookPriority} for guidance).
   */
  constructor(callback, priority) {
    this._callback = callback;
    this._priority = priority;
    this._id = RegisteredHook._hookId++;
  }

  /**
   * Returns the ID of this hook.
   * @returns {number}
   */
  getId() {
    return this._id;
  }

  /**
   * Returns the priority of this hook.
   * @returns {number}
   */
  getPriority() {
    return this._priority;
  }

  /**
   * Executes the callback of this hook.
   * @param {object} e the intance of the event that is fired.
   * @returns all the possible return types of {@link IHookCallback}
   */
  exec(e) {
    return this._callback(e);
  }
}

RegisteredHook._hookId = 1;

export default RegisteredHook;
