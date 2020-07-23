# nx-sparse-checkout

Tool to use sparse checkout in big monorepos created using Nrwl/nx, inspired by
[KwintenP](https://github.com/KwintenP)'s [nx-etc](https://github.com/KwintenP/nx-etc).

Tested to work with the following [nrwl/nx](https://github.com/nrwl/nx) versions:

- 8
- 9
- 10

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
