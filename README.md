# Joinimation

Adds classes to HTML elements when they become visible (as the user scrolls through a page).

# Example

```html
<body>

    <div data-animation-visible-class="animateMe">
        I get the class animatesMe as soon as I become visible.
    </div>

    <div
        class="animator"
        data-animation-visible-class="animateMeLater"
        data-animation-delay="100"
        data-animation-element-name="trigger"
    >
        I get the class animatesMe 100ms after I became visible.
    </div>

    <div data-animation-visible-class="animateMe" data-animation-trigger="trigger">
        I get the class animateMe when the element .animator becomes visible.
    </div>

</body>
```

# Usage

1. Import and setup Joinimation
    ```javascript
    import Joinimation from '@joinbox/joinimation';
    const joinimation = new Joinimation();
    // Animate all elements with the relevant data attributes; use a selector different than
    // 'body' to only animate their child elements
    joinimation.add(document.querySelector('body'));
    ````

2. Add the following attributes to all HTML elements that should get classes when they (or another
   specified element) becomes visible:

    - An element with the attribute `data-animation-visible-class="className"` gets the 
      orresponding class (`className` in this case) as soon as it becomes visible.
    - If an element with a `data-animation-visible-class` attribute **also** has an attribute
      `data-animation-delay="100"`, the correspdonging class will be set with a delay (of 100 ms
      in this case)
    - If an element with a `data-animation-visible-class` attribute **also** has an attribute
      `data-animation-stagger="200"`, the animation will be delayed (200 ms in this case), but
      **only** if multiple elements become visible at the same time. The staggering effect will 
      take place in the same order as the elements have in the DOM. The delay is relative to the 
      previous elements that became visible simultaneously: If element1 has a stagger of 200 ms and
      element2 has a stagger of 300 ms, element2 will only become visible 500 ms after it
      became visible.
    - If an element with a `data-animation-visible-class` attribute **also** has an attribute 
      `data-animation-trigger="name1"`, classes will be added as soon as an other element that
      has the attribute `data-animation-element-name="name1"` becomes visible. Make sure their
      attribute values match exactly.

# Build

Setup: `npm i`

Test: `npm test`

Run demo:
- Use node 12
- `npm run demo`

**IMPORTANT**: Run `npm run build` before committing to create dist files.

