'use strict';

const grpc = require("@grpc/grpc-js");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { connect, signers } = require("@hyperledger/fabric-gateway");

// ======================================================
// 1. PATH DO ORG1
// ======================================================

const orgPath = path.resolve(
    __dirname,
    "../fabric-network/organizations/peerOrganizations/org1.example.com"
);

const usersPath = path.join(orgPath, "users");

const userDir = fs.readdirSync(usersPath).find(name =>
    name.includes("User1@org1.example.com")
);

if (!userDir) {
    throw new Error("User1 certificate directory not found.");
}

const userMspPath = path.join(usersPath, userDir, "msp");

// ======================================================
// 2. CERTIFICATE
// ======================================================

const signcertsPath = path.join(userMspPath, "signcerts");

const certFile = fs.readdirSync(signcertsPath).find(name =>
    name.endsWith(".pem")
);

if (!certFile) {
    throw new Error("User1 certificate file not found.");
}

const certPath = path.join(signcertsPath, certFile);

// ======================================================
// 3. PRIVATE KEY
// ======================================================

const keyDir = path.join(userMspPath, "keystore");

const keyFile = fs.readdirSync(keyDir).find(name =>
    name.endsWith("_sk") || name.endsWith(".pem")
);

if (!keyFile) {
    throw new Error("User1 private key not found.");
}

const keyPath = path.join(keyDir, keyFile);

// ======================================================
// 4. TLS CERTIFICATE PEER0 ORG1
// ======================================================

const tlsCertPath = path.join(
    orgPath,
    "peers",
    "peer0.org1.example.com",
    "tls",
    "ca.crt"
);

// ======================================================
// 5. UČITAVANJE CERTIFIKATA
// ======================================================

const cert = fs.readFileSync(certPath);
const privateKeyPem = fs.readFileSync(keyPath);
const tlsRootCert = fs.readFileSync(tlsCertPath);

// ======================================================
// 6. PRIVATE KEY
// ======================================================

const privateKey = crypto.createPrivateKey({
    key: privateKeyPem,
    format: "pem"
});

const signer = signers.newPrivateKeySigner(privateKey);

// ======================================================
// 7. GRPC CONNECTION
// ======================================================

const client = new grpc.Client(
    "localhost:7051",
    grpc.credentials.createSsl(tlsRootCert),
    {
        "grpc.ssl_target_name_override": "peer0.org1.example.com"
    }
);

// ======================================================
// 8. FABRIC GATEWAY
// ======================================================

const gateway = connect({
    client,

    identity: {
        mspId: "Org1MSP",
        credentials: cert
    },

    signer
});

// ======================================================
// 9. NETWORK I CHAINCODE
// ======================================================

const network = gateway.getNetwork("mychannel");
const contract = network.getContract("biometric");

// ======================================================
// 10. SCENARIO 3
// ZATVARANJE BANKARSKOG RAČUNA
// I BRISANJE BIOMETRIJSKIH PODATAKA
// ======================================================

async function main() {

    try {

        console.log("Fabric connection established.");

        console.log("");
        console.log("==========================================");
        console.log("SCENARIO 3");
        console.log("Bank account closure");
        console.log("==========================================");

        // ==================================================
        // Podaci korisnika
        // ==================================================

        const biometricId = "BIO003";
        const employeeId = "EMP003";
        const requestId = "REQ003";

        console.log("");
        console.log("Biometric ID:", biometricId);
        console.log("Employee ID:", employeeId);
        console.log("Account closure request:", requestId);

        // ==================================================
        // ZATVARANJE RAČUNA
        // ==================================================

        console.log("");
        console.log("Processing bank account closure request...");

        console.log("");
        console.log(
            "Deleting biometric data associated with the closed account..."
        );

        // ==================================================
        // BRISANJE BIOMETRIJSKOG ZAPISA
        // ==================================================

        const result = await contract.submit(
            "DeleteBiometric",
            {
                arguments: [
                    biometricId,
                    employeeId,
                    requestId
                ],

                endorsingOrganizations: [
                    "Org1MSP",
                    "Org2MSP"
                ]
            }
        );

        // ==================================================
        // REZULTAT
        // ==================================================

        const resultText = result.toString();

        console.log("");
        console.log("==========================================");
        console.log("BLOCKCHAIN TRANSACTION COMPLETED");
        console.log("==========================================");

        console.log("");
        console.log("Deletion confirmation:");
        console.log(resultText);

        console.log("");
        console.log("==========================================");
        console.log("ACCOUNT CLOSURE RESULT");
        console.log("==========================================");

        console.log("Account closure status: COMPLETED");
        console.log("Biometric data status: DELETED");
        console.log("Deletion confirmation: RECORDED");
        console.log("Biometric data itself is not stored on the blockchain.");

    } catch (error) {

        console.error("");
        console.error("==========================================");
        console.error("ACCOUNT CLOSURE ERROR");
        console.error("==========================================");

        console.error(error);

    } finally {

        gateway.close();
        client.close();

    }
}

// ======================================================
// 11. POKRETANJE APLIKACIJE
// ======================================================

main().catch(error => {

    console.error("FATAL ERROR:", error);

    process.exit(1);

});