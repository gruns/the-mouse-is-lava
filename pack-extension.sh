#!/usr/bin/env bash

set -ex

filename=mouse-is-lava

(cd src/ && zip -r "../${filename}.zip" . -x '*~')

echo
echo To publish, upload "${filename}.zip" to the Chrome Store
