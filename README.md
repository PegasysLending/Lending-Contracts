
## Setup

Follow the next steps to setup the repository:

- Create an enviroment file named `.env` and fill the next enviroment variables

```
# Mnemonic, only first address will be used
MNEMONIC=""


```

## Markets configuration

The configurations related with the Pegasys Markets are located at `markets` directory. You can follow the `IPegasysConfiguration` interface to create new Markets configuration or extend the current Pegasys configuration.

Each market should have his own Market configuration file, and their own set of deployment tasks, using the Pegasys market config and tasks as a reference.

You can follow this document https://docs.google.com/document/d/1aE82Tk0n21Or0px6Kif58rgEW2PssfTcHjUniXfe2pg/edit

## Compile

```
npm run compile
```

## Unit Test (hardhat local)
```
npm run test
```

## Support other network
In the hardhat.config.ts file, set the main network to Rollux main/test.

## Deploy
```
# Current main is tanenbaum.rollux
npm run pegasys:main:full
```

## Unit Test (deployed)
**It is necessary to test the price setting when using the Supra Oracle.**

Before running this command, make sure the contract of the Supra Oracle is set.
```
npm run test-pegasys-oracle
```
