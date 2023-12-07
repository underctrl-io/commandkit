// @ts-check

import { paperwork } from 'precinct'

export function getDependencies(file) {
    return paperwork(file, {
        includeCore: false
    })
}