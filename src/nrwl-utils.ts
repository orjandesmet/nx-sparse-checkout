import { getProjectNodes, getProjectRoots } from '@nrwl/workspace/src/command-line/shared';
import { readNxJson, readWorkspaceJson } from '@nrwl/workspace/src/core/file-utils';
import { createProjectGraph, ProjectType } from '@nrwl/workspace/src/core/project-graph';
import { NxJson } from '@nrwl/workspace/src/core/shared-interfaces';

const nxJson: NxJson = readNxJson();
const workspaceJson = readWorkspaceJson();
export const projectNodes = getProjectNodes(workspaceJson, nxJson);
const projectGraph = createProjectGraph();
export const dependencies = projectGraph.dependencies;

export const concatWithDependencies = (projectNames: string[]): string[] => {
  return projectNames
    .filter(projectName => !!projectName && isProject(projectName))
    .map(projectName =>
      [projectName]
        .concat(projectNodes.filter(p => p.name === projectName + '-e2e').map(p => p.name))
        .concat(concatWithDependencies(dependencies[projectName].map(dependency => dependency.target)))
    )
    .reduce((all, current) => all.concat(current), [])
    .filter((item, index, array) => array.indexOf(item) === index);
}

export const isProject = (projectName: string) => {
    return projectNodes.some(p => p.name === projectName && p.data && p.type !== 'npm');
}

export const getExcludedProjectRoots = (projectNames: string[]) => {
    const excludedProjects = projectNames.length ? projectNodes.filter(p => isProject(p.name) && !projectNames.includes(p.name)).map(p => p.name) : [];
    return getProjectRoots(excludedProjects);
}

export const findApp = (projectName: string) => {
    return projectNodes.find(p => p.name === projectName && p.type === ProjectType.app);
}