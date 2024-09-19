import * as vscode from 'vscode';
import { readNxProjectTargets } from './read-nx-project-targets';
import { readNxProjects } from './read-nx-projects';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand(
        'elltg-nx-script-run.runNxScript',
        async () => {
            /**
             * step 1: read the projects and allow picking of a project
             *
             * step 2: read the targets for that project and allow picking
             */

            let selectedNxProject: string | undefined;
            try {
                selectedNxProject = await vscode.window.showQuickPick(readNxProjects(), {
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
                readNxProjectTargets(selectedNxProject),
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
                activeTerminal.sendText(`nx run ${selectedNxProject}:${selectedTarget}`);
            } else {
                vscode.window.showInformationMessage('No active terminal. Exiting...');
            }
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
