import * as fs from 'fs';
import * as vscode from 'vscode';

interface ProjectConfig {
    name: string;
    [key: string]: any;
}

export async function readNxProjects(nxRootDir: string): Promise<string[]> {
    try {
        // Use VS Code's findFiles API to search for project.json files
        const projectFiles = await vscode.workspace.findFiles(
            '**/project.json',
            '**/node_modules/**'
        );

        const projects: string[] = [];

        for (const file of projectFiles) {
            try {
                // Read the project.json file
                const content = fs.readFileSync(file.fsPath, 'utf8');
                const projectConfig: ProjectConfig = JSON.parse(content);

                // Extract the project name
                if (projectConfig.name) {
                    projects.push(projectConfig.name);
                }
            } catch (fileErr) {
                // Skip files that can't be parsed as JSON or don't have a name property
                console.warn(`Could not parse project.json file at ${file.fsPath}:`, fileErr);
            }
        }

        return projects.sort();
    } catch (err) {
        console.error(err);

        throw new Error(
            'Failed to read NX projects from project.json files. \n' +
                'Ensure your workspace contains NX projects with project.json files. \n' +
                'Error: \n' +
                err
        );
    }
}
