// borrowed from https://github.com/vendure-ecommerce/vendure/blob/cfc0dd7c34fd070a15455508f32d37e94589e656/scripts/docs/typescript-docs-parser.ts
import fs from 'fs';
import path from 'path';
import ts, {
  HeritageClause,
  JSDocTag,
  Modifier,
  NodeArray,
  SyntaxKind,
} from 'typescript';

import {
  addCodeBlockIfNeeded,
  normalizeForUrlPart,
  notNullOrUndefined,
} from './docgen-utils';
import {
  DocsPage,
  MemberInfo,
  MethodInfo,
  MethodParameterInfo,
  ParsedDeclaration,
  PropertyInfo,
  ValidDeclaration,
} from './typescript-docgen-types';

/**
 * Parses TypeScript source files into data structures which can then be rendered into
 * markdown for documentation.
 */
export class TypescriptDocsParser {
  private readonly atTokenPlaceholder = '__EscapedAtToken__';
  private readonly commentBlockEndTokenPlaceholder =
    '__EscapedCommentBlockEndToken__';

  /**
   * Parses the TypeScript files given by the filePaths array and returns the
   * parsed data structures ready for rendering.
   */
  parse(filePaths: string[], category?: string): DocsPage[] {
    const sourceFiles = filePaths.map((filePath) => {
      return ts.createSourceFile(
        filePath,
        this.replaceEscapedTokens(fs.readFileSync(filePath).toString()),
        ts.ScriptTarget.ES2022,
        true,
      );
    });

    const statements = this.getStatementsWithSourceLocation(sourceFiles);

    const pageMap = statements
      .map((statement) => {
        const info = this.parseDeclaration(
          statement.statement,
          statement.sourceFile,
          statement.sourceLine,
          category,
        );
        return info;
      })
      .filter(notNullOrUndefined)
      .reduce((pages, declaration) => {
        const pageTitle = declaration.page || declaration.title;
        const existingPage = pages.get(pageTitle);
        if (existingPage) {
          existingPage.declarations.push(declaration);
        } else {
          const normalizedTitle = normalizeForUrlPart(pageTitle);
          const categoryLastPart = declaration.category.split('/').pop();
          const fileName =
            normalizedTitle === categoryLastPart ? 'index' : normalizedTitle;
          pages.set(pageTitle, {
            title: pageTitle,
            category: declaration.category.split('/'),
            declarations: [declaration],
            fileName,
          });
        }
        return pages;
      }, new Map<string, DocsPage>());

    return Array.from(pageMap.values());
  }

  /**
   * Maps an array of parsed SourceFiles into statements, including a reference to the original file each statement
   * came from.
   */
  private getStatementsWithSourceLocation(sourceFiles: ts.SourceFile[]): Array<{
    statement: ts.Statement;
    sourceFile: string;
    sourceLine: number;
  }> {
    return sourceFiles.reduce(
      (st, sf) => {
        const statementsWithSources = sf.statements.map((statement) => {
          const sourceFile = path
            .relative(path.join(__dirname, '..'), sf.fileName)
            .replace(/\\/g, '/');
          const sourceLine =
            sf.getLineAndCharacterOfPosition(statement.getStart()).line + 1;
          return { statement, sourceFile, sourceLine };
        });
        return [...st, ...statementsWithSources];
      },
      [] as Array<{
        statement: ts.Statement;
        sourceFile: string;
        sourceLine: number;
      }>,
    );
  }

