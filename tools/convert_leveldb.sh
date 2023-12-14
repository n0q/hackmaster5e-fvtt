#!/bin/bash
# Serializes/deserializes leveldb into json using the fvtt cli utility.

wd=$(dirname "$0")
SRC_DIR="$wd/../_packs"
PACK_DIR="$wd/../packs"

getPacks() {
    packs=$(find "${1}" -mindepth 1 -maxdepth 1 -type d -exec basename {} \;)
}

showhelp() {
    echo -e "Serializes or deserializes leveldb to json.\n"
    echo -e "\e[1mUsage:\e[0m $0 [OPTIONS]"
    echo -e "  -h       Show this help"
    echo -e "  -s       Serialize packs (default: false)\n"
}

serialize() {
    getPacks "$SRC_DIR"
    [ -d "$PACK_DIR" ] || mkdir "$PACK_DIR"
    for pack in $packs; do
        npx fvtt package pack -n $pack \
            --type "System"            \
            --in  "$SRC_DIR/$pack"     \
            --out "$PACK_DIR"
    done
    exit 0
}

deserialize() {
    getPacks "$PACK_DIR"
    for pack in $packs; do
        [ -d "$SRC_DIR/$pack" ] || mkdir -p "$SRC_DIR/$pack"
        npx fvtt package unpack -n $pack \
            --type "System"              \
            --in  "$PACK_DIR"            \
            --out "$SRC_DIR/$pack"
    done
    exit 0
}

confirmSerialize() {
    read -p "This isn't a workflow. Are you sure? [Y/n] " proceed
    [ "$proceed" == "Y" ] && serialize || echo -e "\nTerminating"
    exit 1;
}

[ $# -eq 0 ] && deserialize

while getopts "hs" opt; do
    case "$opt" in
        s)
            [ -z "${GITHUB_ACTIONS+x}" ] && confirmSerialize || serialize
            ;;
        h)
            showhelp
            exit 0
            ;;
        *)
            showhelp
            exit 1
            ;;
    esac
done
