import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';

export interface SeoCheckSettings {
	mySetting: string;
}

export const DEFAULT_SETTINGS: SeoCheckSettings = {
	mySetting: 'default'
}


interface IPlugin extends Plugin {
  settings: SeoCheckSettings;
  saveSettings: () => Promise<void>;
}

export class SeoCheckSettingTab extends PluginSettingTab {
	plugin: IPlugin;

	constructor(app: App, plugin: IPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
