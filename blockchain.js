const level = require('level');
const SHA256 = require('crypto-js/sha256');
const to = require('to2');
const boxen = require('boxen');
const log = level('log.db', { valueEncoding: 'json' });


class Block {
  constructor(data) {
    this.hash = "",
    this.height = 0,
    this.body = data,
    this.time = Date.now(),
    this.previousBlockHash = ""
  }
}

class Blockchain {
  constructor() {
    let height = 0;
    log.createReadStream()
      .on('data', () => height++)
      .on('close', () => {
        if (height === 0) {
          console.log(boxen('Genesis block created', { padding: 1}));
          this.addBlock("Genesis block");
        }
      })
  }

  async addBlock(data) {
    const newBlock = new Block(data);
    let height = 0;

    newBlock.time = new Date().getTime().toString().slice(0, -3);
    newBlock.body = data;

    // Get height
    newBlock.height = await this.getBlockHeight();

    if (newBlock.height > 0) {
      const previousBlock = await this.getBlock(newBlock.height - 1);
      newBlock.previousBlockHash = previousBlock.hash;
    }
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

    log.put(newBlock.height, newBlock, err => {
      if (err) return console.error(err);
      log.get(newBlock.height, (err, result) => {
        if(err) return console.error(err);
        console.log(result);
      })
    });
  }

  getBlockHeight() {
    let height = 0;
    return new Promise((resolve, reject) => {
      log.createReadStream()
        .on('data', () => height++)
        .on('end', () => resolve(height))
    })
  }

  getBlock(blockHeight) {
    return new Promise((resolve, reject) => {
      log.get(blockHeight, (err, result) => {
        if(err) return console.error(err);
        resolve(result);
      })
    })
  }

  // validate block
  validateBlock(blockHeight) {
    log.get(blockHeight, (err, block) => {
      if(err) return console.error(err);
      const blockHash = block.hash;
      block.hash = '';
      const validateBlockHash = SHA256(JSON.stringify(block)).toString();

      if (blockHash === validateBlockHash) {
        console.log(`Block #${blockHeight} is valid block`);
        return true;
      } else {
        console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validateBlockHash);
        return false;
      }

    })

  }

  async validateChain() {
    const height = await this.getBlockHeight();
    const errorLog = [];

    for (let i=0; i < height; i++) {
      log.get(i, (err, block) => {
        if (err) return console.error(err);
        console.log(block)
      })
    }

    // log.createReadStream()
    //   .on('data', async block => {
    //     if(block.value.height > 0) {
    //       // Validate block
    //       if(this.validateBlock(block.value.height)) errorLog.push(block.value.height);
    //
    //       // Check DAG
    //       const previousBlock = await this.getBlock(block.value.height - 1);
    //       const previousBlockHash = previousBlock.hash;
    //       if(previousBlockHash !== block.value.previousBlockHash) {
    //         errorLog.push(block.value.height - 1);
    //       }
    //     }
    //   }).on('close', () => {
    //     if (errorLog.length > 0) {
    //       console.log('Error in blocks', errorLog)
    //     } else {
    //       console.log(boxen('Congratulations! Blockchain is valid', { padding: 1 }))
    //     }
    //   })

  }

  async list() {
    const height = await this.getBlockHeight();

    for (let i=0; i < height; i++) {
      log.get(i, (err, block) => {
        if (err) return console.error(err);
        console.log(block)
      })
    }
  }
}

const blockchain = new Blockchain();

// === Create new block ===
// blockchain.addBlock('Luka Kiknadze');

// === Validate block ===
// blockchain.validateBlock(1);

// === Validate chainz of blockz 🥕 ===
// blockchain.validateChain();

// === List blocks ===
// blockchain.list();

// === GET Block ===
// (async () =>
//   console.log(await blockchain.getBlock(0)))()

// === GET Blockchain length ===
// (async () =>
//   console.log(await blockchain.getBlockHeight()))();