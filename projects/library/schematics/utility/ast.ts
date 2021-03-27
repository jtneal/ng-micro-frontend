import { strings } from '@angular-devkit/core';
import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { Change, InsertChange, NoopChange } from '@schematics/angular/utility/change';
import * as ts from 'typescript';

export function getSource(host: Tree, sourcePath: string): ts.SourceFile {
  return ts.createSourceFile(sourcePath, host.read(sourcePath)?.toString() || '', ts.ScriptTarget.Latest, true);
}

export function isKind(node: ts.Node, kind: ts.SyntaxKind): boolean {
  return node.kind === kind;
}

export function nodeByKind(kind: ts.SyntaxKind): (node: ts.Node) => boolean {
  return (node: ts.Node) => isKind(node, kind);
}

export function getNodeByKind(nodes: ts.Node[], kind: ts.SyntaxKind): ts.Node | undefined {
  return nodes.find(nodeByKind(kind));
}

export function getNodeIndexByKind(nodes: ts.Node[], kind: ts.SyntaxKind): number {
  return nodes.findIndex(nodeByKind(kind));
}

export function filterNodesByKind(nodes: ts.Node[], kind: ts.SyntaxKind): ts.Node[] {
  return nodes.filter(nodeByKind(kind));
}

export function getClassNode(nodes: ts.Node[]): ts.Node {
  const classNode = getNodeByKind(nodes, ts.SyntaxKind.ClassKeyword);

  if (!classNode) {
    throw new SchematicsException('Could not find a class node!');
  }

  if (!classNode.parent) {
    throw new SchematicsException('Could not find a parent node!');
  }

  return classNode;
}

export function getSiblings(node: ts.Node): ts.Node[] {
  const siblings = node.parent.getChildren();
  const nodeIndex = siblings.indexOf(node);

  return siblings.slice(nodeIndex);
}

export function getSuccessor(node: ts.Node, searchPath: ts.SyntaxKind[]): ts.Node | undefined {
  let children = node.getChildren();
  let next: ts.Node | undefined;

  for (const kind of searchPath) {
    next = getNodeByKind(children, kind);

    if (!next) {
      return;
    }

    children = next.getChildren();
  }

  return next;
}

export function updateConstructor(nodes: ts.Node[], classPath: string, serviceNames: string[]): Change {
  const constructorNode = getNodeByKind(nodes, ts.SyntaxKind.Constructor);

  if (constructorNode) {
    return addConstructorArgument(classPath, constructorNode, serviceNames);
  } else {
    return createConstructor(classPath, nodes, serviceNames);
  }
}

export function addConstructorArgument(classPath: string, constructorNode: ts.Node, serviceNames: string[]): Change {
  let siblings = constructorNode.getChildren();
  const constructorIndex = getNodeIndexByKind(siblings, ts.SyntaxKind.ConstructorKeyword);
  siblings = siblings.slice(constructorIndex);
  const parameterListNode = getNodeByKind(siblings, ts.SyntaxKind.SyntaxList);

  if (!parameterListNode) {
    throw new SchematicsException('Constructor is missing a parameter list!');
  }

  const parameterNodes = parameterListNode.getChildren();
  const services = [];

  for (const serviceName of serviceNames) {
    const paramNode = parameterNodes.find((p) => {
      const typeNode = getSuccessor(p, [ts.SyntaxKind.TypeReference, ts.SyntaxKind.Identifier]);

      if (!typeNode) {
        return false;
      }

      return typeNode.getText() === serviceName;
    });

    if (!paramNode) {
      services.push(serviceName);
    }
  }

  if (!services.length) {
    // There is already a constructor argument for all services
    return new NoopChange();
  }

  let toAdd: string;
  let position: number;

  // Does the constructor have existing arguments?
  if (parameterNodes.length) {
    toAdd = services.map((s) => `,\n    private readonly ${strings.camelize(s)}: ${strings.classify(s)}`).join();
    position = parameterNodes[parameterNodes.length - 1].end;
  } else {
    toAdd = services.map((s) => `private readonly ${strings.camelize(s)}: ${strings.classify(s)}`).join(',\n    ');
    position = parameterListNode.pos;
  }

  return new InsertChange(classPath, position, toAdd);
}

