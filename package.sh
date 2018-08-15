#!/usr/bin/env sh
# couldnt figure out undocumented 'output template' mode for pkg so wrote this
# also need to include .node files until pkg supports including them in binary

NODE_ABI="node-64"
VERSION=$(node -pe "require('./package.json').version")

rm -rf dist

mkdir dist
mkdir builds/hypercored-$VERSION-linux-x64

mv builds/hypercored builds/hypercored-$VERSION-linux-x64/hypercored

cp node_modules/utp-native/prebuilds/linux-x64/$NODE_ABI.node builds/hypercored-$VERSION-linux-x64/

cp LICENSE builds/hypercored-$VERSION-linux-x64/

cp README.md builds/hypercored-$VERSION-linux-x64/README

cd builds
../node_modules/.bin/cross-zip hypercored-$VERSION-linux-x64 ../dist/hypercored-$VERSION-linux-x64.zip

rm -rf ../builds

# now travis will upload the 3 zips in dist to the release