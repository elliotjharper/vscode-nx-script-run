import * as vscode from 'vscode';
import { runCommandLineScript } from './run-command-line-script';
import { readProjectsCommandOutput } from './read-nx-json-output';

export async function readNxProjects(): Promise<string[]> {
    // vscode.window.showInformationMessage(`Reading projects`);

    const showProjectsCommand = 'nx show projects --json';
    try {
        const projectsCommandOutput = await runCommandLineScript(showProjectsCommand);

        const projects = readProjectsCommandOutput(projectsCommandOutput);

        return projects.sort();
    } catch (err) {
        console.error(err);

        throw new Error(
            'Failed to use nx CLI to list projects. ' +
                'Ensure nx is installed globally and locally. ' +
                'Ensure version is at least v16. ' +
                'Expected the outcome of this command to be JSON: ' +
                showProjectsCommand
        );
    }
}
