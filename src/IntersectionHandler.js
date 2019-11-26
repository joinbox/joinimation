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
     */
    constructor(elementStore, intersectEmitter) {
        this.elementStore = elementStore;
        this.intersectEmitter = intersectEmitter;
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
            requestAnimationFrame(() => element.classList.add(visibleClass));
        }, delay);
    }

}