export function createConstructor(classPath: string, nodes: ts.Node[], serviceNames: string[]): Change {
  const classNode = getClassNode(nodes);
  let siblings = getSiblings(classNode);
  const classIdentifierNode = getNodeByKind(siblings, ts.SyntaxKind.Identifier);

  if (!classIdentifierNode) {
    throw new SchematicsException('Could not find class identifier!');
  }

  siblings = siblings.slice(getNodeIndexByKind(siblings, ts.SyntaxKind.FirstPunctuation));

  const listNode = getNodeByKind(siblings, ts.SyntaxKind.SyntaxList);

  if (!listNode) {
    throw new SchematicsException(`Expected first class to have a body!`);
  }

  const toAdd = `
  public constructor(
    ${serviceNames.map((s) => `private readonly ${strings.camelize(s)}: ${strings.classify(s)}`).join(',\n    ')}
  ) { }
`;

  return new InsertChange(classPath, listNode.pos + 1, toAdd);
}

export function updateLifecycleHook(nodes: ts.Node[], componentPath: string, hook: string, toAdd: string, args = ''): Change {
  const methodNodes = filterNodesByKind(nodes, ts.SyntaxKind.MethodDeclaration);
  const hookIndex = methodNodes.findIndex((m) => m.getText().includes(hook));
  let code: string;
  let position: number;

  if (hookIndex >= 0) {
    if (methodNodes[hookIndex].getText().includes(toAdd)) {
      return new NoopChange();
    }

    if (args && !methodNodes[hookIndex].getText().includes(args)) {
      throw new SchematicsException(`Lifecycle hook ${hook} already exists!`);
    }

    code = `${toAdd}  `;
    position = methodNodes[hookIndex].getEnd() - 1;
  } else {
    if (methodNodes[0]) {
      code = `public ${hook}(${args}): void {${toAdd}  }\n\n  `;
      position = methodNodes[0].getStart();
    } else {
      const constructorNode = getNodeByKind(nodes, ts.SyntaxKind.Constructor);

      if (constructorNode) {
        code = `\n\n  public ${hook}(${args}): void {${toAdd}  }`;
        position = constructorNode.getEnd();
      } else {
        code = `\n  public ${hook}(${args}): void {${toAdd}  }\n\n`;
        const classNode = getClassNode(nodes);
        let siblings = getSiblings(classNode);

        siblings = siblings.slice(getNodeIndexByKind(siblings, ts.SyntaxKind.FirstPunctuation));

        const listNode = getNodeByKind(siblings, ts.SyntaxKind.SyntaxList);

        if (!listNode) {
          throw new SchematicsException('Expected first class to have a body!');
        }

        position = listNode.pos + 1;
      }
    }
  }

  return new InsertChange(componentPath, position, code);
}

export function addImplements(nodes: ts.Node[], classPath: string, interfaceName: string): Change {
  const classNode = getClassNode(nodes);
  const siblings = getSiblings(classNode);
  const classIdentifierNode = getNodeByKind(siblings, ts.SyntaxKind.Identifier);

  if (!classIdentifierNode) {
    throw new SchematicsException(`Could not find class identifier in ${classPath}!`);
  }

  const implementsNode = getNodeByKind(
    siblings.slice(0, getNodeIndexByKind(siblings, ts.SyntaxKind.FirstPunctuation)),
    ts.SyntaxKind.SyntaxList,
  );

  if (implementsNode) {
    if (implementsNode.getText().includes(interfaceName)) {
      return new NoopChange();
    }

    return new InsertChange(classPath, implementsNode.getEnd(), `, ${interfaceName} `);
  }

  return new InsertChange(classPath, classIdentifierNode.getEnd() + 1, `implements ${interfaceName} `);
}

export function insertAfterImports(nodes: ts.Node[], classPath: string, code: string): Change {
  const imports = filterNodesByKind(nodes, ts.SyntaxKind.ImportDeclaration);
  const toAdd = `\n\n${code}`;

  if (!imports.length) {
    return new InsertChange(classPath, 0, toAdd);
  }

  const last = imports[imports.length - 1];

  return new InsertChange(classPath, last.getEnd(), toAdd);
}
