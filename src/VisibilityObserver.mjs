import EventEmitter from 'events';

export default class VisibilityObserver extends EventEmitter {

    /**
     * @param  {Object} elementStore   Emitter that emits addTrigger when intersection-triggering
     *                                 elements are added to the DOM and has method
     *                                 getOptionsForTrigger that returns stagger data
     */
    constructor(elementStore) {
        super();
        this.elementStore = elementStore;
        this.setupIntersectionObserver();
        this.setupElementEmitter();
    }

    /**
     * Listens to addTrigger events on elementEmitter
     * @param {Object} elementEmitter   Emitter that emits addTrigger when intersection-triggering
     *                                  elements are added to the DOM
     * @private
     */
    setupElementEmitter() {
        this.elementStore.on('addTrigger', (element) => {
            this.intersectionObserver.observe(element);
        });
    }

    /**
     * Sets up IntersectionObserver; make it publicly accessible for unit tests
     */
    setupIntersectionObserver() {
        /* global IntersectionObserver */
        this.intersectionObserver = new IntersectionObserver(
            this.handleIntersection.bind(this),
        );
    }

    /**
     * Handles an intersection event
     * @fires intersect     Fires intersect event after
     * @private
     */
    handleIntersection(entries, observer) {

        let timeout = 0;

        entries.forEach((entry) => {

            // Only handle elements that are (partially) visible
            if (!entry.isIntersecting) return;

            const element = entry.target;
            const { stagger } = this.elementStore.getOptionsForTrigger(element);
            // Add to timeout every time an element should be staggered; elements in arguments are
            // sorted by their order in the DOM.
            // Don't use stagger in IntersectionHandler but here in order to execute delayed
            // animations that depend on this element *after* the class on the element itself was
            // updated.
            timeout += stagger;
            setTimeout(() => this.emit('intersect', element), timeout);
            observer.unobserve(element);

        });
    }

}


