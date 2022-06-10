export async function retryPromiseWithDelay<T>(
  promise: Promise<T>,
  retryCount: number,
  delayTime: number
): Promise<T> {
  try {
    return await promise;
  } catch (e) {
    console.log(e)
    if (retryCount === 1) {
      return Promise.reject(e);
    }
    console.log('retrying promise', retryCount, 'time');
    // wait for delayTime amount of time before calling this method again
    await new Promise(f => setTimeout(f, delayTime));

    return retryPromiseWithDelay(promise, retryCount - 1, delayTime);
  }
}

export async function tryPromiseWithTimeout<T>(
  promise: Promise<T>,
  timeout: number
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(reject, timeout))
  ]);
}