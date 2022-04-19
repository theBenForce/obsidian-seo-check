import { App, Modal } from 'obsidian';

export class SeoCheckResults extends Modal {
	constructor(app: App, private results: Array<any>) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.innerHTML = this.results.map(r => `<div>${r.text}</div>`).join("\n");
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}