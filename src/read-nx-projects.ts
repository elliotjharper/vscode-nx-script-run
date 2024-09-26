import { readProjectsCommandOutput } from './read-nx-json-output';
import { runCommandLineScript } from './run-command-line-script';

function hasToString(value: unknown): value is { toString: () => string } {
    const spec = value as any;

    if (typeof spec?.toString === 'function') {
        return true;
    }

    return false;
}

export async function readNxProjects(nxRootDir: string): Promise<string[]> {
    // vscode.window.showInformationMessage(`Reading projects`);

    const showProjectsCommand = 'nx show projects --json';
    try {
        const projectsCommandOutput = await runCommandLineScript(showProjectsCommand, nxRootDir);

        const projects = readProjectsCommandOutput(projectsCommandOutput);

        return projects.sort();
    } catch (err) {
        console.error(err);

        let errMessage = '';

        if (hasToString(err)) {
            errMessage = err.toString();
        }

        throw new Error(
            'Failed to use nx CLI to list projects. \n' +
                'Ensure nx is installed globally and locally. \n' +
                'Ensure version is at least v16. \n' +
                'Expected the outcome of this command to be JSON: \n' +
                showProjectsCommand +
                '\n' +
                'Error: \n' +
                errMessage
        );
    }
}
