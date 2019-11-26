import VisibilityObserver from './VisibilityObserver.js';
import IntersectionHandler from './IntersectionHandler.js';
import AnimationElements from './AnimationElements.js';

/**
 * Adds a class to an element as soon as it becomes visible
 */
export default class Joinimation {

    constructor() {
        this.animationElements = new AnimationElements();
        this.visibilityObserver = new VisibilityObserver(this.animationElements);
        this.intersectionHandler = new IntersectionHandler(
            this.animationElements,
            this.visibilityObserver
        );
    }

    /**
     * Main method. If you pass an container element, all its children with the relevant selectors
     * will be intersection-observed.
     * @param {[type]} container [description]
     */
    add(container) {
        this.animationElements.addContainer(container);
    }

}
