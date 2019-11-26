import test from 'ava';
import { join } from 'path';
import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';
import AnimationElements from './AnimationElements.js';

const setupData = () => {
    const filePath = join(__dirname, '/testData/testDom.html');
    const fileContent = readFileSync(filePath);
    const dom = new JSDOM(fileContent);
    return { dom };
};


test('adds triggers from container', (t) => {

    const { dom } = setupData();
    const elements = new AnimationElements();
    const container = dom.window.document.querySelector('.animationContainer');
    elements.addContainer(container);

    t.deepEqual([...elements.triggers.keys()], [
        container.querySelector('#el1-1'),
        container.querySelector('#el1-2'),
        container.querySelector('#el2-1'),
        container.querySelector('#el4-1'),
        container.querySelector('#el4-2'),
        container.querySelector('#el5-1'),
    ]);

    t.is(elements.triggers.get(container.querySelector('#el1-1')).stagger, 0);
    t.is(elements.triggers.get(container.querySelector('#el4-2')).stagger, 100);

});


test('adds receivers from container', (t) => {

    const { dom } = setupData();
    const elements = new AnimationElements();
    const container = dom.window.document.querySelector('.animationContainer');
    elements.addContainer(container);

    t.deepEqual([...elements.receivers.keys()], [
        container.querySelector('#el1-1'),
        container.querySelector('#el1-2'),
        container.querySelector('#el2-1'),
        container.querySelector('#el4-1'),
        container.querySelector('#el4-2'),
        // Foreign receivers at the end
        'vis2name',
    ]);

    // Correct value
    t.deepEqual(elements.receivers.get(container.querySelector('#el1-1')), [{
        visibleClass: 'visClass1-1',
        element: container.querySelector('#el1-1'),
        delay: 0,
    }]);

    // Delay
    t.is(elements.receivers.get(container.querySelector('#el1-2'))[0].delay, 100);

    // Element on foreign receiver
    t.is(elements.receivers.get('vis2name')[0].element, container.querySelector('#el3-1'));
    t.is(elements.receivers.get('vis2name')[1].element, container.querySelector('#el3-2'));

});


test('returns receivers for a given element', (t) => {

    const { dom } = setupData();
    const elements = new AnimationElements();
    const container = dom.window.document.querySelector('.animationContainer');
    elements.addContainer(container);

    // el2-1 triggers itself and el3-1
    t.deepEqual(
        elements.getReceiversForElement(container.querySelector('#el2-1')),
        [
            {
                element: container.querySelector('#el2-1'),
                delay: 0,
                visibleClass: 'visClass2-1',
            }, {
                element: container.querySelector('#el3-1'),
                delay: 0,
                visibleClass: 'visClass3-1',
            }, {
                element: container.querySelector('#el3-2'),
                delay: 0,
                visibleClass: 'visClass3-2',
            },
        ],
    );

    // Works with invalid triggers
    t.deepEqual(
        elements.getReceiversForElement(container),
        [],
    );

});


test('returns options for a given trigger', (t) => {

    const { dom } = setupData();
    const elements = new AnimationElements();
    const container = dom.window.document.querySelector('.animationContainer');
    elements.addContainer(container);

    t.deepEqual(
        elements.getOptionsForTrigger(container.querySelector('#el4-2')),
        { stagger: 100 },
    );

    t.deepEqual(
        elements.getOptionsForTrigger(container),
        undefined,
    );

});


test('emits addTrigger events', (t) => {

    const { dom } = setupData();
    const elements = new AnimationElements();
    const container = dom.window.document.querySelector('.animationContainer');

    const addedElements = [];
    elements.on('addTrigger', element => addedElements.push(element));
    elements.addContainer(container);

    // #el2-1 should only emit an event once
    t.is(addedElements.length, 6);
    t.is(addedElements[0], container.querySelector('#el1-1'));

});


