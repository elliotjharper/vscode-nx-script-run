import * as vscode from 'vscode';
import { runCommandLineScript } from './run-command-line-script';
import { readObjectFromCommandOutput } from './read-nx-json-output';

export interface IProjectConfiguration {
    name: string;
    projectType: string;
    targets: Map<string, object>;
    configurations: Map<string, object>;
}

export async function readNxProjectTargets(project: string): Promise<string[]> {
    // vscode.window.showInformationMessage(`Reading targets for ${project}`);

    const projectConfigJson = await runCommandLineScript(`nx show project ${project}`);

    const projectConfig = readObjectFromCommandOutput<IProjectConfiguration>(projectConfigJson);

    const targets = Object.keys(projectConfig.targets);

    return targets.sort();
}
