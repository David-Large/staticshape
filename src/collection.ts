import File from './file';
import { PageContentsConfig } from './helpers/html-parser';
import Document from './document';
import { PageJSON } from './page';

export interface CollectionOptions {
	name: string;
	subPath: string;
	only?: string[] | null | void;
	include?: string[] | null | void;
	exclude?: string[] | null | void;
	content?: PageContentsConfig;
}

export interface CollectionResponse {
	pages: PageJSON[];
	layout: object;
}

export default class Collection {
	options: CollectionOptions;
	files: File[];

	constructor(files: File[], options: CollectionOptions) {
		this.files = files;
		this.options = options;
	}

	async build(): Promise<CollectionResponse> {
		const collectionFiles = this.files.filter((file) => {
			if (!file.isHtml()) {
				return false;
			}

			const { pathname } = file.options;
			if (this.options.only) {
				return this.options.only.includes(pathname);
			}
			if (this.options.include?.includes(pathname)) {
				return true;
			}

			if (this.options.exclude?.includes(pathname)) {
				return false;
			}

			return pathname.startsWith(this.options.subPath);
		});

		const documents = await Promise.all(
			collectionFiles.map(async (file) => {
				const html = await file.read();

				return new Document({
					pathname: file.name(),
					content: html,
					config: {
						content: this.options.content
					}
				});
			})
		);

		if (documents.length === 1) {
			throw new Error('Only 1 html file detected');
		}

		const baseDoc = documents[0];
		console.error(`Comparing ${baseDoc.pathname} and ${documents[1].pathname}`);
		console.error(JSON.stringify(documents[0].layout));
		console.error(JSON.stringify(documents[1].layout));
		let current = baseDoc.diff(documents[1]);
		for (let i = 2; i < documents.length; i++) {
			console.error(`Comparing ${baseDoc.pathname} and ${documents[i].pathname}`);
			const next = baseDoc.diff(documents[i]);

			// Merge the next and current bases
			const base = current.base.merge(next.base);

			// Merge current pages with the next base
			const oldPages = current.pages.map((currentPage) => currentPage.merge(next.base));

			// Merge the next pages with the current base
			const newPages = next.pages.map((newPage) => newPage.merge(current.base));

			// Merge the next and current layouts
			const layout = current.layout.merge(next.layout);

			current = {
				base,
				pages: [...oldPages, ...newPages],
				layout
			};
		}

		return {
			pages: [current.base.toJSON(), ...current.pages.map((page) => page.toJSON())],
			layout: current.layout.toJSON()
		};
	}
}
