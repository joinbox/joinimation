import VisibilityObserver from './VisibilityObserver.mjs';
import IntersectionHandler from './IntersectionHandler.mjs';
import AnimationElements from './AnimationElements.mjs';

/**
 * Adds a class to an element as soon as it becomes visible
 */
export default class Joinimation {

    constructor({ isTransitioningClassName } = {}) {
        this.animationElements = new AnimationElements();
        this.visibilityObserver = new VisibilityObserver(this.animationElements);
        this.intersectionHandler = new IntersectionHandler({
            elementStore: this.animationElements,
            intersectEmitter: this.visibilityObserver,
            isTransitioningClassName,
        });
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
