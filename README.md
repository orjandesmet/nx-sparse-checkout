# nx-sparse-checkout

Tool to use sparse checkout in big monorepos created using Nrwl/nx, inspired by
[KwintenP](https://github.com/KwintenP)'s [nx-etc](https://github.com/KwintenP/nx-etc).

Tested to work with the following [nrwl/nx](https://github.com/nrwl/nx) versions:

- 8
- 9
- 10
- 11 (only nx-sparse-checkout@^2.0.0)
- 13 (only nx-sparse-checkout@^3.0.0)
- 14 (only nx-sparse-checkout@^14.0.0) -> Aligned version numbers

It lists all apps and libraries in the workspace using nx's technologies. Dependent projects are automatically added to the list of projects to check out, based on nx's dependency graph.

## Installation

```sh
npm install -D nx-sparse-checkout
yarn add -D nx-sparse-checkout
```

## Usage

```sh
./node_modules/.bin/nx-sparse-checkout
npx nx-sparse-checkout
yarn nx-sparse-checkout
```

### Parameters

All these parameters are optional

|Parameter|Effect|
|-|-|
|--interactive (**-i**)|Starts interactive mode (in combination with other parameters)|
|--all (**-a**)|Checks out all projects. Selects all projects in interactive mode|
|names...|Checks out those names of projects. If a name is not found, interactive mode is started|

![Example Commands](./readme-assets/example.gif)

## Contributing

1. Install packages in example
2. Remove package nx-sparse-checkout
3. Update version number of nx-sparse-checkout in package.json
4. Do changes in nx-sparse-checkout code
5. pnpm build
6. pnpm pack
7. In example, add devDependency "npm install -D ../nx-sparse-checkout-....tgz"
8. Test
9. If it works, remove beta tag from package.json
10. pnpm build
11. npm publish
12. Update dependency in example to published version
13. Create PR