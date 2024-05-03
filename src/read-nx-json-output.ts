function countInstancesOf(sampleText: string, searchChar: string): number {
    return sampleText.split('').filter((char) => char === searchChar).length;
}

/**
 * When nx returns output it may also prefix the output with a message stating "its time to update!".
 * This means that the output cannot be parsed as json even if you asked for json with a "--json" switch.
 * This function tries to assert that the output has json in it and pulls that out of the whole string.
 */
export function readProjectsCommandOutput(commandOutput: string): string[] {
    try {
        return JSON.parse(commandOutput) as string[];
    } catch (err) {
        if (countInstancesOf(commandOutput, '[') === 1 && countInstancesOf(commandOutput, ']')) {
            const startIndex = commandOutput.indexOf('[');
            const endIndex = commandOutput.indexOf(']');
            const jsonSubstring = commandOutput.substring(startIndex, endIndex + 1);
            return JSON.parse(jsonSubstring) as string[];
        }
        throw err;
    }
}

export function readObjectFromCommandOutput<T>(commandOutput: string): T {
    try {
        return JSON.parse(commandOutput) as T;
    } catch (err) {
        const startIndex = commandOutput.indexOf('{');
        const jsonSubstring = commandOutput.substring(startIndex, commandOutput.length);
        return JSON.parse(jsonSubstring) as T;
    }
}
