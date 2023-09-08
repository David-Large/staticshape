import { CollectionResponse } from '../collection';
import { ASTConditionalAttribute, ASTConditionalNode, ASTContentNode, ASTLoopNode, ASTNode, ASTVariableAttribute, ASTVariableNode } from '../types';
import ExportEngine, { FileExport } from './interface';
import { dump } from 'js-yaml';

function renderFrontMatter(data: Record<string, any>) {
    return `---\n${dump(data, {
        noRefs: true,
        sortKeys: true
    })}---`;
}

export default class HugoExportEngine extends ExportEngine {
    staticDirectory() : string {
        return 'static';
    }

    engineConfig() : FileExport {
        return {
            pathname: 'config.toml',
            contents: 'baseURL = \'\''
        }
    }

    cloudCannonConfig() : FileExport {
        return {
            pathname: 'cloudcannon.config.yaml',
            contents: 'todo: true'
        }
    }

    exportLayout(layout : Record<string, any>, collection : CollectionResponse, collectionKey : string) : FileExport {
        return {
            pathname: `layouts/${collectionKey}.html`,
            contents: this.renderAST(layout.tree)
        };
    }

    exportCollectionItem(item : Record<string, any>, collection : CollectionResponse, collectionKey : string) : FileExport {
        const folder = collectionKey !== 'pages'
            ? `${collectionKey}/`
            : ''

        const frontMatter = {
            ...item.data,
            layout: collectionKey
        };

        return {
            pathname: `content/${folder}${item.pathname}`,
            contents: [
                renderFrontMatter(frontMatter),
                this.renderAST(item.content)
            ].join('\n')
        };
    }

    renderVariable(node: ASTVariableNode) : string {
        return `{{ .Params.${node.reference} }}`;
    }

    renderConditional(node: ASTConditionalNode) : string {
        return `{{ if .Params.${node.reference} }}${this.renderASTNode(node.child)}{{ end }}`;
    }

    renderLoop(node: ASTLoopNode) : string {
        return `{{ range .Params.${node.reference} }}${this.renderASTNode(node.template)}{{ end }}`
    }

    renderContent(_node: ASTContentNode) : string {
        // TODO support different render types (markdown vs blocks vs basic)
        return `{{ content }}`; // TODO make this the actual render
    }

    renderVariableAttribute(attr: ASTVariableAttribute | ASTConditionalAttribute) : string {
        return [
            attr.name,
            `"{{ .Params.${attr.reference} }}"`
        ].join('=')
    }

    renderConditionalAttribute(attr: ASTConditionalAttribute) : string {
        return `{{ if .Params.${attr.reference} }}${this.renderVariableAttribute(attr)}{{ end }}`
    }
}