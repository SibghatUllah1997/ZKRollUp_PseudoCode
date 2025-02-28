import crypto from"crypto"; // Node.js built-in crypto library

// Function to simulate signing a transaction (returns a hashed signature)
function signTransaction(userPrivateKey, txData) {
    return crypto.createHmac("sha256", userPrivateKey).update(txData).digest("hex");
}

// Simulated user accounts with private keys
const users = {
    "Alice": { privateKey: "secret_key_1", publicKey: "Alice" },
    "Bob": { privateKey: "secret_key_2", publicKey: "Bob" },
};

// Simulated Transactions (each signed by the sender)
const tx1 = { sender: "Alice", data: "Send 5 tokens to Bob" };
tx1.signature = signTransaction(users["Alice"].privateKey, tx1.data);

const tx2 = { sender: "Bob", data: "Send 2 tokens to Alice" };
tx2.signature = signTransaction(users["Bob"].privateKey, tx2.data);

// Simulating a block containing transactions
let txBlock = { id: 101, transactions: [tx1, tx2] };

class Validator {
    constructor(id) {
        this.id = id;
    }

    // Function to verify transaction signatures
    verifyTransaction(tx) {
        if (!users[tx.sender]) return false; // Sender must exist

        const expectedSignature = signTransaction(users[tx.sender].privateKey, tx.data);
        return expectedSignature === tx.signature; // Check if the signature matches
    }

    // Approve block only if all transactions have valid signatures
    approveBlock(block) {
        console.log(`Validator ${this.id} checking block ${block.id}...`);

        for (let tx of block.transactions) {
            if (!this.verifyTransaction(tx)) {
                console.log(`❌ Validator ${this.id} rejected block ${block.id}: Invalid transaction signature.`);
                return { validatorId: this.id, approved: false };
            }
        }

        console.log(`✅ Validator ${this.id} approves block ${block.id}`);
        return { validatorId: this.id, approved: true };
    }
}

class FFSNetwork {
    constructor(validators) {
        this.validators = validators;
        this.finalizedBlocks = [];
    }

    processBlock(block) {
        console.log(`\n🔄 Processing block ${block.id}...\n`);

        // Validators check the transactions
        let approvals = this.validators.map(validator => validator.approveBlock(block));
        let approvedCount = approvals.filter(a => a.approved).length;

        // Finalize block if 2/3+ validators approve
        if (approvedCount >= (this.validators.length * 2) / 3) {
            console.log(`✅ Block ${block.id} finalized!`);
            this.finalizedBlocks.push(block);
            this.submitStateToL1(block);
        } else {
            console.log(`❌ Block ${block.id} failed to reach consensus.`);
        }
    }

    submitStateToL1(block) {
        console.log(`📤 Posting final state of Block ${block.id} to L1...`);
        setTimeout(() => {
            console.log(`✅ L1 updated with Block ${block.id} state root!`);
        }, 1000);
    }
}

// Simulating a validator network
let validators = [new Validator(1), new Validator(2), new Validator(3)];
let ffsNetwork = new FFSNetwork(validators);

// Process and finalize transactions
ffsNetwork.processBlock(txBlock);