/**
 * Converts data name (from dataset which is camelCase) to attribute (which is train-case)
 */
export default name => `data-${name.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)}`;
