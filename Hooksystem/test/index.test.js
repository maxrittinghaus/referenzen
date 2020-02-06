// eslint-disable-next-line max-classes-per-file
import { BaseEvent, HookPriority, HookManager } from '../src';

const wrongHookManager = new HookManager();
const mainHookManager = new HookManager();
mainHookManager.makeSingelton();

class TestEvent extends BaseEvent {
  constructor(roVal = 0, rwVal = '', func = () => {}) {
    super();

    this.roValue = roVal;
    this.rwValue = rwVal;
    this.function = func;
  }
}

describe('Hooksystem', () => {
  describe("Custom singelton", () => {
    test("Multiple instances possible", () => {
      // @ts-ignore
      HookManager.instance = undefined;

      expect(new HookManager()).not.toBe(new HookManager());
      mainHookManager.makeSingelton();
    });

    test("Constructor returns singelton instance", () => {
      expect(new HookManager()).toBe(mainHookManager);
    });

    test("Exception thrown when singelton already set", () => {
      const fn = () => wrongHookManager.makeSingelton();
      expect(fn).toThrow();
    });

    test("Expect helper methods in BaseEvent to throw when non-singelton", () => {
      HookManager.instance = undefined;

      const fireFn = async () => new TestEvent().fire();
      const hookFn = () => TestEvent.hook(() => {});

      expect(fireFn()).not.toResolve();
      expect(hookFn).toThrow();

      mainHookManager.makeSingelton();
    });
  });

  describe('Correct execution order of callbacks', () => {
    const createOrderTest = (w1, w2, w3) => async () => {
      const first = jest.fn();
      const between = jest.fn();
      const last = jest.fn();
      const eventInstance = new TestEvent();

      TestEvent.hook(() => {
        first();
      }, w1);

      TestEvent.hook(() => new Promise((resolve) => {
        between();
        resolve();
      }), w2);

      TestEvent.hook(() => {
        last();
      }, w3);

      await eventInstance.fire();
      expect(between).toHaveBeenCalledBefore(last);
      expect(first).toHaveBeenCalledBefore(between);
    };

    test("Same Priorities", createOrderTest(0, 0, 0));
    test("Different Priorities", createOrderTest(-3242, 300, 424));
  });

  describe("Manipulation", () => {
    test('Events can manipulate original event', async () => {
      TestEvent.hook((e) => {
        e.rwValue = "newValue";
      });

      const eventInstance = new TestEvent(0, "oldValue");

      await eventInstance.fire();

      expect(eventInstance.rwValue).toBe("newValue");
    });

    test('Events with monitor-priority cannot manipulate original event', async () => {
      HookManager.getInstance().clearHooks();
      TestEvent.hook((e) => {
        e.rwValue = "newValue";
      }, HookPriority.Monitor);

      const eventInstance = new TestEvent(0, "oldValue");

      await eventInstance.fire();

      expect(eventInstance.rwValue).toBe("oldValue");
    });
  });

  describe("Class-Decorator 'Event'", () => {
    test("Class has the correct event name?", () => {
      class YEET extends BaseEvent {}
      YEET.setEventName("YAYEET");

      expect(YEET.getEventName()).toBe('YAYEET');
    });
  });

  describe("Clear Event Hooks", () => {
    test("Dont throw on missing hook", () => {
      const fn = async () => mainHookManager.fire("NOT_AVAILABLE", {});
      expect(fn()).toResolve();
    });

    describe("A hook that returns false will be deleted", () => {
      test("One Instance", async () => {
        class YEET extends BaseEvent {}
        YEET.setEventName("YAYEET");

        const mock = jest.fn();

        YEET.hook(() => {
          mock();
          return false;
        });

        const yeet = new YEET();

        await yeet.fire();
        await yeet.fire();

        expect(mock).toBeCalledTimes(1);
      });

      test("Multiple Instances", async () => {
        class YEET extends BaseEvent {}
        YEET.setEventName("YAYEET");

        const mock = jest.fn();

        YEET.hook(() => {
          mock();
          return false;
        });

        const yeet = new YEET();
        const yeet2 = new YEET();

        await yeet.fire();
        await yeet2.fire();

        expect(mock).toBeCalledTimes(1);
      });

      test("A hook that does not return false will not be deleted", async () => {
        class YEET extends BaseEvent {}
        YEET.setEventName("YAYEET");

        const mock = jest.fn();

        YEET.hook(() => {
          mock();
        });

        const yeet = new YEET();
        const yeet2 = new YEET();

        await yeet.fire();
        await yeet2.fire();

        expect(mock).toBeCalledTimes(2);
      });
    });
  });
  describe("Misc", () => {
    test("Clear hooks throws if not in test environment", () => {
      process.env.HEXALABS_ENV = "notTest";
      const fn = () => mainHookManager.clearHooks();
      expect(fn).toThrow();
    });
  });
});
