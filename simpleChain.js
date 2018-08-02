const level = require('level');
const SHA256 = require('crypto-js/sha256');
const to = require('to2');
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
    this.addBlock(new Block("Genesis block"));
  }

  addBlock(newBlock) {
	// TODO: get height
    newBlock.height = this.getBlockchainHeight();
    newBlock.time = new Date().getTime().toString().slice(0, -3);

    if (newBlock.height > 0) {
      newBlock.previousBlockHash = this.getBlock(newBlock.height - 1).hash;
    }

    newBlock.hash = SHA256(newBlock).toString();

    log.put(newBlock.height, newBlock, err => {
      if (err) return console.error(err);
    });
  }
  

  getBlockchainHeight() {
    let height = 0;
    log.createReadStream().on('data', () => {
      height++;
    });
    return height;
  }

  // get block
  getBlock(blockHeight) {
    let height = 0;
    log.createReadStream()
		.pipe(to.obj((row, enc, next) => {
      		if (blockHeight === parseInt(row.key)) {
        		return console.log(row);
      		}
      		height++;
    		}))
  }

  // validate block
  validateBlock(blockHeight) {
    // get block object
    let block = this.getBlock(blockHeight);
    // get block hash
    let blockHash = block.hash;
    // remove block hash to test block integrity
    block.hash = '';
    // generate block hash
    let validBlockHash = SHA256(JSON.stringify(block)).toString();
    // Compare
    if (blockHash === validBlockHash) {
      return true;
    } else {
      console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
      return false;
    }
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

// Values should not be returned. Make no sense to return, logging is enought

// TODO: Genesis block persist as the first block in the blockchain using LevelDB

// TODO: addblock() save into levelDB
// console.log(blockchain.addBlock('Test block'));
// TODO: validateBlock() function to validate a block stored within levelDB

// TODO: validateChain() function to validate blockchain stored within levelDB

// TODO: getBlock() function retrieves a block by block heigh within the LevelDB chain.
// console.log(blockchain.getBlock(0));

// TODO: getBlockHeight() function retrieves current block height within the LevelDB chain.
// console.log(blockchain.getBlockchainHeight());

// TODO: get list of all blocks
blockchain.list();
