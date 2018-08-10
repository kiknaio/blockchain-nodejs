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
    log.createReadStream()
      .on('data', () => height++)
      .on('close', async () => {
        newBlock.height = height;

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
      });
  }

  async getBlockHeight() {
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
        console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
        return false;
      }

    })


    // // get block object
    // let block = this.getBlock(blockHeight);
    // // get block hash
    // let blockHash = block.hash;
    // // remove block hash to test block integrity
    // block.hash = '';
    // // generate block hash
    // let validBlockHash = SHA256(JSON.stringify(block)).toString();
    // // Compare
    // if (blockHash === validBlockHash) {
    //   return true;
    // } else {
    //   console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
    //   return false;
    // }
  }

  // Validate blockchain
  validateChain() {
    let errorLog = [];
    for (var i = 0; i < this.chain.length - 1; i++) {
      // validate block
      if (!this.validateBlock(i)) errorLog.push(i);
      // compare blocks hash link
      let blockHash = this.chain[i].hash;
      let previousHash = this.chain[i + 1].previousBlockHash;
      if (blockHash !== previousHash) {
        errorLog.push(i);
      }
    }
    if (errorLog.length > 0) {
      console.log('Block errors = ' + errorLog.length);
      console.log('Blocks: ' + errorLog);
    } else {
      console.log('No errors detected');
    }
  }

  list() {
    log.createReadStream()
      .pipe(to.obj((row, enc, next) => {
        console.log(row);
        next();
      }))
  }
}

const blockchain = new Blockchain();

// Create new block
// blockchain.addBlock('Luka Kiknadze');

// TODO: validateBlock() function to validate a block stored within levelDB
// blockchain.validateBlock(1);

// TODO: validateChain() function to validate blockchain stored within levelDB
blockchain.validateChain();

// List blocks
// blockchain.list();

// GET Block
// (async () =>
//   console.log(await blockchain.getBlock(0)))()

// GET Blockchain length
// (async () =>
//   console.log(await blockchain.getBlockHeight()))();