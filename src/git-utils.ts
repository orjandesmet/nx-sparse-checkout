import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

const SPARSE_CHECKOUT_PATH = '.git/info/sparse-checkout';

export function isGitStatusClean() {
    return execSync('git status -s').toString('utf-8').length === 0;
}

export function isSparseCheckoutEnabled() {
    try {
        return (
            execSync('git config core.sparseCheckout')
                .toString('utf-8')
                .trim() === 'true'
        );
    } catch {
        return false;
    }
}

export function doCheckout(excludeProjectRoots: string[]) {
    const fileContent = excludeProjectRoots.reduce((content, projectRoot) => content + `!/${projectRoot}\n`, `/*\n`);
    writeFileSync(SPARSE_CHECKOUT_PATH, fileContent);
    execSync('git checkout');
}