  /**
   * Parses an InterfaceDeclaration into a simple object which can be rendered into markdown.
   */
  private parseDeclaration(
    statement: ts.Statement,
    sourceFile: string,
    sourceLine: number,
    fallbackCategory?: string,
  ): ParsedDeclaration | undefined {
    if (!this.isValidDeclaration(statement)) {
      return;
    }

    // Check if this declaration should be excluded (private/internal)
    if (this.isPrivateOrInternal(statement)) {
      return;
    }

    // Check if this declaration is exported
    if (!this.isExported(statement)) {
      return;
    }

    const category = this.getDocsCategory(statement) || fallbackCategory;
    if (category === undefined) {
      return;
    }
    let title: string;
    if (ts.isVariableStatement(statement)) {
      title = statement.declarationList.declarations[0].name.getText();
    } else {
      title = statement.name ? statement.name.getText() : 'anonymous';
    }
    const fullText = this.getDeclarationFullText(statement);
    const weight = this.getDeclarationWeight(statement);
    const description = this.getDeclarationDescription(statement);
    const docsPage = this.getDocsPage(statement);
    const since = this.getSince(statement);
    const experimental = this.getExperimental(statement);
    const packageName = this.getPackageName(sourceFile);

    const info = {
      packageName,
      sourceFile,
      sourceLine,
      fullText,
      title,
      weight,
      category,
      description,
      page: docsPage,
      since,
      experimental,
    };

    if (ts.isInterfaceDeclaration(statement)) {
      return {
        ...info,
        kind: 'interface',
        extendsClause: this.getHeritageClause(
          statement,
          ts.SyntaxKind.ExtendsKeyword,
        ),
        members: this.parseMembers(statement.members),
      };
    } else if (ts.isTypeAliasDeclaration(statement)) {
      return {
        ...info,
        type: statement.type,
        kind: 'typeAlias',
        members: ts.isTypeLiteralNode(statement.type)
          ? this.parseMembers(statement.type.members)
          : undefined,
      };
    } else if (ts.isClassDeclaration(statement)) {
      return {
        ...info,
        kind: 'class',
        members: this.parseMembers(statement.members),
        extendsClause: this.getHeritageClause(
          statement,
          ts.SyntaxKind.ExtendsKeyword,
        ),
        implementsClause: this.getHeritageClause(
          statement,
          ts.SyntaxKind.ImplementsKeyword,
        ),
      };
    } else if (ts.isEnumDeclaration(statement)) {
      return {
        ...info,
        kind: 'enum' as const,
        members: this.parseMembers(statement.members) as PropertyInfo[],
      };
    } else if (ts.isFunctionDeclaration(statement)) {
      const parameters = statement.parameters.map((p) => {
        let name = p.name.getText();
        if (
          name.startsWith('{') &&
          name.endsWith('}') &&
          info.sourceFile.endsWith('.tsx')
        ) {
          // The "name" of a React component is often a destructured object, e.g. `{ prod1, prop2 }` etc.
          // In this case we will simply replace that with "props".
          name = 'props';
        }
        return {
          name,
          type: p.type ? p.type.getText() : '',
          optional: !!p.questionToken,
          initializer: p.initializer && p.initializer.getText(),
        };
      });

      return {
        ...info,
        kind: 'function',
        parameters,
        type: statement.type,
      };
    } else if (ts.isVariableStatement(statement)) {
      return {
        ...info,
        kind: 'variable',
      };
    }
  }

  /**
   * Returns the text of any "extends" or "implements" clause of a class or interface.
   */
  private getHeritageClause(
    statement: ts.ClassDeclaration | ts.InterfaceDeclaration,
    kind: ts.SyntaxKind.ExtendsKeyword | ts.SyntaxKind.ImplementsKeyword,
  ): HeritageClause | undefined {
    const { heritageClauses } = statement;
    if (!heritageClauses) {
      return;
    }
    const clause = heritageClauses.find((cl) => cl.token === kind);
    if (!clause) {
      return;
    }
    return clause;
  }

  /**
   * Returns the declaration name plus any type parameters.
   */
  private getDeclarationFullText(declaration: ValidDeclaration): string {
    let name: string;
    if (ts.isVariableStatement(declaration)) {
      name = declaration.declarationList.declarations[0].name.getText();
    } else {
      name = declaration.name ? declaration.name.getText() : 'anonymous';
    }
    let typeParams = '';
    if (
      !ts.isEnumDeclaration(declaration) &&
      !ts.isVariableStatement(declaration) &&
      declaration.typeParameters
    ) {
      typeParams =
        '<' +
        declaration.typeParameters.map((tp) => tp.getText()).join(', ') +
        '>';
    }
    return name + typeParams;
  }

