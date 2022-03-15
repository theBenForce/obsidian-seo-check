import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
// @ts-ignore
import { Researcher, Paper } from 'yoastseo';
import { SeoCheckResults } from './modals/seoCheckResults';
import { DEFAULT_SETTINGS, SeoCheckSettings, SeoCheckSettingTab } from './settings';
// Remember to rename these classes and interfaces!

import showdown from 'showdown';


export default class SeoCheckPlugin extends Plugin {
	settings: SeoCheckSettings;

	async onload() {
		await this.loadSettings();

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText('Status Bar Text');

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'seo-check',
			name: 'SEO Check',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const conv = new showdown.Converter();
				const paper = new Paper(conv.makeHtml(editor.getValue()), {
					keyword: "lambda",
				});
			
				const researcher = new Researcher(paper);
				console.log(researcher);
				console.log('Available Researches', researcher.getAvailableResearches());
				const researches = Object.keys(researcher.getAvailableResearches());

				for (const key of researches) {
					console.log(key, researcher.getResearch(key));
				}
				// TODO: Run SEO analysis
				new SeoCheckResults(this.app).open();
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SeoCheckSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
