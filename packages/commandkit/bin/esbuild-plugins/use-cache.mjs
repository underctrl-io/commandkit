import * as parser from '@babel/parser';
import _traverse from '@babel/traverse';
import _generate from '@babel/generator';
import * as t from '@babel/types';

const traverse = _traverse.default || _traverse;
const generate = _generate.default || _generate;

const IMPORT_PATH = 'commandkit';
const DIRECTIVE = 'use cache';
const CACHE_IDENTIFIER =
  'super_duper_secret_internal_for_use_cache_directive_of_commandkit_cli_do_not_use_it_directly_or_you_will_be_fired_from_your_job_kthxbai';

const generateRandomString = (length = 6) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join('');
};

export const cacheDirectivePlugin = async (source, args) => {
  const ast = parser.parse(source, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });

  let state = {
    needsImport: false,
    hasExistingImport: false,
    cacheIdentifierName: CACHE_IDENTIFIER,
    modifications: [],
  };

  // First pass: check for naming collisions and collect modifications
  traverse(ast, {
    Program: {
      enter(path) {
        const binding = path.scope.getBinding(CACHE_IDENTIFIER);
        if (binding) {
          state.cacheIdentifierName = `${CACHE_IDENTIFIER}_${generateRandomString()}`;
        }
      },
    },

    ImportDeclaration(path) {
      if (
        path.node.source.value === IMPORT_PATH &&
        path.node.specifiers.some(
          (spec) =>
            t.isImportSpecifier(spec) &&
            spec.imported.name === CACHE_IDENTIFIER,
        )
      ) {
        state.hasExistingImport = true;
        if (state.cacheIdentifierName !== CACHE_IDENTIFIER) {
          state.modifications.push(() => {
            path.node.specifiers.forEach((spec) => {
              if (
                t.isImportSpecifier(spec) &&
                spec.imported.name === CACHE_IDENTIFIER
              ) {
                spec.local.name = state.cacheIdentifierName;
              }
            });
          });
        }
      }
    },

    'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression'(path) {
      const body = t.isBlockStatement(path.node.body) ? path.node.body : null;
      const hasUseCache = body?.directives?.some(
        (d) => d.value.value === DIRECTIVE,
      );

      if (!hasUseCache && !t.isBlockStatement(path.node.body)) {
        const parentFunction = path.findParent(
          (p) => (p.isFunction() || p.isProgram()) && 'directives' in p.node,
        );
        if (
          !parentFunction?.node.directives?.some(
            (d) => d.value.value === DIRECTIVE,
          )
        ) {
          return;
        }
      }

      if (hasUseCache || !t.isBlockStatement(path.node.body)) {
        // Check if the function is async
        if (!path.node.async) {
          throw new Error(
            `"${DIRECTIVE}" directive may only be used in async functions at ${args.path}`,
          );
        }

        state.needsImport = true;
        const isDeclaration = t.isFunctionDeclaration(path.node);
        const name = isDeclaration ? path.node.id?.name : undefined;

        // Create a new body without the 'use cache' directive
        const newBody = t.isBlockStatement(path.node.body)
          ? t.blockStatement(
              path.node.body.body,
              path.node.body.directives.filter(
                (d) => d.value.value !== DIRECTIVE,
              ),
            )
          : path.node.body;

        const wrapped = t.callExpression(
          t.identifier(state.cacheIdentifierName),
          [t.arrowFunctionExpression(path.node.params, newBody, true)],
        );

        state.modifications.push(() => {
          if (name) {
            path.replaceWith(
              t.variableDeclaration('const', [
                t.variableDeclarator(t.identifier(name), wrapped),
              ]),
            );
          } else if (!t.isVariableDeclarator(path.parent)) {
            path.replaceWith(wrapped);
          } else {
            path.parent.init = wrapped;
          }
        });
      }
    },
  });

  // Apply all collected modifications
  if (state.modifications.length > 0) {
    // Add import if needed
    if (state.needsImport && !state.hasExistingImport) {
      ast.program.body.unshift(
        t.importDeclaration(
          [
            t.importSpecifier(
              t.identifier(state.cacheIdentifierName),
              t.identifier(CACHE_IDENTIFIER),
            ),
          ],
          t.stringLiteral(IMPORT_PATH),
        ),
      );
    }

    // Apply collected modifications
    state.modifications.forEach((modify) => modify());
  }

  const { code } = generate(ast);
  return {
    contents: code,
    loader: args.path.split('.').pop(),
  };
};
