import { readObjectFromCommandOutput } from './read-nx-json-output';
import { runCommandLineScript } from './run-command-line-script';

export interface IProjectConfiguration {
    name: string;
    projectType: string;
    targets: Map<string, object>;
    configurations: Map<string, object>;
}

export async function readNxProjectTargets(nxRootDir: string, project: string): Promise<string[]> {
    // vscode.window.showInformationMessage(`Reading targets for ${project}`);

    const projectConfigJson = await runCommandLineScript(`nx show project ${project}`, nxRootDir);

    const projectConfig = readObjectFromCommandOutput<IProjectConfiguration>(projectConfigJson);

    const targets = Object.keys(projectConfig.targets);

    return targets.sort();
}
