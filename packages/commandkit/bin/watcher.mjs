// @ts-check

import { watch } from 'chokidar'

export function watchFiles(target, callback) {
    const watcher = watch(target);

    return watcher.on('all', callback);
}