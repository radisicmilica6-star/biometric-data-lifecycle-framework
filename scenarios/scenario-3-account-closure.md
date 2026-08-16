# Scenario 3 – Account Closure

## Description

This scenario demonstrates the handling of biometric data when a user account is closed.

The scenario follows the final stages of the biometric data lifecycle and demonstrates that account closure does not simply remove the active user record, but also initiates the appropriate data lifecycle and audit procedures.

## Scenario Flow

1. The user's account closure request is initiated.
2. The user's active biometric record is identified.
3. The account status is changed to inactive.
4. The relevant biometric data lifecycle process is initiated.
5. The required deletion or retention procedure is applied according to the defined policy.
6. The account closure event is recorded for audit purposes.

## Expected Result

The user account is successfully closed and the biometric data is handled according to the applicable lifecycle and retention policy.

## Security Outcome

* Account status: **Closed**
* Active authentication: **Disabled**
* Biometric data: **Handled according to lifecycle policy**
* Audit record: **Created**
* Further unauthorized use: **Prevented**

## Conclusion

Scenario 3 demonstrates the importance of lifecycle management after the active use of biometric data has ended. Account closure triggers the appropriate security, retention, deletion and audit procedures, supporting privacy, compliance and traceability requirements.
