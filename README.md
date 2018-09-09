# Blockchain with Node.js

This is experimental projects. Probably there will be bugs and feel free to contribute.

Libraries used:
- LevelDB - for storing the information
- crypto-js - used for hashing




- === Create new block ===
```
blockchain.addBlock('test');
```

- === Validate block ===
```
blockchain.validateBlock(2);
```

- === Validate chainz of blockz 🥕 ===
```
blockchain.validateChain();
```

- === List blocks ===
```
blockchain.list();
```

- === GET Block ===
```
(async () =>
  console.log(await blockchain.getBlock(5)))()
```

- === GET Blockchain length ===
```
(async () =>
  console.log(await blockchain.getBlockHeight()))();
```