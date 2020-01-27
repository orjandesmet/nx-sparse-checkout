import { ProjectType } from '@nrwl/workspace/src/core/project-graph';
import { cyan, green, magenta, red, yellow } from 'colors';
import { ConfirmQuestion, prompt } from 'inquirer';
import * as yargs from 'yargs';
import { checkoutInteractive } from './interactive-checkout';
import { isProject, projectNodes } from './nrwl-utils';

const good = green;
const bad = magenta;
const goodAccent = cyan;
const badAccent = red;

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
}): ConfirmQuestion => {
    const message = `Did you mean the app ${messageTo} instead of ${messageFrom}`;

    return {
        type: 'confirm',
        name: `${from}:${to}`,
        message,
        default: true
    };
}

const suggestAppInsteadOfE2e = (projectName: string): ConfirmQuestion => {
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

const suggestAppInsteadOfLib = (projectName: string): ConfirmQuestion => {
    const splittedName = projectName.split('-');
    const possibleApps = splittedName
        .slice(1)
        .map((_, i) => {
            const copy = splittedName.concat();
            copy.splice(i + 1, 0, 'fe');
            return copy.join('-');
        })
        .map(possibleName => projectNodes.find(p => p.name === possibleName && p.type === ProjectType.app))
        .filter(possibleApp => !!possibleApp);
    if (possibleApps.length) {
        const possibleName = possibleApps[0].name;
        return createConfirmQuestion({
            from: projectName,
            to: possibleName,
            messageFrom: `${bad(projectName)}`,
            messageTo: `${good(possibleName.slice(0, possibleName.indexOf('fe-')))}${goodAccent('fe-')}${good(
                possibleName.slice(possibleName.indexOf('fe-') + 3)
            )}`
        });
    } else {
        return null;
    }
}

function generateDidYouMeanQuestions(projectNames: string[]) {
    return projectNames
        .map(projectName => projectNodes.find(p => p.name === projectName))
        .map(project => {
            switch (project.type) {
                case ProjectType.e2e: {
                    return suggestAppInsteadOfE2e(project.name);
                }
                case ProjectType.lib: {
                    return suggestAppInsteadOfLib(project.name);
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
            console.log(yellow('The following names are not found as projects:'), nonExistingProjectNames);
            console.log(yellow('Going interactive...'));
        }
        return await checkoutInteractive(args, existingProjectNames, terms);
    } else {
        return await prompt(generateDidYouMeanQuestions(existingProjectNames)).then(answers => {
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