export interface DocumentOptions {
    pathname: string;
    data: Record<string, any>,
    content: string
}

export interface ASTTextNode {
    type: 'text';
    value: string;
}

export interface ASTCommentNode {
    type: 'comment';
    value: string;
}

export interface ASTVariableNode {
    type: 'variable';
    reference: string;
}

export interface ASTConditionalNode {
    type: 'conditional';
    reference: string;
    child: ASTNode;
}

export interface ASTDoctypeNode {
    type: 'doctype';
    value: string;
}

export interface ASTContentNode {
    type: 'content';
}

export interface ASTStaticAttribute {
    type: 'attribute';
    name: string;
    value: string;
}

export interface ASTVariableAttribute {
    type: 'variable-attribute';
    name: string;
    reference: string;
}

export interface ASTConditionalAttribute {
    type: 'conditional-attribute';
    name: string;
    reference: string;
}

export interface ASTMarkdownNode {
    type: 'markdown-variable';
    reference: string;
}

export interface ASTLoopNode {
    type: 'loop';
    reference: string;
    template: ASTNode;
}

export interface ASTElementNode {
    type: 'element';
    name: string;
    attrs: ASTAttribute[];
    children: ASTNode[]
}

export type ASTAttribute = ASTVariableAttribute | ASTStaticAttribute | ASTConditionalAttribute;
export type ASTNode = ASTTextNode | ASTDoctypeNode | ASTElementNode | ASTVariableNode | ASTConditionalNode | ASTContentNode | ASTCommentNode | ASTMarkdownNode | ASTLoopNode;
