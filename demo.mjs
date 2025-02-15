import { AsyncLocalStorage } from 'node:async_hooks';

const asyncLocalStorage = new AsyncLocalStorage();
const cache = new Map();
const cacheFnMap = new Map();

// revalidate the cache
function revalidate(key, ...args) {
  cache.delete(key);

  const cacheFn = cacheFnMap.get(key);
  if (!cacheFn) return;

  return asyncLocalStorage.run(
    {
      tag: key,
      life: cache.get(key)?.life || 0,
    },
    () => {
      const result = cacheFn(...args);

      cache.set(key, {
        value: result,
        time: Date.now(),
        life: asyncLocalStorage.getStore().life || 0,
      });

      return result;
    },
  );
}

// tags the current cached function with a name
function cacheTag(name) {
  const store = asyncLocalStorage.getStore();
  if (store) {
    store.tag = name;
  }
}

// sets the cache life of the current cached function
function cacheLife(time) {
  const store = asyncLocalStorage.getStore();
  if (store) {
    store.life = time;
  }
}

// makes a cached function
function makeCached(fn) {
  return (...args) => {
    return asyncLocalStorage.run({}, () => {
      const result = fn(...args);
      const store = asyncLocalStorage.getStore();

      if (!store.tag) return result;

      const cacheKey = store.tag;
      const cached = cache.get(cacheKey);

      cacheFnMap.set(cacheKey, fn);

      if (cached && Date.now() - cached.time < cached.life) {
        return cached.value;
      }

      cache.set(cacheKey, {
        value: result,
        time: Date.now(),
        life: store.life || 0,
      });

      return result;
    });
  };
}

// the cached function
const getData = makeCached((name) => {
  cacheTag(`tag:${name}`);
  cacheLife(1000);

  return Math.random();
});

// get the data
console.log('FOO', getData('foo'), getData('foo')); // should be same

console.log('BAR', getData('bar'), getData('bar')); // should be same but different from above

console.log('FOOBAR', getData('foo'), getData('bar')); // should be different

revalidate('tag:foo');

console.log('FOO', getData('foo'), getData('foo')); // should be different from above
