import test from 'ava';
import VisibilityObserver from './VisibilityObserver.mjs';

const setupData = () => {

    const listeners = [];
    const emitter = {
        on: (name, fn) => listeners.push(fn),
        emit: data => listeners.forEach(listener => listener(data)),
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
    t.deepEqual(observer.intersectionObserver.options, { threshold: [0.01, 0.05, 0.1, 0.2] });
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


test('emits intersect for intersected elements', async(t) => {

    const { emitter, IntersectionObserver } = setupData();
    global.IntersectionObserver = IntersectionObserver;
    const observer = new VisibilityObserver(emitter);

    const intersectedElements = [];
    observer.on('intersect', el => intersectedElements.push(el));

    const elements = ['el1', 'el2', 'el3'];
    // For callback see above in IntersectionObserver's fake implementation
    observer.intersectionObserver.callback(
        // Callback is called with entries that have a property 'target'
        elements.map(target => ({
            target,
            // el3 is not visible, should not fire
            isIntersecting: target !== 'el3',
            boundingClientRect: { height: 100 },
            intersectionRatio: 0.2,
        })),
        { unobserve: () => {} },
    );

    await new Promise((resolve) => {
        // First stagger after 50ms
        setTimeout(() => t.deepEqual(intersectedElements, ['el1']), 60);
        setTimeout(() => {
            t.deepEqual(intersectedElements, ['el1', 'el2']);
            resolve();
        }, 120);
    })

    delete global.IntersectionObserver;
});




test('uses correct thresholds', async(t) => {

    const { emitter, IntersectionObserver } = setupData();
    global.IntersectionObserver = IntersectionObserver;
    const observer = new VisibilityObserver(emitter);

    const intersectedElements = [];
    observer.on('intersect', el => intersectedElements.push(el));

    observer.intersectionObserver.callback(
        [
            // Not intersecting, because 0.05 is too small for height 2000
            {
                target: 'el1',
                isIntersecting: true,
                boundingClientRect: { height: 2000 },
                intersectionRatio: 0.05,
            },
            // Intersecting, because height of > 2000 uses 0.05
            {
                target: 'el2',
                isIntersecting: true,
                boundingClientRect: { height: 2001 },
                intersectionRatio: 0.05,
            },
        ],
        { unobserve: () => {} },
    );

    await new Promise(resolve => setTimeout(resolve, 50));
    t.deepEqual(intersectedElements, ['el2']);

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
            boundingClientRect: { height: 100 },
            intersectionRatio: 0.2,
        })),
        { unobserve },
    );
    // Element that became visible is unobserved
    t.deepEqual(unobservedElements, ['el1']);

    delete global.IntersectionObserver;
});

