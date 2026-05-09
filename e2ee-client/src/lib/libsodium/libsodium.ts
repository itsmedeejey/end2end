import _sodium from "libsodium-wrappers";

// fetching and compling the wasm binary
await _sodium.ready;

export const sodium = _sodium;
