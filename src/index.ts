#!/usr/bin/env node
import * as colors from 'colors';
import * as yargs from 'yargs';
import { doCheckout, isGitStatusClean, isSparseCheckoutEnabled } from './git-utils';
import { checkoutInteractive } from './interactive-checkout';
import { checkoutProjectsByName } from './named-checkout';
import { concatWithDependencies, getExcludedProjectRoots } from './nrwl-utils';

async function runNxSparseCheckout(args: yargs.Arguments) {
  if (!isGitStatusClean()) {
    console.log(colors.red('You have unstaged changes. Stash or commit them first.'));
    process.exit(1);
  }
  if (!isSparseCheckoutEnabled()) {
    console.log(
      `${colors.red('Sparse checkout is not enabled. Enable it with ')}'${colors.yellow(
        'git config core.sparseCheckout true'
      )}${colors.red("'")}`
    );
    process.exit(1);
  }

  let selectedProjectNames: string[] = [];
  if (args._.length) {
    selectedProjectNames = await checkoutProjectsByName(args);
  } else if (args.i || !args.a) {
    selectedProjectNames = await checkoutInteractive(args);
  }
  const projectNames = concatWithDependencies(selectedProjectNames);
  const excludedProjectRoots = getExcludedProjectRoots(projectNames)

  if (projectNames.length) {
    console.log(
      `Checking out the following ${colors.green('' + projectNames.length)} projects:\n${projectNames
        .map(projectName => '* ' + colors.cyan(projectName))
        .join('\n')}`
    );
  } else {
    console.log('Checking out everything.');
  }
  doCheckout(excludedProjectRoots);
}

const argv = yargs
  .usage('Utility')
  .command('$0', 'Select projects to be checked out. This utility uses git\'s sparse checkout feature. Enable it using `git config core.sparseCheckout true`.' +
    '\nUsage:\n\n npx nx-sparse-checkout [-i|--interactive] [-a|--all]|[project-names ...] ', yargsOptions => yargsOptions)
  .boolean(['i', 'a'])
  .alias('i', 'interactive')
  .alias('a', 'all')
  .describe({ i: 'run interactive', a: 'select all' })
  .help('help').argv;

runNxSparseCheckout(argv);
