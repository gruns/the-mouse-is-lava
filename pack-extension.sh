#!/usr/bin/env bash

set -ex

filename=mouse-is-lava

(cd src/ && zip -r "../${filename}.zip" . -x '*~')

echo
echo To publish MIL to the Chrome Store, upload "${filename}.zip" as a new package
