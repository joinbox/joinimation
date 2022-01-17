import test from 'ava';
import IntersectionHandler from './IntersectionHandler.mjs';

const setupData = () => {

    const requestAnimationFrame = fn => fn();
    class ElementStore {
        getReceiversForElement(element) {
            this.element = element;
            this.classNames = [];
            return [{
                delay: 50,
                visibleClass: 'className',
                element: {
                    // Mocked functions needed for TransitioningElement
                    addEventListener: () => {},
                    removeEventListener: () => {},
                    classList: {
                        add: (className) => { this.classNames.push(className); },
                        remove: () => {},
                    },
                },
            }];
        }
    }
    const listeners = [];
    const intersectEmitter = {
        on: (name, fn) => listeners.push(fn),
        emit: element => listeners.forEach(listener => listener(element)),
    };

    return { requestAnimationFrame, ElementStore, intersectEmitter };

};

test('handles intersection', async(t) => {
    const { requestAnimationFrame, ElementStore, intersectEmitter } = setupData();
    const elementStore = new ElementStore();
    const originalRAF = global.requestAnimationFrame;
    global.requestAnimationFrame = requestAnimationFrame;

    const handler = new IntersectionHandler({
        elementStore,
        intersectEmitter,
    });
    intersectEmitter.emit('testElement');

    // getReceiversForElement was called with correct argument
    t.is(elementStore.element, 'testElement');

    // classList is only updated after delay
    t.deepEqual(elementStore.classNames, []);
    await new Promise((resolve) => {
        setTimeout(() => {
            t.deepEqual(elementStore.classNames, ['className']);
            global.requestAnimationFrame = originalRAF;
            resolve();
        }, 70);    
    });

});


test('adds class during transition', async(t) => {
    const { requestAnimationFrame, ElementStore, intersectEmitter } = setupData();
    const elementStore = new ElementStore();
    const originalRAF = global.requestAnimationFrame;
    global.requestAnimationFrame = requestAnimationFrame;

    const handler = new IntersectionHandler({
        elementStore,
        intersectEmitter,
        isTransitioningClassName: 'isTransitioning',
    });
    intersectEmitter.emit('testElement');

    // classList is only updated after delay
    t.deepEqual(elementStore.classNames, []);
    await new Promise((resolve) => {
        setTimeout(() => {
            // Order of classNames matters
            t.deepEqual(elementStore.classNames, ['isTransitioning', 'className']);
            global.requestAnimationFrame = originalRAF;
            resolve();
        }, 70);
    });

});
