// Empty module to replace Node.js built-ins in browser builds
// This prevents "is not a constructor" errors when libraries try to use Node.js modules

// Create a function that can be used as a constructor or regular function
function EmptyConstructor(this: any, ...args: any[]) {
  // When called as constructor: new EmptyConstructor()
  if (new.target) {
    return this;
  }
  // When called as function: EmptyConstructor()
  return {};
}

// Make it usable as both default and named exports
EmptyConstructor.prototype = {};

// Add common methods that Node.js modules might have
Object.assign(EmptyConstructor, {
  createReadStream: () => ({ on: () => {}, pipe: () => {} }),
  createWriteStream: () => ({ write: () => {}, end: () => {} }),
  readFile: () => Promise.resolve(''),
  writeFile: () => Promise.resolve(),
  stat: () => Promise.resolve({}),
  access: () => Promise.resolve(),
  mkdir: () => Promise.resolve(),
  readdir: () => Promise.resolve([]),
});

export default EmptyConstructor;
export const _ = EmptyConstructor;
