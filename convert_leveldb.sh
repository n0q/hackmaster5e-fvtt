#!/bin/bash
# author: n0q
# ver: 1
# Serializes/deserializes leveldb into json using the fvtt conversion utility.

wd=$(dirname "$0")
SRC_DIR="$wd/_source"
PACK_DIR="$wd/packs"

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
        npx fvtt package pack -n $pack          \
            --inputDirectory "$SRC_DIR/$pack"   \
            --outputDirectory "$PACK_DIR"
    done
}

deserialize() {
    getPacks "$PACK_DIR"
    for pack in $packs; do
        [ -d "$SRC_DIR/$pack" ] || mkdir -p "$SRC_DIR/$pack"
        npx fvtt package unpack -n $pack        \
            --inputDirectory "$PACK_DIR"        \
            --outputDirectory "$SRC_DIR/$pack"
    done
}

confirm_serialize() {
    read -p "This isn't a workflow. Are you sure? [Y/n]" proceed
    case $proceed in
        Y)
            serialize
            ;;
        *)
            echo -e "\nTerminating."
            exit 1
            ;;
    esac
}

if [ $# -eq 0 ]; then
    deserialize
    exit 0
fi

while getopts "hs" opt; do
    case "$opt" in
        s)
            if [ -z "$GITHUB_ACTIONS" ]; then
                confirm_serialize
            else
                serialize
            fi
            exit 0
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
