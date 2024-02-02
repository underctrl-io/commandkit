import { readFile, writeFile } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';

export async function injectShims(
  outDir: string,
  main: string,
  antiCrash: boolean,
  polyfillRequire: boolean,
) {
    const path = isAbsolute(outDir) ? join(outDir, main) : join(process.cwd(), outDir, main);

  const head = ['\n\n;await (async()=>{', "  'use strict';"].join('\n');
  const tail = '\n})();';
  const requireScript = polyfillRequire
    ? [
        '// --- CommandKit require() polyfill ---',
        '  if (typeof require === "undefined") {',
        '    const { createRequire } = await import("node:module");',
        '    const __require = createRequire(import.meta.url);',
        '    Object.defineProperty(globalThis, "require", {',
        '      value: (id) => {',
        '        return __require(id);',
        '      },',
        '      configurable: true,',
        '      enumerable: false,',
        '      writable: true,',
        '    });',
        '  }',
        '// --- CommandKit require() polyfill ---',
      ].join('\n')
    : '';

  const antiCrashScript = antiCrash
    ? [
        '// --- CommandKit Anti-Crash Monitor ---',
        "  // 'uncaughtException' event is supposed to be used to perform synchronous cleanup before shutting down the process",
        '  // instead of using it as a means to resume operation.',
        '  // But it exists here due to compatibility reasons with discord bot ecosystem.',
        "  const p = (t) => `\\x1b[33m${t}\\x1b[0m`, b = '[CommandKit Anti-Crash Monitor]', l = console.log, e1 = 'uncaughtException', e2 = 'unhandledRejection';",
        '  if (!process.eventNames().includes(e1)) // skip if it is already handled',
        '    process.on(e1, (e) => {',
        '      l(p(`${b} Uncaught Exception`)); l(p(b), p(e.stack || e));',
        '    })',
        '  if (!process.eventNames().includes(e2)) // skip if it is already handled',
        '    process.on(e2, (r) => {',
        '      l(p(`${b} Unhandled promise rejection`)); l(p(`${b} ${r.stack || r}`));',
        '    });',
        '// --- CommandKit Anti-Crash Monitor ---',
      ].join('\n')
    : '';

  const contents = await readFile(path, 'utf-8');
  const finalScript = [
    head,
    requireScript,
    antiCrashScript,
    tail,
    '\n\n',
    contents,
  ].join('\n');

  return writeFile(path, finalScript);
}
