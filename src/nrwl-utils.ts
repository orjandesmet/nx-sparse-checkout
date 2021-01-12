import { NxJson, readNxJson, readWorkspaceJson } from '@nrwl/workspace';
import { getProjectRoots } from '@nrwl/workspace/src/command-line/shared';
import { } from '@nrwl/workspace/src/command-line/utils';
import { createProjectGraph } from '@nrwl/workspace/src/core/project-graph';
import { ProjectGraphNode, ProjectType } from '@nrwl/workspace/src/core/project-graph/project-graph-models';

const nxJson: NxJson = readNxJson();
const workspaceJson = readWorkspaceJson();
const projectGraph = createProjectGraph(workspaceJson, nxJson);
export const projectNodes = Object.values(projectGraph.nodes);
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

export const findProject = (projectName: string) => {
  return projectNodes.find(p => p.name === projectName && isValidProject(p));
}

export const isValidProject = (project: ProjectGraphNode) => {
  return !!project.data && project.type !== 'npm'
}

export const isProject = (projectName: string) => {
    return !!findProject(projectName);
}

export const getExcludedProjectRoots = (projectNames: string[]) => {
    const excludedProjects = projectNames.length ? projectNodes.filter(p => isProject(p.name) && !projectNames.includes(p.name)).map(p => p.name) : [];
    return getProjectRoots(excludedProjects);
}

export const findApp = (projectName: string) => {
    return projectNodes.find(p => p.name === projectName && isApp(p));
}

export const findAppLike = (projectName: RegExp) => {
  return projectNodes.find(p => projectName.test(p.name) && isApp(p));
}

export const isApp = (project: ProjectGraphNode) => {
  return project.type === ProjectType.app;
}

export const isE2e = (project: ProjectGraphNode) => {
  return project.type === ProjectType.e2e;
}

export const isLib = (project: ProjectGraphNode) => {
  return project.type === ProjectType.lib;
}