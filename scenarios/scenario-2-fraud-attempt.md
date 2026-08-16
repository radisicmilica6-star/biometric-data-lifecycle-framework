# Scenario 2 – Fraud Attempt

## Description

This scenario demonstrates an attempted fraudulent biometric transaction.

The transaction is initiated with biometric information that does not correspond to the expected user record. The framework detects the inconsistency during the verification process and prevents the transaction from being authorized.

## Scenario Flow

1. Biometric data is acquired from the user.
2. The biometric data is processed and converted into a protected representation.
3. The submitted biometric information is compared with the expected user record.
4. The verification result indicates a mismatch.
5. The transaction is rejected.
6. The security event is recorded for further monitoring and audit.

## Expected Result

The fraudulent transaction is not authorized and no successful transaction is recorded.

## Security Outcome

* Authentication: **Failed**
* Authorization: **Denied**
* Transaction: **Rejected**
* Fraud/security event: **Detected**
* Successful transaction record: **Not created**

## Conclusion

Scenario 2 demonstrates the framework's ability to detect an unsuccessful biometric verification and prevent an unauthorized transaction. The event can also serve as an input for further security monitoring and audit activities.
