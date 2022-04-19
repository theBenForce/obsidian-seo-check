import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
// @ts-ignore
import { Researcher, Paper, SeoAssessor } from 'yoastseo';
import { SeoCheckResults } from './modals/seoCheckResults';
import { DEFAULT_SETTINGS, SeoCheckSettings, SeoCheckSettingTab } from './settings';
// @ts-ignore
import Jed from 'jed';
// Remember to rename these classes and interfaces!

import showdown from 'showdown';
import matter from 'gray-matter';
import { clearTimeout, setTimeout } from 'timers';

let updateDebounceTimer: NodeJS.Timeout | undefined;
const DEBOUNCE_MS = 200;

const i18n = new Jed({
	domain: "js-text-analysis",
	locale_data: { // eslint-disable-line camelcase
		"js-text-analysis": {
			"": {},
		},
	},
});

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
				const pageData = matter(editor.getValue());
				const conv = new showdown.Converter();
				const paper = new Paper(conv.makeHtml(pageData.content), {
					keyword: pageData.data.keyword,
					title: pageData.data.title,
					description: pageData.data.description,
				});
				const seoAccessor = new SeoAssessor(i18n, {});
				seoAccessor.assess(paper);
				
				// TODO: Run SEO analysis
				new SeoCheckResults(this.app, seoAccessor.results).open();
			}
		});

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const fleschReadingScore = this.addStatusBarItem();
		const keywordDensity = this.addStatusBarItem();

		this.registerEvent(this.app.workspace.on('editor-change', (editor) => {

			const onTimeout = () => {
				
				const pageData = matter(editor.getValue());
				const researcher = getSeoStats(pageData);

				// https://yoast.com/flesch-reading-ease-score/
				console.info(researcher.getResearch("calculateFleschReading"));
				const calculateFleschReading: number = researcher.getResearch("calculateFleschReading");
				fleschReadingScore.setText(`Flesch: ${calculateFleschReading.toFixed(1)}`);

				if (pageData.data.keyword) {
					if (!keywordDensity.isShown()) {
						keywordDensity.show();
					}
					console.info(researcher.getResearch("getKeywordDensity"));
					const getKeywordDensity: number = researcher.getResearch("getKeywordDensity");
					keywordDensity.setText(`KW Density: ${getKeywordDensity.toFixed(1)}`);
				} else if (keywordDensity.isShown()) {
					keywordDensity.hide();
				}

				if (researcher.hasResearch("passiveVoice")) {
					console.info(researcher.getResearch("passiveVoice"));
				}
			};
			

			if (updateDebounceTimer) {
				clearTimeout(updateDebounceTimer);
				updateDebounceTimer = undefined;
			}

			updateDebounceTimer = setTimeout(onTimeout, DEBOUNCE_MS);
		}))

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


function getSeoStats(pageData: matter.GrayMatterFile<string>) {
	const conv = new showdown.Converter();
	const paper = new Paper(conv.makeHtml(pageData.content), {
		keyword: pageData.data.keyword,
		title: pageData.data.title,
		description: pageData.data.description,
	});

	const researcher = new Researcher(paper);
	return researcher;
}

