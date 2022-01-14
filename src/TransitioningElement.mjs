/**
 * Adds isTransitioningClassName class to an element and removes it as soon as all
 * transitions have ended. Is needed to enable different timings, easings and delays on an element
 * while scrolling than on hover.
 */
export default class {

    runningTransitions = 0;

    /**
     * @param {HTMLElement} element
     * @param {string}  isTransitioningClassName    Class that should be added while transitioning
     *                                              and removed after transitions have ended.
     */
    constructor({ element, isTransitioningClassName } = {}) {
        this.element = element;
        this.isTransitioningClassName = isTransitioningClassName;
    }

    init() {
        this.updateClass(true);
        this.setupTransitionEndWatchers();
    }

    setupTransitionEndWatchers() {
        this.boundHandleTransitionStart = this.handleTransitionStart.bind(this);
        this.boundHandleTransitionEnd = this.handleTransitionEnd.bind(this);
        this.element.addEventListener('transitionstart', this.boundHandleTransitionStart);
        this.element.addEventListener('transitionend', this.boundHandleTransitionEnd);
    }

    handleTransitionStart() {
        this.runningTransitions += 1;
    }

    handleTransitionEnd() {
        this.runningTransitions -= 1;
        if (this.runningTransitions === 0) {
            this.updateClass(false);
            this.element.removeEventListener('transitionstart', this.boundHandleTransitionStart);
            this.element.removeEventListener('transitionend', this.boundHandleTransitionEnd);
        }
    }

    /**
     * Update class on this.element
     * @param {boolean} add         True if class should be added, false if it should be removed.
     */
    updateClass(isAdd) {
        const method = isAdd ? 'add' : 'remove';
        /* global requestAnimationFrame */
        requestAnimationFrame(() => {
            this.element.classList[method](this.isTransitioningClassName);
        });
    }
}
