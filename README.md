# Battle INF v1+
This project is a fork of [version 1 of Battle INF](https://github.com/zephren/battle-inf).

Much credit goes to Jason Boone (zephren) for all of the work he put into the original project.

## Goals of this project
This project is meant to extend and fix the original Battle INF, to understand how the original system was designed.

## How to run this project
Clone the repo and then point a web server to the root directory. If you have Node installed, I use http-server:

1. Run `npm install http-server -g` if you don't already have it installed.
2. Run `http-server v1/`.

## What this project fixes
- On the Heroes Action page, the Test functionality now works.
- External resources now load over HTTPS.

## What this project adds
> WIP

## What this project changes
> WIP

## Refactor
A refactor is underway to use TypeScript and React.

1. `npm install`
2. `npm run start:dev` if you want to work with React locally.
3. `npm build` will use webpack to build an output to the dist folder, and then start http-server.
