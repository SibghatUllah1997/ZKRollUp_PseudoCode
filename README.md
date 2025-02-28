zk-Rollup with Circom, SnarkJS, and Hardhat

A step-by-step guide to implementing and deploying a zk-Rollup in a local Hardhat environment.

📌 Prerequisites

Before getting started, ensure you have the following installed:
	•	Node.js (v16+ recommended)
	•	Hardhat
	•	Rust & Cargo
	•	Circom (for zero-knowledge circuits)
	•	SnarkJS (for proof generation)

🚀 1. Install Dependencies

Install Rust & Cargo

curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

Install Circom

git clone https://github.com/iden3/circom.git
cd circom
git checkout v2.1.6  # Use a stable version
cargo build --release
sudo mv target/release/circom /usr/local/bin/

Verify Circom installation:

circom --version  # Expected output: circom compiler 2.2.1

Install SnarkJS

npm install -g snarkjs

📂 2. Set Up Your zk-Rollup Project

mkdir zkRollup && cd zkRollup
mkdir circuits && cd circuits
touch zkRollup.circom

🔧 3. Create zk-Rollup Circuit

Open circuits/zkRollup.circom and add:

pragma circom 2.0.0;

include "circomlib/circuits/bitify.circom";

template zkRollup() {
    signal input batchHash;
    signal input expectedRoot;
    signal output isValid;

    component eq = IsEqual();
    eq.in[0] <== batchHash;
    eq.in[1] <== expectedRoot;
    isValid <== eq.out;
}

component main = zkRollup();

🔹 What This Does:
	•	Compares batchHash with expectedRoot
	•	Outputs isValid = 1 if they match

🛠 4. Compile the Circuit

cd circuits
circom zkRollup.circom --r1cs --wasm --sym --c

This generates:
	•	zkRollup.r1cs – Constraints file
	•	zkRollup.wasm – WebAssembly for witness computation
	•	zkRollup.sym – Symbolic representation

🔑 5. Generate the Trusted Setup

snarkjs groth16 setup zkRollup.r1cs pot12_final.ptau zkRollup_final.zkey
snarkjs zkey export verificationkey zkRollup_final.zkey verification_key.json

📊 6. Generate Witness & Proof

Create input.json:

{
  "batchHash": "123456789",
  "expectedRoot": "123456789"
}

Generate the witness:

node zkRollup_js/generate_witness.js zkRollup_js/zkRollup.wasm input.json witness.wtns

Generate the proof:

snarkjs groth16 prove zkRollup_final.zkey witness.wtns proof.json public.json

✅ 7. Verify the Proof

snarkjs groth16 verify verification_key.json public.json proof.json

Expected output:

[INFO] snarkJS: OK!

🔗 8. Generate Solidity Verifier

snarkjs zkey export solidityverifier zkRollup_final.zkey verifier.sol

Moves verifier.sol into the contracts/ folder.

🏗 9. Deploy zk-Rollup on Hardhat

Initialize Hardhat

cd ..
npx hardhat init

Install Hardhat Dependencies

npm install --save-dev @nomicfoundation/hardhat-toolbox

Move verifier.sol to contracts/

mv circuits/verifier.sol contracts/

Create contracts/ZKRollup.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./verifier.sol";

contract ZKRollup is Verifier {
    event BatchVerified(uint256 indexed batchHash);

    function verifyBatch(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[1] memory input
    ) public returns (bool) {
        require(verifyProof(a, b, c, input), "Invalid proof");
        emit BatchVerified(input[0]);
        return true;
    }
}

🚀 10. Deploy the zk-Rollup Contract

Compile the Contract

npx hardhat compile

Deploy Script (scripts/deploy.js)

const hre = require("hardhat");

async function main() {
    const ZKRollup = await hre.ethers.getContractFactory("ZKRollup");
    const zkRollup = await ZKRollup.deploy();
    await zkRollup.deployed();

    console.log("ZK Rollup deployed to:", zkRollup.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

Start Hardhat Local Node

npx hardhat node

Deploy Contract to Local Network

npx hardhat run scripts/deploy.js --network localhost

Expected output:

ZK Rollup deployed to: 0x123...

🔎 11. Interact with zk-Rollup

Open Hardhat Console:

npx hardhat console --network localhost

Load the contract:

const [owner] = await ethers.getSigners();
const zkRollup = await ethers.getContractAt("ZKRollup", "0x123..."); // Replace with actual address

Verify the proof:

const proof = require("./proof.json");

const tx = await zkRollup.verifyBatch(proof.pi_a, proof.pi_b, proof.pi_c, proof.publicSignals);
console.log("Proof Verified:", await tx.wait());

Expected output:

Proof Verified: true

🌍 12. Deploy to a Testnet (Optional)

Modify hardhat.config.js

require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: "https://eth-sepolia.alchemyapi.io/v2/YOUR_API_KEY",
      accounts: ["YOUR_PRIVATE_KEY"]
    }
  }
};

Deploy on Sepolia

npx hardhat run scripts/deploy.js --network sepolia


For Local Hardhat test Running

npx hardhat test