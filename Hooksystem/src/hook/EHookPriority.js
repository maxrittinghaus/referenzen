/**
 * Enum for hook priorities.
 * @readonly
 * @enum {number}
 */
export default Object.freeze({
  /**
   * Highest priority. Hooks with this priority are called last
   * so they can have maximum control over the values in the event.
   */
  Highest: 2000,
  High: 1000,
  Normal: 0,
  Low: -1000,
  /**
   * Lowest priority. Hooks with this priority are called first.
   */
  Lowest: -2000,
  /**
   * Monitor priority is used for monitoring the outcome of an event.
   * Hooks with this priority **cannot** change the event values!
   */
  Monitor: Number.POSITIVE_INFINITY,
});
