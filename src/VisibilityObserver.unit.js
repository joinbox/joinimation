import test from 'ava';
import VisibilityObserver from './VisibilityObserver.js';

const setupData = () => {

    const listeners = [];
    const emitter = {
        on: (name, fn) => listeners.push(fn),
        emit: (data) => listeners.forEach(listener => listener(data)),
        getOptionsForTrigger: () => ({ stagger: 50 }),
    };
    class IntersectionObserver {
        observedElements = [];
        constructor(callback, options) {
            this.callback = callback;
            this.options = options;
        }
        observe(element) {
            this.observedElements.push(element);
        }
    }

    return { emitter, IntersectionObserver };

};


test('uses correct options for IntersectionObserver', (t) => {
    const { emitter, IntersectionObserver } = setupData();
    global.IntersectionObserver = IntersectionObserver;
    const observer = new VisibilityObserver(emitter);
    t.deepEqual(observer.intersectionObserver.options, { threshold: [0.2] });
    delete global.IntersectionObserver;
});


test('listens to elements that were emitted by addTrigger', (t) => {
    const { emitter, IntersectionObserver } = setupData();
    global.IntersectionObserver = IntersectionObserver;
    const observer = new VisibilityObserver(emitter);
    emitter.emit('test');
    t.deepEqual(observer.intersectionObserver.observedElements, ['test']);
    delete global.IntersectionObserver;
});

test.cb('emits intersect for intersected elements', (t) => {

    const { emitter, IntersectionObserver } = setupData();
    global.IntersectionObserver = IntersectionObserver;
    const observer = new VisibilityObserver(emitter);

    const intersectedElements = [];
    observer.on('intersect', el => intersectedElements.push(el));

    const elements = ['el1', 'el2', 'el3'];
    observer.intersectionObserver.callback(
        // Callback is called with entries that have a property 'target'
        elements.map(target => ({
            target,
            // el3 is not visible, should not fire
            isIntersecting: target !== 'el3',
        })),
        { unobserve: () => {} }
    );

    // First stagger after 50ms
    setTimeout(() => t.deepEqual(intersectedElements, ['el1']), 60);
    setTimeout(() => {
        t.deepEqual(intersectedElements, ['el1', 'el2']);
        t.end();
    }, 120);

    delete global.IntersectionObserver;
});


test('unobserves elements that were intersected', (t) => {
    const { emitter, IntersectionObserver } = setupData();
    global.IntersectionObserver = IntersectionObserver;
    const observer = new VisibilityObserver(emitter);

    const unobservedElements = [];
    const unobserve = element => unobservedElements.push(element);

    const elements = ['el1', 'el2'];
    observer.intersectionObserver.callback(
        elements.map(target => ({
            target,
            isIntersecting: target === 'el1',
        })),
        { unobserve }
    );
    // Element that became visible is unobserved
    t.deepEqual(unobservedElements, ['el1']);

    delete global.IntersectionObserver;
});

