import TransitioningElement from './TransitioningElement.mjs';

/**
 * Handles intersection events and updates DOM
 */
export default class IntersectionHandler {

    /**
     * @param {AnimationElements} elementStore       Store that holds all elemets that are being
     *                                               intersection-observed and updated on
     *                                               intersection change
     * @param {VisibilityObserver} intersectEmitter  Emitter that handles intersection changes on
     *                                               elements from elementStore and fires
     *                                               'intersect' event when intersection changes
     * @param {string} isTransitioningClassName      Name of class that is added to an element
     *                                               while it is transitioning; it is removed as
     *                                               soon as all initial transitions (that are
     *                                               started at the same time as Joinimation adds
     *                                               the visibleClass) are done running. Needed
     *                                               to have different timings, durations and
     *                                               delays for initial (scroll-based) transitions
     *                                               than for hover effects.
    */
    constructor({ elementStore, intersectEmitter, isTransitioningClassName } = {}) {
        this.elementStore = elementStore;
        this.intersectEmitter = intersectEmitter;
        this.isTransitioningClassName = isTransitioningClassName;
        this.setupIntersectionHandler();
    }

    /**
     * Handles 'intersect' events fired by this.intersectEmitter and updates DOM accordingly
     */
    setupIntersectionHandler() {
        this.intersectEmitter.on('intersect', (element) => {
            const receivers = this.elementStore.getReceiversForElement(element);
            receivers.forEach(receiver => this.updateDom(receiver));
        });
    }

    /**
     * Updates DOM whenever an intersection change is observed. Adds class
     * @param  {DOMElement} options.element    Element to add class to
     * @param  {number} options.delay          Delay after which class should be added to element
     * @param  {string} options.visibleClass   Name of the class that should be added to element
     */
    updateDom({ element, delay, visibleClass }) {
        setTimeout(() => {
            /* global requestAnimationFrame */
            requestAnimationFrame(() => {
                if (this.isTransitioningClassName) {
                    const transitioningElement = new TransitioningElement({
                        element,
                        isTransitioningClassName: this.isTransitioningClassName,
                    });
                    transitioningElement.init();
                }
                // We must make sure that the isTransitioningClass is added *before* the visible
                // class as it usually controls the transition properties (delay, duration, easing)
                // and therefore must be set *before* the class executing the transition is added.
                requestAnimationFrame(() => {
                    element.classList.add(visibleClass);
                });
            });
        }, delay);
    }

}
