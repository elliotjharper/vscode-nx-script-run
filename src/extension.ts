import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { readNxProjectTargets } from './read-nx-project-targets';
import { NxProject, readNxProjects } from './read-nx-projects';
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
            // step 0:
            //  Show a message stating that we are looking for nx projects.
            //  Keep that message open until we have analysed the monorepo and presented a list.

            // A vscode window can be kept open until a promise resolves.
            // To utilise this, building a promise manually and assigning the resolve callback as dissmissLoadingMessage.
            let dismissLoadingMessage: (_: unknown) => void = (_: unknown) => {
                throw new Error(
                    'dismissLoadingMessage was never re assigned?' +
                        ' Expected to capture the resolve function of loadingPromise'
                );
            };
            const loadingPromise = new Promise((resolve, reject) => {
                dismissLoadingMessage = resolve;
            });
            vscode.window.withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: 'Looking for nx projects...',
                    cancellable: false,
                },
                async (progress) => {
                    // Automatically dismisses when this async function completes
                    await loadingPromise;
                }
            );
            // end of step 0

            const nxRootDir = await findNxRootDir();

            /**
             * step 1: read the projects and allow picking of a project
             *
             * step 2: read the targets for that project and allow picking
             */

            let projects: NxProject[];
            try {
                projects = await readNxProjects(nxRootDir);
            } catch (err) {
                vscode.window.showInformationMessage(`Failed to read nx projects. ${err}`);
                return;
            } finally {
                dismissLoadingMessage!(undefined);
            }

            const selectedProject = await vscode.window.showQuickPick(
                projects.map((p) => ({
                    label: p.name,
                    project: p,
                })),
                { placeHolder: 'Select an NX project...' }
            );

            if (!selectedProject) {
                return;
            }

            const selectedTarget = await vscode.window.showQuickPick(
                readNxProjectTargets(selectedProject.project.projectJsonPath),
                { placeHolder: `Reading targets for ${selectedProject.project.name}...` }
            );

            if (!selectedTarget) {
                return;
            }

            const activeTerminal = vscode.window.activeTerminal;
            if (activeTerminal) {
                activeTerminal.show();
                activeTerminal.sendText(`cd "${nxRootDir}"`);
                activeTerminal.sendText(`nx run ${selectedProject.project.name}:${selectedTarget}`);
            } else {
                vscode.window.showInformationMessage('No active terminal. Exiting...');
            }
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
