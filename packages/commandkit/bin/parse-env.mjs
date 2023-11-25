// @ts-check

import { randomUUID } from 'node:crypto';

const valuesMap = {
    true: true,
    false: false,
    null: null,
    undefined: undefined,
    __UUIDv4__: () => randomUUID(),
};

const VALUE_PREFIXES = {
    JSON: 'JSON::',
    DATE: 'DATE::',
};

function catcher(fn) {
    try {
        fn();
        return true;
    } catch {
        return false;
    }
}

export function parseEnv(src) {
    for (const key in src) {
        const value = src[key];

        if (typeof value !== 'string') continue;

        if (value.startsWith(VALUE_PREFIXES.JSON)) {
            catcher(() => (src[key] = JSON.parse(value.replace(VALUE_PREFIXES.JSON, ''))));
            continue;
        }

        if (value.startsWith(VALUE_PREFIXES.DATE)) {
            src[key] = new Date(value.replace(VALUE_PREFIXES.DATE, ''));
            continue;
        }

        if (value.includes(',')) {
            src[key] = value.split(',').map((v) => v.trim());
            continue;
        }

        if (/^[0-9]+n$/.test(value)) {
            src[key] = BigInt(value);
            continue;
        }

        if (value in valuesMap) {
            src[key] =
                typeof valuesMap[value] === 'function' ? valuesMap[value]() : valuesMap[value];
            continue;
        }
    }

    return src;
}
