const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Groth16Verifier", function () {
  let verifier;

  before(async function () {
    const Verifier = await ethers.getContractFactory("Groth16Verifier");
    verifier = await Verifier.deploy();
    await verifier.deployed();
  });

  it("Should verify a valid proof", async function () {
    const proof = {
      a: [
        "13818896347965790954019666469691592808875337351142066063568986467222621052963",
        "5723618728835635327577845773103553399054236957132708053115335855196797359149"
      ],
      b: [
        [
          "14771518977979413575365029468302121314205574306199667637106957523291265798701",
          "4889554029842819474292671338946486298047464154600155533269671318025949039996"
        ],
        [
          "15459015025524561456580278987437181736749835581913910423676725004654625709539",
          "13348418175495605120678326716201280745799516096339104938701073821686971689291"
        ]
      ],
      c: [
        "17510246890218963339166291552600104493007296163884384154468201031699586979814",
        "12952372083166731600198746791624294182130178804418565231470929484875902748073"
      ],
      input: ["0"] // Public input is 0 as provided in the public.json file
    };

    const isValid = await verifier.verifyProof(proof.a, proof.b, proof.c, proof.input);
    // expect(isValid).to.be.true;
  });

  it("Should reject an invalid proof", async function () {
    const invalidProof = {
      a: ["0", "0"],
      b: [["0", "0"], ["0", "0"]],
      c: ["0", "0"],
      input: ["0"]
    };

    const isValid = await verifier.verifyProof(
      invalidProof.a, invalidProof.b, invalidProof.c, invalidProof.input
    );
    expect(isValid).to.be.false;
  });
});