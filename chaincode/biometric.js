'use strict';

const { Contract } = require('fabric-contract-api');
const crypto = require('crypto');

class BiometricContract extends Contract {

    // ======================================================
    // 1. REGISTRACIJA BIOMETRIJSKOG ZAPISA
    // ======================================================

    async RegisterBiometric(
        ctx,
        biometricId,
        employeeId,
        templateHash,
        biometricType
    ) {

        const exists =
            await this.BiometricExists(
                ctx,
                biometricId
            );

        if (exists) {
            throw new Error(
                `Biometric record ${biometricId} already exists`
            );
        }

        const timestamp =
            ctx.stub.getTxTimestamp();

        const biometricRecord = {
            biometricId: biometricId,
            employeeId: employeeId,
            templateHash: templateHash,
            biometricType: biometricType,
            timestamp:
                timestamp.seconds.toString()
        };

        await ctx.stub.putState(
            biometricId,
            Buffer.from(
                JSON.stringify(biometricRecord)
            )
        );

        return JSON.stringify(
            biometricRecord
        );
    }


    // ======================================================
    // 2. ČITANJE BIOMETRIJSKOG ZAPISA
    // ======================================================

    async ReadBiometric(
        ctx,
        biometricId
    ) {

        const data =
            await ctx.stub.getState(
                biometricId
            );

        if (!data || data.length === 0) {
            throw new Error(
                `Biometric record ${biometricId} does not exist`
            );
        }

        return data.toString();
    }


    // ======================================================
    // 3. PROVERA POSTOJANJA BIOMETRIJE
    // ======================================================

    async BiometricExists(
        ctx,
        biometricId
    ) {

        const data =
            await ctx.stub.getState(
                biometricId
            );

        return (
            data &&
            data.length > 0
        );
    }


    // ======================================================
    // 4. OBRADA FINANSIJSKE TRANSAKCIJE
    // ======================================================

    async ProcessFinancialTransaction(
        ctx,
        biometricId,
        employeeId,
        transactionId,
        providedTemplateHash,
        amount
    ) {

        const data =
            await ctx.stub.getState(
                biometricId
            );

        if (!data || data.length === 0) {
            throw new Error(
                `Biometric record ${biometricId} does not exist`
            );
        }

        const biometricRecord =
            JSON.parse(
                data.toString()
            );

        const txTimestamp =
            ctx.stub.getTxTimestamp();


        // ==================================================
        // 4.1 PROVERA POVEZANOSTI KORISNIKA I BIOMETRIJE
        // ==================================================

        if (
            biometricRecord.employeeId !==
            employeeId
        ) {

            const securityEvent = {
                eventType:
                    "SUSPICIOUS_ACTIVITY",

                transactionId:
                    transactionId,

                decision:
                    "DENY",

                reason:
                    "Employee identity does not match biometric record",

                timestamp:
                    txTimestamp.seconds.toString()
            };

            await this.RecordSecurityEvent(
                ctx,
                transactionId,
                securityEvent
            );

            return JSON.stringify({
                transactionId:
                    transactionId,

                employeeId:
                    employeeId,

                biometricId:
                    biometricId,

                amount:
                    amount,

                decision:
                    "DENY",

                reason:
                    "Employee identity does not match biometric record",

                timestamp:
                    txTimestamp.seconds.toString()
            });
        }


        // ==================================================
        // 4.2 KONTINUIRANA BIOMETRIJSKA VERIFIKACIJA
        // ==================================================

        const biometricMatch =
            biometricRecord.templateHash ===
            providedTemplateHash;


        // ==================================================
        // 4.3 BIOMETRIJSKI OBRAZAC NE ODGOVARA
        // ==================================================

        if (!biometricMatch) {

            const securityEvent = {

                eventType:
                    "SUSPICIOUS_ACTIVITY",

                transactionId:
                    transactionId,

                decision:
                    "DENY",

                reason:
                    "Behavioral biometric pattern mismatch",

                timestamp:
                    txTimestamp.seconds.toString()
            };

            await this.RecordSecurityEvent(
                ctx,
                transactionId,
                securityEvent
            );

            return JSON.stringify({

                transactionId:
                    transactionId,

                employeeId:
                    employeeId,

                biometricId:
                    biometricId,

                amount:
                    amount,

                decision:
                    "DENY",

                reason:
                    "Behavioral biometric pattern mismatch",

                timestamp:
                    txTimestamp.seconds.toString()
            });
        }


        // ==================================================
        // 4.4 BIOMETRIJA JE VALIDNA
        // ==================================================

        const financialTransaction = {

            transactionId:
                transactionId,

            employeeId:
                employeeId,

            biometricId:
                biometricId,

            amount:
                amount,

            decision:
                "ALLOW",

            timestamp:
                txTimestamp.seconds.toString()
        };

        await ctx.stub.putState(

            `TRANSACTION_${transactionId}`,

            Buffer.from(
                JSON.stringify(
                    financialTransaction
                )
            )
        );

        return JSON.stringify(
            financialTransaction
        );
    }


