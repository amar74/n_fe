// Empty module to replace Node.js built-ins in browser builds
// This prevents "is not a constructor" errors when libraries try to use Node.js modules

export default {};
export const _ = {};
