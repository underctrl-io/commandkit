import { rimrafSync } from 'rimraf';
import { join } from 'node:path';
import fs from 'node:fs';
import colors from '../utils/colors';
import { ResolvedCommandKitConfig } from '../config/utils';
import { generateTypesPackage } from '../utils/types-package';
import { execSync } from 'node:child_process';

let ts: typeof import('typescript') | undefined;

/**
 * @private
 * @internal
 */
export function write(message: any) {
  process.stdout.write(message);
  process.stdout.write('\n');
}

/**
 * @private
 * @internal
 */
export function findEntrypoint(dir: string) {
  const target = join(dir, 'sharding-manager.js');

  // if sharding manager exists, return that file instead
  if (fs.existsSync(target)) return target;

  return join(dir, 'index.js');
}

/**
 * @returns {never}
 * @internal
 * @private
 */
export function panic(message: any): never {
  write(colors.red(`Error: ${message}`));
  process.exit(1);
}

/**
 * @private
 * @internal
 */
export function findPackageJSON() {
  const cwd = process.cwd();
  const target = join(cwd, 'package.json');

  if (!fs.existsSync(target)) {
    panic('Could not find package.json in current directory.');
  }

  return JSON.parse(fs.readFileSync(target, 'utf8'));
}

/**
 * @private
 * @internal
 */
async function ensureTypeScript(target: string) {
  const isTypeScript = /\.(c|m)?tsx?$/.test(target);

  if (!isTypeScript) return false;
  if (process.features.typescript) return true;

  await loadTypeScript();

  return true;
}

let packageManager: string;

/**
 * @private
 * @internal
 */
function detectPackageManager() {
  if (packageManager) return packageManager;

  const lockfiles = {
    'yarn.lock': 'yarn',
    'pnpm-lock.yaml': 'pnpm',
    'package-lock.json': 'npm',
    'bun.lock': 'bun',
    'bun.lockb': 'bun',
    'deno.lock': 'deno',
  };

  for (const [lockfile, manager] of Object.entries(lockfiles)) {
    if (fs.existsSync(join(process.cwd(), lockfile))) {
      packageManager = manager;
      break;
    }
  }

  if (!packageManager) {
    packageManager = 'npm';
  }

  return packageManager;
}

/**
 * @private
 * @internal
 */
export async function loadTypeScript(e?: string) {
  if (ts) return ts;

  try {
    ts = await import('typescript');
  } catch (e) {
    if (e instanceof Error && 'code' in e && e.code === 'MODULE_NOT_FOUND') {
      try {
        const packageManager = detectPackageManager();
        const prefix = packageManager === 'deno' ? 'npm:' : '';
        execSync(`${packageManager} add -D ${prefix}typescript`, {
          stdio: 'inherit',
          cwd: process.cwd(),
        });

        console.log(
          colors.cyan(
            `TypeScript has been installed automatically, restarting...`,
          ),
        );

        ts = await import('typescript');

        return ts;
      } catch {
        panic(
          'TypeScript is not installed and could not be installed automatically. Please install it manually.',
        );
      }
    }
    panic(e || 'TypeScript must be installed to use TypeScript config files.');
  }

  return ts;
}

/**
 * @private
 * @internal
 */
export async function loadConfigFileFromPath(
  target: string,
): Promise<ResolvedCommandKitConfig> {
  await ensureExists(target);

  const isTs = await ensureTypeScript(target);

  let generatedFilePath: string | undefined;

  if (isTs && ts) {
    const { transpileModule } = ts;
    const src = fs.readFileSync(target, 'utf8');
    const { outputText } = transpileModule(src, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ESNext,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
      },
      fileName: target,
    });

    await generateTypesPackage();

    const nodeModulesPath = process.cwd();

    const tmpFile = join(nodeModulesPath, 'compiled-commandkit.config.mjs');

    fs.writeFileSync(tmpFile, outputText);

    generatedFilePath = tmpFile;

    target = tmpFile;
  }

  /**
   * @type {import('..').CommandKitConfig}
   */
  const config = await import(`file://${target}`).then(
    (conf) => conf.default || conf,
  );

  if (generatedFilePath) {
    try {
      fs.unlinkSync(generatedFilePath);
    } catch {
      //
    }
  }

  return config;
}

/**
 * @private
 * @internal
 */
async function ensureExists(loc: string) {
  const exists = fs.existsSync(loc);

  if (!exists) {
    throw new Error(`File not found: ${loc}`);
  }
}

/**
 * @private
 * @internal
 */
export function erase(dir: string) {
  rimrafSync(dir);
}

/**
 * @private
 * @internal
 */
export async function copyLocaleFiles(_from: string, _to: string) {
  const resolvedFrom = join(process.cwd(), _from);
  const resolvedTo = join(process.cwd(), _to);

  const localePaths = ['app/locales'];
  const srcLocalePaths = localePaths.map((path) => join(resolvedFrom, path));
  const destLocalePaths = localePaths.map((path) => join(resolvedTo, path));

  for (const localePath of srcLocalePaths) {
    if (!fs.existsSync(localePath)) {
      continue;
    }

    // copy localePath to destLocalePath
    const destLocalePath = destLocalePaths[srcLocalePaths.indexOf(localePath)];

    if (!fs.existsSync(destLocalePath)) {
      fs.promises.mkdir(destLocalePath, { recursive: true });
    }

    await fs.promises.cp(localePath, destLocalePath, {
      recursive: true,
      force: true,
    });
  }
}
