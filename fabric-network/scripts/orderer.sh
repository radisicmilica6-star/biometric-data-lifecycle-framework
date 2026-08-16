#!/usr/bin/env bash

. scripts/envVar.sh

channel_name=$1

export PATH=${ROOTDIR}/../bin:${PWD}/../bin:$PATH

export ORDERER_ADMIN_TLS_SIGN_CERT="${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.crt"
export ORDERER_ADMIN_TLS_PRIVATE_KEY="${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.key"

if command -v cygpath >/dev/null 2>&1; then
    ORDERER_CA_WIN=$(cygpath -w "$ORDERER_CA")
    ORDERER_ADMIN_TLS_SIGN_CERT_WIN=$(cygpath -w "$ORDERER_ADMIN_TLS_SIGN_CERT")
    ORDERER_ADMIN_TLS_PRIVATE_KEY_WIN=$(cygpath -w "$ORDERER_ADMIN_TLS_PRIVATE_KEY")
    CHANNEL_BLOCK_WIN=$(cygpath -w "${PWD}/channel-artifacts/${channel_name}.block")
else
    ORDERER_CA_WIN="$ORDERER_CA"
    ORDERER_ADMIN_TLS_SIGN_CERT_WIN="$ORDERER_ADMIN_TLS_SIGN_CERT"
    ORDERER_ADMIN_TLS_PRIVATE_KEY_WIN="$ORDERER_ADMIN_TLS_PRIVATE_KEY"
    CHANNEL_BLOCK_WIN="${PWD}/channel-artifacts/${channel_name}.block"
fi

osnadmin channel join \
    --channelID "${channel_name}" \
    --config-block "${CHANNEL_BLOCK_WIN}" \
    -o localhost:7053 \
    --ca-file "${ORDERER_CA_WIN}" \
    --client-cert "${ORDERER_ADMIN_TLS_SIGN_CERT_WIN}" \
    --client-key "${ORDERER_ADMIN_TLS_PRIVATE_KEY_WIN}" \
    >> log.txt 2>&1