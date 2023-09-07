import { CollectionResponse } from '../collection';
import Layout from '../layout';
import Page from '../page';
import { SiteResponse } from '../site';
import { ASTAttribute, ASTConditionalNode, ASTContentNode, ASTDoctypeNode, ASTElementNode, ASTNode, ASTTextNode, ASTVariableNode, ASTCommentNode } from '../types';

interface ExportEngineOptions {
    sourceBasePath: string;
    exportBasePath: string;
    siteResponse: SiteResponse;
}

export interface FileExport {
    pathname: string;
    contents: string;
}

export default class ExportEngine {
    options: ExportEngineOptions;
    constructor(options: ExportEngineOptions) {
        this.options = options;
    }

    staticDirectory() : string {
        throw new Error('Not yet implemented');
    }

    engineConfig() : FileExport {
        throw new Error('Not yet implemented');
    }

    cloudCannonConfig() : FileExport {
        throw new Error('Not yet implemented');
    }

    exportLayout(layout : Layout, collection : CollectionResponse, collectionKey : string) : FileExport {
        throw new Error('Not yet implemented');
    }

    exportCollectionItem(item : Page, collection : CollectionResponse, collectionKey : string) : FileExport {
        throw new Error('Not yet implemented');
    }

    renderAST(tree : ASTNode[]) : string {
        return tree.map((node) => {
            switch (node.type) {
                case 'doctype':
                    return this.renderDoctype(node);
                case 'element':
                    return this.renderElement(node);
                case 'text':
                    return this.renderText(node);
                case 'comment':
                    return this.renderComment(node);
                case 'variable':
                    return this.renderVariable(node);
                case 'conditional':
                    return this.renderConditional(node);
                case 'content':
                    return this.renderContent(node);
                default:
                    break;
            }
            throw new Error(`${node.type} render: not yet implemented`);
        }).join('');
    }

    renderDoctype(doctype: ASTDoctypeNode) : string {
        return `<!DOCTYPE ${doctype.value}>`;
    }

    renderAttributes(attrs: ASTAttribute[]) : string {
        if (attrs.length === 0) {
            return '';
        }

        return ` ${attrs.map((attr) => {
            if (attr.type === 'variable-attribute') {
                throw new Error('Not yet implemented');
            }
            return [
                attr.name,
                `"${attr.value}"`
            ].join('=')
        }).join(' ')}`;
    }

    renderElement(element: ASTElementNode) : string {
        return `<${element.name}${this.renderAttributes(element.attrs)}>${this.renderAST(element.children)}</${element.name}>`;
    }

    renderText(text: ASTTextNode) : string {
        return text.value;
    }

    renderComment(text: ASTCommentNode) : string {
        return `<!-- ${text.value} -->`;
    }

    renderVariable(node: ASTVariableNode) : string {
        throw new Error('Variable render not yet implemented');
    }

    renderConditional(node: ASTConditionalNode) : string {
        throw new Error('Conditional render not yet implemented');
    }

    renderContent(node: ASTContentNode) : string {
        throw new Error('Content render not yet implemented');
    }
}