import { ASTAttribute, ASTNode } from "./types";

interface LayoutOptions {
    tree: ASTNode[]
}

function isEquivalent(first: ASTNode, second: ASTNode) : boolean {
    if (second.type === 'conditional') {
        return isEquivalent(first, second.child);
    }
    
    if (first.type === 'conditional') {
        return isEquivalent(first.child, second);
    }

    if ((first.type === 'text' && second.type === 'variable')
        || (second.type === 'text' && first.type === 'variable')) {
        return true;
    }
    
    if (first.type !== second.type) {
        return false;
    }

    if (first.type === 'doctype' && second.type === 'doctype') {
        return first.value === second.value;
    }
    
    if (first.type === 'variable' && second.type === 'variable') {
        return first.reference === second.reference;
    }
    
    if (first.type === 'text' && second.type === 'text') {
        return first.value === second.value;
    }
    
    if (first.type === 'element' && second.type === 'element') {
        // TODO compare element attributes
        return first.name === second.name;
    }

    return true;
}

function attrsToObject(attrs: ASTAttribute[]): Record<string, ASTAttribute> {
    return attrs.reduce((memo : Record<string, ASTAttribute>, attr : ASTAttribute) : Record<string, ASTAttribute> => {
        memo[attr.name] = attr;
        return memo;
    }, {})
}

function mergeAttributes(first: ASTAttribute[], second: ASTAttribute[]) : ASTAttribute[] {
    const firstAttrs = attrsToObject(first || []);
    const secondAttrs = attrsToObject(second || []);
    const merged = [] as ASTAttribute[];

    Object.keys(firstAttrs).forEach((attrName) => {
        if (!secondAttrs[attrName]) {
            console.log('unhandled extra attr', attrName, firstAttrs[attrName])
            return;
        }

        if (firstAttrs[attrName].type === 'variable-attribute') {
            merged.push(firstAttrs[attrName]);
        } else {
            merged.push(secondAttrs[attrName]);
        }
        delete secondAttrs[attrName];
    });

    Object.keys(secondAttrs).forEach((attrName) => {
        console.log('unhandled extra attr', attrName, secondAttrs[attrName])
    });

    return merged;
}

function mergeTree(firstTree: ASTNode[], secondTree: ASTNode[]) : ASTNode[] {
    let firstPointer = 0;
    let secondPointer = 0;

    const merged = [];
    while (firstPointer < firstTree.length && secondPointer < secondTree.length) {
        const firstRemaining = firstTree.length - firstPointer;
        const secondRemaining = secondTree.length - secondPointer;

        const firstNode = firstTree[firstPointer];
        const secondNode = secondTree[secondPointer];

        if (isEquivalent(firstNode, secondNode)) {
            firstPointer += 1;
            secondPointer += 1;

            if (firstNode.type === 'variable' || firstNode.type === 'conditional') {
                merged.push(firstNode);
            } else if (secondNode.type === 'variable' || secondNode.type === 'conditional') {
                merged.push(secondNode);
            } else if (firstNode.type === 'element' && secondNode.type === 'element') {
                merged.push({
                    ...firstNode,
                    attrs: mergeAttributes(firstNode.attrs, secondNode.attrs),
                    children: mergeTree(firstNode.children, secondNode.children)
                });
            } else {
                merged.push(firstNode);
            }
        } else if (firstRemaining > secondRemaining) {
            merged.push(firstNode);
            firstPointer += 1;
        } else {
            merged.push(secondNode);
            secondPointer += 1;
        }
    }

    while (firstPointer < firstTree.length) {
        const remainingNode = firstTree[firstPointer];
        merged.push(remainingNode);
        firstPointer += 1;
    }

    while (secondPointer < secondTree.length) {
        const remainingNode = secondTree[secondPointer];
        merged.push(remainingNode);
        secondPointer += 1;
    }

    return merged;
}

export default class Layout {
    options: LayoutOptions;

    constructor(options: LayoutOptions) {
        this.options = options;
    }

    merge(other: Layout) : Layout {
        return new Layout({
            ...this.options,
            tree: mergeTree(this.options.tree, other.options.tree)
        });
    }

    toJSON() : object {
        return this.options;
    }
}