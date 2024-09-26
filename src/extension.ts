import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { readNxProjectTargets } from './read-nx-project-targets';
import { readNxProjects } from './read-nx-projects';
import { getWorkspacePath } from './run-command-line-script';

/**
 * Recursive function that returns dir that contains a matching file.
 * Searches given dir and if a match is not found it moves up a folder until it either finds a match or has reached the root of the drive.
 */
export function findDirThatContainsFile(dir: string, file: string): string {
    const filePath = path.join(dir, file);

    if (fs.existsSync(filePath)) {
        return dir;
    }

    const parentDir = path.dirname(dir);

    if (parentDir === dir) {
        throw new Error(
            'There was no parent dir available. Must have reached the root of the drive.'
        );
    }

    return findDirThatContainsFile(parentDir, file);
}

export async function findNxRootDir(): Promise<string> {
    const nxFileName = 'nx.json';
    const workspaceRootNxResult = await vscode.workspace.findFiles(`/${nxFileName}`, null, 1);
    const workspaceRootPath = getWorkspacePath();
    if (workspaceRootNxResult.length >= 1) {
        return workspaceRootPath;
    }

    return findDirThatContainsFile(workspaceRootPath, nxFileName);
}

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand(
        'elltg-nx-script-run.runNxScript',
        async () => {
            const nxRootDir = await findNxRootDir();

            /**
             * step 1: read the projects and allow picking of a project
             *
             * step 2: read the targets for that project and allow picking
             */

            let selectedNxProject: string | undefined;
            try {
                selectedNxProject = await vscode.window.showQuickPick(readNxProjects(nxRootDir), {
                    placeHolder: 'Reading nx projects...',
                });
            } catch (err) {
                vscode.window.showInformationMessage(`Failed to read nx projects. ${err}`);
                return;
            }

            if (!selectedNxProject) {
                // vscode.window.showInformationMessage(
                //     'You did not select an nx project. Exiting...'
                // );
                return;
            }

            const selectedTarget = await vscode.window.showQuickPick(
                readNxProjectTargets(nxRootDir, selectedNxProject),
                { placeHolder: `Reading targets for ${selectedNxProject}...` }
            );

            if (!selectedTarget) {
                // vscode.window.showInformationMessage(
                //     'You did not select an nx project target. Exiting...'
                // );
                return;
            }

            const activeTerminal = vscode.window.activeTerminal;
            if (activeTerminal) {
                activeTerminal.show();
                activeTerminal.sendText(`cd "${nxRootDir}"`);
                activeTerminal.sendText(`nx run ${selectedNxProject}:${selectedTarget}`);
            } else {
                vscode.window.showInformationMessage('No active terminal. Exiting...');
            }
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
