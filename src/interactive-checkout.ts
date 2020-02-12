import * as colors from 'colors';
import * as inquirer from 'inquirer';
import * as yargs from 'yargs';
import { isApp, isLib, isValidProject, projectNodes } from './nrwl-utils';

function generateChoiceGroup(name: string, projects: {type: string, name: string}[], selected: string[], all: boolean) {
    return !projects.length
        ? []
        : [
            new inquirer.Separator(name),
            ...projects.map(p => ({
                name: `${p.type}\t${p.name}`,
                value: p.name,
                checked: all || selected.includes(p.name)
            }))
        ];
}

const generateSelectionList = (selected: string[] = [], terms: string[] = [], all: boolean = false): inquirer.CheckboxQuestion[] => {
    let regExp: RegExp;
    try {
        regExp = new RegExp(terms.concat(selected).join('|'), 'i');
    } catch {}
    let selectableProjects = projectNodes.filter(p => (!terms.length || !regExp || regExp.test(p.name)) && isValidProject(p));
    if (!selectableProjects.length) {
        selectableProjects = projectNodes.filter(isValidProject);
    }

    const apps = selectableProjects.filter(p => isApp(p));
    const libs = selectableProjects.filter(p => isLib(p));
    const others = selectableProjects.filter(p => !isApp(p) && !isLib(p));

    return [{
        type: 'checkbox',
        message: 'Select the projects to checkout',
        name: 'projectNames',
        choices: [
            ...generateChoiceGroup('Applications', apps, selected, all),
            ...generateChoiceGroup('Libraries', libs, selected, all),
            ...generateChoiceGroup('Other', others, selected, all)
        ]
    }];
}

export const checkoutInteractive = async (args: yargs.Arguments, selected: string[] = [], terms: string[] = []): Promise<string[]> => {
    const selectionList = generateSelectionList(selected, terms, !!args.a);
    return await inquirer.prompt(selectionList).then(answers => {
        if (answers.projectNames.length === projectNodes.length) {
            return [];
        } else if (!!answers.projectNames.length) {
            return answers.projectNames;
        } else {
            console.log(colors.yellow('Nothing selected, try again!'));
            return checkoutInteractive(args, selected, terms);
        }
    });
}