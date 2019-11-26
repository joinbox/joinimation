import test from 'ava';
import IntersectionHandler from './IntersectionHandler.js';

const setupData = () => {

    const requestAnimationFrame = fn => fn();
    class ElementStore {
        getReceiversForElement(element) {
            this.element = element;
            return [{
                delay: 50,
                visibleClass: 'className',
                element: {
                    classList: {
                        add: className => this.className = className,
                    },
                },
            }];
        }
    };
    const listeners = [];
    const intersectEmitter = {
        on: (name, fn) => listeners.push(fn),
        emit: element => listeners.forEach(listener => listener(element)),
    };

    return { requestAnimationFrame, ElementStore, intersectEmitter };

}

test.cb('handles intersection', (t) => {
    const { requestAnimationFrame, ElementStore, intersectEmitter } = setupData();
    const elementStore = new ElementStore();
    const handler = new IntersectionHandler(elementStore, intersectEmitter);
    global.requestAnimationFrame = requestAnimationFrame;

    intersectEmitter.emit('testElement');

    // getReceiversForElement was called with correct argument
    t.is(elementStore.element, 'testElement');

    // classList is only updated after delay
    t.is(elementStore.className, undefined);
    setTimeout(() => {
        t.is(elementStore.className, 'className')
        t.end();
    }, 70);

});
