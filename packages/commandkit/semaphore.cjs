const {
  MemorySemaphoreStorage,
  Semaphore,
  acquirePermit,
  createSemaphore,
  defaultSemaphore,
  getAcquiredPermits,
  getAvailablePermits,
  releasePermit,
  withPermit,
} = require('./dist/utils/useful-stuff/semaphore.js');

module.exports = {
  MemorySemaphoreStorage,
  Semaphore,
  acquirePermit,
  createSemaphore,
  defaultSemaphore,
  getAcquiredPermits,
  getAvailablePermits,
  releasePermit,
  withPermit,
};
