import Joinimation from '../../src/Joinimation.mjs';

// Clone content
/* global document */
const container = document.querySelector('.container');
const containerContent = container.innerHTML;
for (let i = 0; i < 10; i++) {
    const replaced = containerContent
        .replace(/"trigger"/g, `trigger-${i}`)
        .replace(/"rightTrigger"/g, `trigger-${i}`);
    container.innerHTML += replaced;
}

const joinimation = new Joinimation({ isTransitioningClassName: 'is-transitioning' });
joinimation.add(container);
