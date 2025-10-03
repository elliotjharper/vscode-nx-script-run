import * as fs from 'fs';

export interface IProjectConfiguration {
    name: string;
    projectType?: string;
    targets?: { [key: string]: any };
    configurations?: { [key: string]: any };
}

export async function readNxProjectTargets(projectJsonPath: string): Promise<string[]> {
    try {
        // Read the project.json file directly
        const content = fs.readFileSync(projectJsonPath, 'utf8');
        const projectConfig: IProjectConfiguration = JSON.parse(content);

        // Extract target names from the targets object
        const targets = projectConfig.targets ? Object.keys(projectConfig.targets) : [];

        return targets.sort();
    } catch (err) {
        console.error(`Failed to read targets from ${projectJsonPath}:`, err);
        throw new Error(
            `Failed to read project targets from ${projectJsonPath}. \n` +
                'Ensure the file exists and contains valid JSON. \n' +
                'Error: \n' +
                err
        );
    }
}
