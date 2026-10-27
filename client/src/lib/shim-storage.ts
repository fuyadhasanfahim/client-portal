/**
 * This shim allows functionality that relies on localStorage to work
 * in server-side environments (where localStorage is not available)
 * by providing a dummy implementation.
 */
if (typeof window === 'undefined') {
    const noop = () => {};
    const storageShim = {
        getItem: () => null,
        setItem: noop,
        removeItem: noop,
        clear: noop,
        key: () => null,
        length: 0,
    };

    // If localStorage is missing or broken (e.g. getItem is not a function), patch it.
    if (
        !global.localStorage ||
        typeof global.localStorage.getItem !== 'function'
    ) {
        (global as any).localStorage = storageShim;
    }
}
