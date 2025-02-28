pragma circom 2.1.6;

template zkRollup() {
    signal input batchHash;
    signal input expectedRoot;
    signal output isValid;

    isValid <== batchHash - expectedRoot;
}

component main = zkRollup();