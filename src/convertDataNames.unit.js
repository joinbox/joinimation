import test from 'ava';
import convertDataNames from './convertDataName.js';

test('converts as expected', (t) => {
    t.is(convertDataNames('myDataName'), 'data-my-data-name');
    t.is(convertDataNames(''), 'data-');
});