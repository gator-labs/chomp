# chomp
TODO: Overall purpose blurb - KZ

## Deployment details
- [gator-chomp.vercel.app](https://gator-chomp.vercel.app/)
- Funds address: 

## Getting started

Prerequisites:
- Install Docker
- Create a [Dynamic](https://www.dynamic.xyz/) account
- Solana RPC like Helius

```sh
# install dependencies
$ yarn

# setup environment variables
$ cp .env.example .env

# start DB
$ docker compose -f db-compose.yml

# run migrations
$ yarn prisma:migrate

# start the app
$ yarn dev
```

## Architecture 
diagram how things work together (database diagram, higher level systems, how our database interacts with the treasury wallet + user wallet) - Marvin

## Roadmap/next steps: 
Turning it into a native app on SAGA, etc 

## TODO

- [ ] Finish README
- [ ] Import Isaac's python code
