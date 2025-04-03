import { existsSync } from 'node:fs';
import { loadTypeScript } from './common';
import { join, relative } from 'node:path';
import colors from '../utils/colors';

const TS_NOT_FOUND_ERR = `TypeScript must be installed in order to use the type checker. Please install it using \`npm install typescript\` or \`yarn add typescript\``;

/**
 * Formats a TypeScript diagnostic message in a pretty, readable format
 */
function formatDiagnostic(
  ts: typeof import('typescript'),
  diagnostic: import('typescript').Diagnostic,
  cwd: string,
): string {
  const messageText = ts.flattenDiagnosticMessageText(
    diagnostic.messageText,
    '\n',
  );

  if (!diagnostic.file) {
    return `${colors.red('error')}: ${messageText}`;
  }

  const { line, character } = ts.getLineAndCharacterOfPosition(
    diagnostic.file,
    diagnostic.start!,
  );
  const fileName = relative(cwd, diagnostic.file.fileName);
  const position = `${line + 1}:${character + 1}`;
  const errorCode = diagnostic.code ? `TS${diagnostic.code}` : '';

  // Format the error message nicely
  return [
    `${colors.bold(colors.cyan(fileName))}:${colors.bold(colors.yellow(position))} - ${colors.red('error')} ${colors.gray(errorCode)}`,
    `${messageText}`,
  ].join('\n');
}

/**
 * Performs a type check on the project using TypeScript.
 * @param path The project root or cwd
 */
export async function performTypeCheck(path: string) {
  const tsconfigPath = join(path, 'tsconfig.json');

  if (!existsSync(tsconfigPath)) return;

  const ts = await loadTypeScript(TS_NOT_FOUND_ERR);

  // Format host for error reporting
  const formatHost = {
    getCanonicalFileName: (path: string) => path,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getNewLine: () => ts.sys.newLine,
  };

  // Read tsconfig.json
  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);

  if (configFile.error) {
    console.error(
      colors.red(
        `Error reading tsconfig.json: ${ts.formatDiagnostic(configFile.error, formatHost)}`,
      ),
    );
    process.exit(1);
  }

  // Parse the config file
  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path,
  );

  // Force noEmit to true as we only want type checking
  parsedConfig.options.noEmit = true;

  // Create a program
  const program = ts.createProgram({
    rootNames: parsedConfig.fileNames,
    options: parsedConfig.options,
    projectReferences: parsedConfig.projectReferences,
  });

  // Get the diagnostics
  const diagnostics = [
    ...program.getOptionsDiagnostics(),
    ...program.getGlobalDiagnostics(),
    ...program.getSyntacticDiagnostics(),
    ...program.getSemanticDiagnostics(),
  ];

  // Report any errors
  if (diagnostics.length > 0) {
    console.log('');
    console.error(
      colors.bold(
        colors.red('Type checking failed with the following errors:'),
      ),
    );
    console.log('');

    // Group diagnostics by file for better readability
    const byFile = new Map<string, import('typescript').Diagnostic[]>();

    for (const diagnostic of diagnostics) {
      const fileName = diagnostic.file ? diagnostic.file.fileName : 'Global';
      if (!byFile.has(fileName)) {
        byFile.set(fileName, []);
      }
      byFile.get(fileName)!.push(diagnostic);
    }

    // Pretty-print each diagnostic
    const totalErrors = diagnostics.length;
    let counter = 0;

    for (const [_, fileDiags] of byFile) {
      for (const diagnostic of fileDiags) {
        counter++;
        console.log(formatDiagnostic(ts, diagnostic, path));
        // Add separator between errors for better readability, except for the last one
        if (counter < totalErrors) {
          console.log('');
        }
      }
    }

    console.log('');
    console.error(
      colors.bold(
        colors.red(`Found ${totalErrors} error${totalErrors > 1 ? 's' : ''}`),
      ),
    );
    console.log('');

    process.exit(1);
  }

  console.log(colors.green('✓ Type checking completed successfully.'));
}
