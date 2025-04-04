import { rimrafSync } from 'rimraf';
import { join } from 'node:path';
import fs from 'node:fs';
import colors from '../utils/colors';
import { ResolvedCommandKitConfig } from '../config/utils';
import { generateTypesPackage } from '../utils/types-package';

let ts: typeof import('typescript') | undefined;

export function write(message: any) {
  process.stdout.write(message);
  process.stdout.write('\n');
}

/**
 * @returns {never}
 */
export function panic(message: any): never {
  write(colors.red(`Error: ${message}`));
  process.exit(1);
}

export function findPackageJSON() {
  const cwd = process.cwd();
  const target = join(cwd, 'package.json');

  if (!fs.existsSync(target)) {
    panic('Could not find package.json in current directory.');
  }

  return JSON.parse(fs.readFileSync(target, 'utf8'));
}

async function ensureTypeScript(target: string) {
  const isTypeScript = /\.(c|m)?tsx?$/.test(target);

  if (!isTypeScript) return false;
  if (process.features.typescript) return true;

  await loadTypeScript();

  return true;
}

export async function loadTypeScript(e?: string) {
  if (ts) return ts;

  try {
    ts = await import('typescript');
  } catch {
    panic(e || 'TypeScript must be installed to use TypeScript config files.');
  }

  return ts;
}

export async function loadConfigFileFromPath(
  target: string,
): Promise<ResolvedCommandKitConfig> {
  await ensureExists(target);

  const isTs = await ensureTypeScript(target);

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

    const nodeModulesPath = await generateTypesPackage();

    const tmpFile = join(nodeModulesPath, 'compiled-commandkit.config.mjs');

    fs.writeFileSync(tmpFile, outputText);

    target = tmpFile;
  }

  /**
   * @type {import('..').CommandKitConfig}
   */
  const config = await import(`file://${target}`).then(
    (conf) => conf.default || conf,
  );

  return config;
}

async function ensureExists(loc: string) {
  const exists = fs.existsSync(loc);

  if (!exists) {
    throw new Error(`File not found: ${loc}`);
  }
}

export function erase(dir: string) {
  rimrafSync(dir);
}