  private getPackageName(sourceFile: string): string {
    const matches = sourceFile.match(/\/packages\/([^/]+)\//);
    if (matches) {
      if (matches[1] === 'commandkit') {
        return 'commandkit';
      }

      return `@commandkit/${matches[1]}`;
    } else {
      return '';
    }
  }

  /**
   * Parses an array of interface members into a simple object which can be rendered into markdown.
   */
  private parseMembers(
    members: ts.NodeArray<ts.TypeElement | ts.ClassElement | ts.EnumMember>,
  ): Array<PropertyInfo | MethodInfo> {
    const result: Array<PropertyInfo | MethodInfo> = [];
    const hasModifiers = (
      member: any,
    ): member is { modifiers: NodeArray<Modifier> } =>
      Array.isArray(member.modifiers);

    for (const member of members) {
      const modifiers = hasModifiers(member)
        ? member.modifiers.map((m) => m.getText())
        : [];
      const isPrivate = modifiers.includes('private');

      // Get the member name to check for private fields (starting with #)
      const name = member.name
        ? member.name.getText()
        : ts.isIndexSignatureDeclaration(member)
          ? '[index]'
          : 'constructor';

      // Skip private members and private fields (starting with #)
      const isPrivateField = name.startsWith('#');

      if (
        !isPrivate &&
        !isPrivateField &&
        (ts.isPropertySignature(member) ||
          ts.isMethodSignature(member) ||
          ts.isPropertyDeclaration(member) ||
          ts.isMethodDeclaration(member) ||
          ts.isConstructorDeclaration(member) ||
          ts.isEnumMember(member) ||
          ts.isGetAccessorDeclaration(member) ||
          ts.isIndexSignatureDeclaration(member))
      ) {
        let description = '';
        let type = '';
        let defaultValue = '';
        let parameters: MethodParameterInfo[] = [];
        let fullText = '';
        let isInternal = false;
        let since: string | undefined;
        let experimental = false;
        if (ts.isConstructorDeclaration(member)) {
          fullText = 'constructor';
        } else if (ts.isMethodDeclaration(member)) {
          fullText = member.name.getText();
        } else if (ts.isGetAccessorDeclaration(member)) {
          fullText = `${member.name.getText()}: ${member.type ? member.type.getText() : 'void'}`;
        } else {
          fullText = member.getText();
        }

        // First, get the main JSDoc comment text for the member
        const jsDocNodes = ts.getJSDocCommentsAndTags(member);
        for (const jsDoc of jsDocNodes) {
          if (ts.isJSDoc(jsDoc) && jsDoc.comment) {
            if (typeof jsDoc.comment === 'string') {
              description += jsDoc.comment;
            } else {
              // Handle JSDocComment[] case
              description += jsDoc.comment
                .map((c) =>
                  c.kind === ts.SyntaxKind.JSDocText ? c.text : c.getText(),
                )
                .join('');
            }
            description += '\n\n';
          }
        }

        // Then, add any explicit tags
        this.parseTags(member, {
          description: (comment) => (description += comment || ''),
          example: (comment) =>
            (description += this.formatExampleCode(comment)),
          default: (comment) => (defaultValue = comment || ''),
          internal: (comment) => (isInternal = true),
          private: (comment) => (isInternal = true), // treat @private as internal
          since: (comment) => (since = comment || undefined),
          experimental: (comment) => (experimental = comment != null),
        });
        if (isInternal) {
          continue;
        }
        if (!ts.isEnumMember(member) && member.type) {
          type = member.type.getText();
        }
        const memberInfo: MemberInfo = {
          fullText,
          name,
          description: this.restoreTokens(description.trim()),
          type: type.replace(/`/g, '\\`'),
          modifiers,
          since,
          experimental,
        };
        if (
          ts.isMethodSignature(member) ||
          ts.isMethodDeclaration(member) ||
          ts.isConstructorDeclaration(member)
        ) {
          parameters = member.parameters.map((p) => ({
            name: p.name.getText(),
            type: p.type ? p.type.getText() : '',
            optional: !!p.questionToken,
            initializer: p.initializer && p.initializer.getText(),
          }));
          result.push({
            ...memberInfo,
            kind: 'method',
            parameters,
          });
        } else {
          result.push({
            ...memberInfo,
            kind: 'property',
            defaultValue,
          });
        }
      }
    }

    return result;
  }

  private tagCommentText(tag: JSDocTag): string {
    if (!tag.comment) {
      return '';
    }
    if (typeof tag.comment === 'string') {
      return tag.comment;
    }
    return tag.comment
      .map((t) => (t.kind === SyntaxKind.JSDocText ? t.text : t.getText()))
      .join('');
  }

  /**
   * Reads the @docsWeight JSDoc tag from the interface.
   */
  private getDeclarationWeight(statement: ValidDeclaration): number {
    let weight = 10;
    this.parseTags(statement, {
      docsWeight: (comment) => (weight = Number.parseInt(comment || '10', 10)),
    });
    return weight;
  }

  private getDocsPage(statement: ValidDeclaration): string | undefined {
    let docsPage: string | undefined;
    this.parseTags(statement, {
      docsPage: (comment) => (docsPage = comment),
    });
    return docsPage;
  }

  /**
   * Reads the @since JSDoc tag
   */
  private getSince(statement: ValidDeclaration): string | undefined {
    let since: string | undefined;
    this.parseTags(statement, {
      since: (comment) => (since = comment),
    });
    return since;
  }

  /**
   * Reads the @experimental JSDoc tag
   */
  private getExperimental(statement: ValidDeclaration): boolean {
    let experimental = false;
    this.parseTags(statement, {
      experimental: (comment) => (experimental = comment != null),
    });
    return experimental;
  }

  /**
   * Reads the @description JSDoc tag from the interface.
   */
  private getDeclarationDescription(statement: ValidDeclaration): string {
    let description = '';

    // First, get the main JSDoc comment text (not from tags)
    const jsDocNodes = ts.getJSDocCommentsAndTags(statement);
    for (const jsDoc of jsDocNodes) {
      if (ts.isJSDoc(jsDoc) && jsDoc.comment) {
        if (typeof jsDoc.comment === 'string') {
          description += jsDoc.comment;
        } else {
          // Handle JSDocComment[] case
          description += jsDoc.comment
            .map((c) =>
              c.kind === ts.SyntaxKind.JSDocText ? c.text : c.getText(),
            )
            .join('');
        }
        description += '\n\n';
      }
    }

    // Then, add any explicit @description tags and examples
    this.parseTags(statement, {
      description: (comment) => (description += comment),
      example: (comment) => (description += this.formatExampleCode(comment)),
    });

    return this.restoreTokens(description.trim());
  }

  /**
   * Extracts the "@docsCategory" value from the JSDoc comments if present.
   */
  private getDocsCategory(statement: ValidDeclaration): string | undefined {
    let category: string | undefined;
    this.parseTags(statement, {
      docsCategory: (comment) => (category = comment || ''),
    });
    return normalizeForUrlPart(category);
  }

  /**
   * Type guard for the types of statement which can ge processed by the doc generator.
   */
  private isValidDeclaration(
    statement: ts.Statement,
  ): statement is ValidDeclaration {
    return (
      ts.isInterfaceDeclaration(statement) ||
      ts.isTypeAliasDeclaration(statement) ||
      ts.isClassDeclaration(statement) ||
      ts.isEnumDeclaration(statement) ||
      ts.isFunctionDeclaration(statement) ||
      ts.isVariableStatement(statement)
    );
  }

  /**
   * Determines if a declaration should be excluded from documentation (private/internal)
   */
  private isPrivateOrInternal(statement: ValidDeclaration): boolean {
    // Check if the declaration has an @internal or @private JSDoc tag
    let isInternal = false;
    let isPrivate = false;
    this.parseTags(statement, {
      internal: () => (isInternal = true),
      private: () => (isPrivate = true),
    });

    if (isInternal || isPrivate) {
      return true;
    }

    // Check if declaration name starts with underscore (private by convention)
    let title: string;
    if (ts.isVariableStatement(statement)) {
      title = statement.declarationList.declarations[0].name.getText();
    } else {
      title = statement.name ? statement.name.getText() : 'anonymous';
    }

    if (title.startsWith('_') || title.startsWith('#')) {
      return true;
    }

    // Check for private modifier on class members
    if (
      ts.isClassDeclaration(statement) ||
      ts.isInterfaceDeclaration(statement)
    ) {
      const hasModifiers = (
        node: any,
      ): node is { modifiers: NodeArray<Modifier> } =>
        Array.isArray(node.modifiers);

      if (hasModifiers(statement)) {
        const modifiers = statement.modifiers.map((m) => m.getText());
        if (modifiers.includes('private')) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Determines if a declaration is exported and should be included in documentation
   */
  private isExported(statement: ValidDeclaration): boolean {
    // Check for export modifier
    if (ts.canHaveModifiers(statement)) {
      const modifiers = ts.getModifiers(statement);
      if (modifiers?.some((mod) => mod.kind === ts.SyntaxKind.ExportKeyword)) {
        return true;
      }
    }

    // Check if it's a default export
    if (ts.isExportAssignment(statement)) {
      return true;
    }

    // For variable statements, check if any of the declarations are exported
    if (ts.isVariableStatement(statement)) {
      // Check if the variable statement itself has export modifier
      if (ts.canHaveModifiers(statement)) {
        const modifiers = ts.getModifiers(statement);
        if (
          modifiers?.some((mod) => mod.kind === ts.SyntaxKind.ExportKeyword)
        ) {
          return true;
        }
      }
    }

    // Check if the declaration is in an export declaration or export assignment
    const parent = statement.parent;
    if (ts.isSourceFile(parent)) {
      // Look for export statements in the same source file that reference this declaration
      const sourceFile = parent;
      const declarationName = this.getDeclarationName(statement);

      if (declarationName) {
        // Check for named exports like: export { SomeName }
        for (const stmt of sourceFile.statements) {
          if (
            ts.isExportDeclaration(stmt) &&
            stmt.exportClause &&
            ts.isNamedExports(stmt.exportClause)
          ) {
            for (const exportElement of stmt.exportClause.elements) {
              const exportedName = exportElement.name.getText();
              if (exportedName === declarationName) {
                return true;
              }
            }
          }
        }
      }
    }

    return false;
  }

  /**
   * Gets the name of a declaration for export checking
   */
  private getDeclarationName(statement: ValidDeclaration): string | undefined {
    if (ts.isVariableStatement(statement)) {
      return statement.declarationList.declarations[0]?.name?.getText();
    } else if (statement.name) {
      return statement.name.getText();
    }
    return undefined;
  }

  /**
   * Parses the Node's JSDoc tags and invokes the supplied functions against any matching tag names.
   */
  private parseTags<T extends ts.Node>(
    node: T,
    tagMatcher: { [tagName: string]: (tagComment: string) => void },
  ): void {
    const jsDocTags = ts.getJSDocTags(node);
    for (const tag of jsDocTags) {
      const tagName = tag.tagName.text;
      if (tagMatcher[tagName]) {
        tagMatcher[tagName](this.tagCommentText(tag));
      }
    }
  }

  /**
   * Ensure all the code examples use the unix-style line separators.
   */
  private formatExampleCode(example: string = ''): string {
    return (
      '\n\n*Example*\n\n' + addCodeBlockIfNeeded(example.replace(/\r/g, ''))
    );
  }

  /**
   * TypeScript from v3.5.1 interprets all '@' tokens in a tag comment as a new tag. This is a problem e.g.
   * when a plugin includes in its description some text like "install the @commandkit/some-plugin package". Here,
   * TypeScript will interpret "@commandkit" as a JSDoc tag and remove it and all remaining text from the comment.
   *
   * The solution is to replace all escaped @ tokens ("\@") with a replacer string so that TypeScript treats them
   * as regular comment text, and then once it has parsed the statement, we replace them with the "@" character.
   *
   * Similarly, '/*' is interpreted as end of a comment block. However, it can be useful to specify a globstar
   * pattern in descriptions and therefore it is supported as long as the leading '/' is escaped ("\/").
   */
  private replaceEscapedTokens(content: string): string {
    return content
      .replace(/\\@/g, this.atTokenPlaceholder)
      .replace(/\\\/\*/g, this.commentBlockEndTokenPlaceholder);
  }

  /**
   * Restores "@" and "/*" tokens which were replaced by the replaceEscapedTokens() method.
   */
  private restoreTokens(content: string): string {
    return content
      .replace(new RegExp(this.atTokenPlaceholder, 'g'), '@')
      .replace(new RegExp(this.commentBlockEndTokenPlaceholder, 'g'), '/*');
  }
}
