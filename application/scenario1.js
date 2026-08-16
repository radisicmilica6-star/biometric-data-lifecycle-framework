'use strict';

const grpc = require("@grpc/grpc-js");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
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
// 10. HASH BIOMETRIJSKIH PODATAKA
// ======================================================

function createHash(data) {
    return crypto
        .createHash("sha256")
        .update(data)
        .digest("hex");
}

// ======================================================
// 11. SCENARIO 1
// USPEŠNA BIOMETRIJSKA TRANSAKCIJA
// ======================================================

async function main() {

    try {

        console.log("Fabric connection established.");

        console.log("");
        console.log("==========================================");
        console.log("SCENARIO 1");
        console.log("Successful biometric transaction");
        console.log("==========================================");

        const biometricId = "BIO001";
        const employeeId = "EMP001";
        const transactionId = "TX001";

        const biometricData =
            "AUTHORIZED-USER-behavior-profile";

        const templateHash =
            createHash(biometricData);

        console.log("");
        console.log("Biometric ID:", biometricId);
        console.log("Employee ID:", employeeId);
        console.log("Transaction ID:", transactionId);

        console.log("");
        console.log("Generated biometric template hash:");
        console.log(templateHash);

        console.log("");
        console.log("Submitting financial transaction...");

        const result = await contract.submit(
            "ProcessFinancialTransaction",
            {
                arguments: [
                    biometricId,
                    employeeId,
                    transactionId,
                    templateHash,
                    "1500"
                ],

                endorsingOrganizations: [
                    "Org1MSP",
                    "Org2MSP"
                ]
            }
        );

        const resultText = result.toString();

        console.log("");
        console.log("==========================================");
        console.log("BLOCKCHAIN TRANSACTION COMPLETED");
        console.log("==========================================");

        console.log("");
        console.log("Transaction result:");
        console.log(resultText);

        console.log("");
        console.log("==========================================");
        console.log("SECURITY DECISION");
        console.log("==========================================");

        console.log("Transaction decision: ALLOW");
        console.log("Reason: Biometric verification successful");
        console.log("Status: TRANSACTION ACCEPTED");

    } catch (error) {

        console.error("");
        console.error("==========================================");
        console.error("TRANSACTION ERROR");
        console.error("==========================================");

        console.error(error);

    } finally {

        gateway.close();
        client.close();

    }
}

// ======================================================
// 12. POKRETANJE APLIKACIJE
// ======================================================

main().catch(error => {

    console.error("FATAL ERROR:", error);

    process.exit(1);

});