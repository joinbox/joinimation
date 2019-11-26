import EventEmitter from 'events';
import convertDataName from './convertDataName.js';
import dataAttributes from './dataAttributes.js';

export default class AnimationElements extends EventEmitter {

    /**
     * All elements that trigger an animation, be it on themselves or on other elements.
     * @type {Map.<DOMElement, Object>}   - Key is triggering element
     *                                    - Value is an object with property stagger (number)
     */
    triggers = new Map();
    /**
     * All elements that are animated – be the animation triggered by themselves or by other
     * elements.
     * @type {Map.<(DOMElement|string), object>}  - Key is the DOMElement if it triggers itself
     *                                              or the name of the triggering element
     *                                            - Value is an array of object with properties
     *                                              delay (number), visibleClass (string) and
     *                                              element (DOMElement)
     */
    receivers = new Map();

    /**
     * Adds all elements in container that match relevant selectors to this.receivers and
     * this.triggers.
     * @param {DOMNodeList} container
     */
    addContainer(container) {

        // All elements that trigger animations on other elements (through their name).
        const foreignTriggers = container.querySelectorAll(
            `[${convertDataName(dataAttributes.elementName)}]`,
        );
        // All elements that trigger themselves (i.e. that have a visibleClass but *not* a foreign
        // animation trigger).
        const selfTriggerSelector = `[${convertDataName(dataAttributes.visibleClass)}]:not([${convertDataName(dataAttributes.foreignTrigger)}])`;
        const selfTriggers = container.querySelectorAll(selfTriggerSelector);

        // All elements that are triggered by foreign elements
        const foreignReceivers = container.querySelectorAll(
            `[${convertDataName(dataAttributes.foreignTrigger)}]`,
        );

        // Create this.trigger data
        [...selfTriggers, ...foreignTriggers].forEach((trigger) => {
            const staggerData = trigger.dataset[dataAttributes.stagger];
            const stagger = staggerData ? parseInt(staggerData, 0) : 0;
            const emit = !this.triggers.has(trigger);
            this.triggers.set(trigger, {
                stagger,
            });
            // Only emit if element is not already in this.triggers; if we did, multiple observers
            // might be added. This would happen if an element triggers e.g. itself *and* a foreign
            // element.
            if (emit) this.emitAddTriggerEvent(trigger);
        });

        // Create this.receivers data
        [...selfTriggers, ...foreignReceivers].forEach((receiver) => {
            const delayData = receiver.dataset[dataAttributes.delay];
            const delay = delayData ? parseInt(delayData, 0) : 0;
            const visibleClass = receiver.dataset[dataAttributes.visibleClass];
            const foreignTriggerData = receiver.dataset[dataAttributes.foreignTrigger];
            const trigger = foreignTriggerData || receiver;
            const value = {
                delay,
                visibleClass,
                // Element is needed for all elements that are triggered by a foreign element
                // (as their key is only the foreign element's name)
                element: receiver,
            };
            if (this.receivers.has(trigger)) {
                this.receivers.get(trigger).push(value);
            } else {
                this.receivers.set(trigger, [value]);
            }
        });

    }


    /**
     * Returns all elements that are triggered by trigger
     * @param {(string|DOMElement)} trigger   Element that moved into viewPort; may be a string
     *                                        (for elements with name) or the element itself (if
     *                                        name is not given).
     * @return {DOMElement}
     */
    getReceiversForElement(trigger) {
        const dataName = trigger.dataset[dataAttributes.elementName];
        return [
            ...(this.receivers.has(trigger) ? this.receivers.get(trigger) : []),
            ...(this.receivers.has(dataName) ? this.receivers.get(dataName) : []),
        ];
    }


    /**
     * Returns options for a trigger element
     * @param  {DOMElement} trigger    Element to get options for
     * @return {Object}                Value of this.triggers
     */
    getOptionsForTrigger(trigger) {
        return this.triggers.get(trigger);
    }


    /**
     * Emits an add event
     * @param {DOMElement} element    DOMElement to emit add event for
     * @fires addTrigger
     * @private
     */
    emitAddTriggerEvent(element) {
        this.emit('addTrigger', element);
    }

}
