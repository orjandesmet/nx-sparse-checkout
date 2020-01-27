import { ProjectGraphNode } from '@nrwl/workspace/src/core/project-graph';
import { ProjectType } from '@nrwl/workspace/src/core/project-graph/project-graph-models';
import * as colors from 'colors';
import * as inquirer from 'inquirer';
import * as yargs from 'yargs';
import { projectNodes } from './nrwl-utils';

function generateChoiceGroup(name: string, projects: ProjectGraphNode[], selected: string[], all: boolean) {
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
    let selectableProjects = projectNodes.filter(p => !terms.length || !regExp || regExp.test(p.name));
    if (!selectableProjects.length) {
        selectableProjects = projectNodes;
    }

    const apps = selectableProjects.filter(p => p.type === ProjectType.app);
    const libs = selectableProjects.filter(p => p.type === ProjectType.lib);
    const others = selectableProjects.filter(p => ![ProjectType.app.toString(), ProjectType.lib.toString(), 'npm'].includes(p.type));

    return [{
        type: 'checkbox',
        message: 'select something',
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