    // ======================================================
    // 5. EVIDENTIRANJE SECURITY EVENT-A
    // ======================================================

    async RecordSecurityEvent(
        ctx,
        transactionId,
        securityEvent
    ) {

        const eventData =
            JSON.stringify(
                securityEvent
            );

        const eventHash =
            crypto
                .createHash('sha256')
                .update(eventData)
                .digest('hex');

        const blockchainSecurityRecord = {

            eventType:
                securityEvent.eventType,

            transactionId:
                securityEvent.transactionId,

            decision:
                securityEvent.decision,

            reason:
                securityEvent.reason,

            timestamp:
                securityEvent.timestamp,

            eventHash:
                eventHash
        };

        await ctx.stub.putState(

            `SECURITY_${transactionId}`,

            Buffer.from(
                JSON.stringify(
                    blockchainSecurityRecord
                )
            )
        );

        return JSON.stringify(
            blockchainSecurityRecord
        );
    }


    // ======================================================
    // 6. ČITANJE SECURITY EVENT-A
    // ======================================================

    async ReadSecurityEvent(
        ctx,
        transactionId
    ) {

        const data =
            await ctx.stub.getState(
                `SECURITY_${transactionId}`
            );

        if (!data || data.length === 0) {
            throw new Error(
                `Security event for transaction ${transactionId} does not exist`
            );
        }

        return data.toString();
    }


    // ======================================================
    // 7. ČITANJE FINANSIJSKE TRANSAKCIJE
    // ======================================================

    async ReadFinancialTransaction(
        ctx,
        transactionId
    ) {

        const data =
            await ctx.stub.getState(
                `TRANSACTION_${transactionId}`
            );

        if (!data || data.length === 0) {
            throw new Error(
                `Financial transaction ${transactionId} does not exist`
            );
        }

        return data.toString();
    }


    // ======================================================
    // 8. BRISANJE BIOMETRIJSKOG ZAPISA
    // ======================================================

    async DeleteBiometric(
        ctx,
        biometricId,
        employeeId,
        requestId
    ) {

        // --------------------------------------------------
        // Provera da biometrijski zapis postoji
        // --------------------------------------------------

        const data =
            await ctx.stub.getState(
                biometricId
            );

        if (!data || data.length === 0) {
            throw new Error(
                `Biometric record ${biometricId} does not exist`
            );
        }

        const biometricRecord =
            JSON.parse(
                data.toString()
            );


        // --------------------------------------------------
        // Provera povezanosti korisnika i zapisa
        // --------------------------------------------------

        if (
            biometricRecord.employeeId !==
            employeeId
        ) {
            throw new Error(
                `Employee ${employeeId} is not authorized to delete biometric record ${biometricId}`
            );
        }


        // --------------------------------------------------
        // Vremenska oznaka brisanja
        // --------------------------------------------------

        const timestamp =
            ctx.stub.getTxTimestamp();

        const deletionTimestamp =
            timestamp.seconds.toString();


        // --------------------------------------------------
        // Podaci za generisanje heša potvrde brisanja
        // --------------------------------------------------

        const deletionConfirmation = {

            requestId:
                requestId,

            biometricId:
                biometricId,

            employeeId:
                employeeId,

            timestamp:
                deletionTimestamp,

            action:
                "BIOMETRIC_DATA_DELETED"
        };


        const deletionData =
            JSON.stringify(
                deletionConfirmation
            );


        const deletionHash =
            crypto
                .createHash('sha256')
                .update(deletionData)
                .digest('hex');


        // --------------------------------------------------
        // Brisanje aktivnog biometrijskog zapisa
        // --------------------------------------------------

        await ctx.stub.deleteState(
            biometricId
        );


        // --------------------------------------------------
        // Evidentiranje završetka procesa brisanja
        // --------------------------------------------------

        const deletionRecord = {

            requestId:
                requestId,

            biometricId:
                biometricId,

            employeeId:
                employeeId,

            action:
                "BIOMETRIC_DATA_DELETED",

            status:
                "DELETED",

            timestamp:
                deletionTimestamp,

            confirmationHash:
                deletionHash
        };


        await ctx.stub.putState(

            `DELETION_${requestId}`,

            Buffer.from(
                JSON.stringify(
                    deletionRecord
                )
            )
        );


        return JSON.stringify(
            deletionRecord
        );
    }


    // ======================================================
    // 9. ČITANJE POTVRDE O BRISANJU
    // ======================================================

    async ReadDeletionEvent(
        ctx,
        requestId
    ) {

        const data =
            await ctx.stub.getState(
                `DELETION_${requestId}`
            );

        if (!data || data.length === 0) {
            throw new Error(
                `Deletion event ${requestId} does not exist`
            );
        }

        return data.toString();
    }
}


module.exports =
    BiometricContract;