import test from 'ava';
import TransitioningElement from './TransitioningElement.mjs';

const setupData = () => {
    const element = {
        eventListeners: [],
        addEventListener(name, fn) { this.eventListeners.push({ name, fn }); },
        removeEventListener(name, fn) {
            this.eventListeners = this.eventListeners
                .filter(item => item.name === name && item.fn === fn);
        },
        classList: {
            classNames: [],
            add(name) { this.classNames.push(name); },
            remove(name) { this.classNames = this.classNames.filter(item => item !== name); },
        },
    };
    const raf = fn => fn();
    return { requestAnimationFrame: raf, element };
};

test('sets class initially', (t) => {
    const { element, requestAnimationFrame } = setupData();
    const originalRAF = global.requestAnimationFrame;
    global.requestAnimationFrame = requestAnimationFrame;
    const transitioningElement = new TransitioningElement({
        element,
        isTransitioningClassName: 'is-transitioning',
    });
    transitioningElement.init();
    t.is(element.classList.classNames.includes('is-transitioning'), true);
    global.requestAnimationFrame = originalRAF;
});

test('removes class after transitions end', (t) => {
    const { element, requestAnimationFrame } = setupData();
    const originalRAF = global.requestAnimationFrame;
    global.requestAnimationFrame = requestAnimationFrame;
    const transitioningElement = new TransitioningElement({
        element,
        isTransitioningClassName: 'is-transitioning',
    });
    transitioningElement.init();
    // Get all eventListeners for transitionstart and transitionend
    const start = element.eventListeners.filter(item => item.name === 'transitionstart');
    const end = element.eventListeners.filter(item => item.name === 'transitionend');
    const cancel = element.eventListeners.filter(item => item.name === 'transitioncancel');

    // Check if event listeners were registered correctly
    t.is(start.length, 1);
    t.is(end.length, 1);

    // Test if class is updated at the right moment
    start[0].fn();
    start[0].fn();
    end[0].fn();
    start[0].fn();
    // Test a transitioncancel event
    cancel[0].fn();
    // One transition is still running
    t.is(element.classList.classNames.includes('is-transitioning'), true);
    end[0].fn();
    t.is(element.classList.classNames.includes('is-transitioning'), false);
    global.requestAnimationFrame = originalRAF;

    // Test if event handlers are removed
    t.is(element.eventListeners.length, 0);
});
