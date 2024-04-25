import * as vscode from 'vscode';
import { runCommandLineScript } from './run-command-line-script';

export async function readNxProjects(): Promise<string[]> {
    vscode.window.showInformationMessage(`Reading projects`);

    const showProjectsCommand = 'nx show projects --json';
    try {
        const projectsJson = await runCommandLineScript(showProjectsCommand);

        const projects = JSON.parse(projectsJson) as string[];

        return projects.sort();
    } catch (err) {
        console.error(err);

        throw new Error(
            'Failed to use nx CLI. ' +
                'Ensure nx is installed globally and locally. ' +
                'Ensure version is at least v16. ' +
                'Ensure global and local versions arent too far diverged.' +
                'To investigate run this command: ' +
                showProjectsCommand
        );
    }
}
