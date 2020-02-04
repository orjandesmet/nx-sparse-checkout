import { ProjectType } from '@nrwl/workspace/src/core/project-graph/project-graph-models';
import * as colors from 'colors';
import * as inquirer from 'inquirer';
import * as yargs from 'yargs';
import { checkoutInteractive } from './interactive-checkout';
import { isProject, projectNodes } from './nrwl-utils';

const good = colors.green;
const bad = colors.magenta;
const goodAccent = colors.cyan;
const badAccent = colors.red;

const createConfirmQuestion = ({
    from,
    to,
    messageFrom = from,
    messageTo = to
}: {
    from: string;
    to: string;
    messageFrom?: string;
    messageTo?: string;
}): inquirer.ConfirmQuestion => {
    const message = `Did you mean the app ${messageTo} instead of ${messageFrom}`;

    return {
        type: 'confirm',
        name: `${from}:${to}`,
        message,
        default: true
    };
}

const suggestAppInsteadOfE2e = (projectName: string): inquirer.ConfirmQuestion | null => {
    const possibleName = projectName.slice(0, -4);
    const possibleApp = projectNodes.find(p => p.name === possibleName && p.type === ProjectType.app);
    return possibleApp ?
        createConfirmQuestion({
            from: projectName,
            to: possibleName,
            messageFrom: `${bad(possibleName)}${badAccent('-e2e')}`,
            messageTo: good(possibleName)
        }) : null;
}

const suggestAppInsteadOfLib = (projectName: string): inquirer.ConfirmQuestion | null => {
    const splittedName = projectName.split('-');
    const possibleApps = splittedName
        .slice(1)
        .map((_, i) => {
            try {
                return new RegExp(splittedName.concat().slice(0, - (i + 1)).join('-'), 'i');
            } catch {
                return null;
            }
        })
        .filter(possibleName => !!possibleName)
        .map(possibleName => projectNodes.find(p => possibleName!.test(p.name) && p.type === ProjectType.app))
        .filter(possibleApp => !!possibleApp);
    if (possibleApps.length) {
        const possibleName = possibleApps[0]!.name;
        return createConfirmQuestion({
            from: projectName,
            to: possibleName,
            messageFrom: `${bad(projectName)}`,
            messageTo: `${good(possibleName)}`
        });
    } else {
        return null;
    }
}

function generateDidYouMeanQuestions(projectNames: string[]) {
    return projectNames
        .map(projectName => projectNodes.find(p => p.name === projectName))
        .map(project => {
            switch (project!.type) {
                case ProjectType.e2e: {
                    return suggestAppInsteadOfE2e(project!.name);
                }
                case ProjectType.lib: {
                    return suggestAppInsteadOfLib(project!.name);
                }
                default:
                    return null;
            }
        })
        .filter(question => !!question);
}

export const checkoutProjectsByName = async (args: yargs.Arguments): Promise<string[]> => {

    const projects = args._.map(projectName => ({ projectName, exists: isProject(projectName) }));
    const existingProjectNames = projects.filter(p => p.exists).map(p => p.projectName);
    const nonExistingProjectNames = projects.filter(p => !p.exists).map(p => p.projectName);

    const terms = nonExistingProjectNames
        .map(projectName => projectName.split('-'))
        .reduce((acc, current) => acc.concat(current), [])
        .filter(term => !!term);
    if (terms.length || args.i) {
        if (!args.i) {
            console.log(colors.yellow('The following names are not found as projects:'), nonExistingProjectNames);
            console.log(colors.yellow('Going interactive...'));
        }
        return await checkoutInteractive(args, existingProjectNames, terms);
    } else {
        return await inquirer.prompt(generateDidYouMeanQuestions(existingProjectNames)).then(answers => {
            Object.keys(answers)
                .filter(key => !!answers[key])
                .forEach(concattedNames => {
                    const [from, to] = concattedNames.split(':');
                    existingProjectNames.splice(existingProjectNames.indexOf(from), 1, to);
                });
            return existingProjectNames;
        });
    }
}