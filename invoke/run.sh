#!/bin/bash

rm -rf dist
rm -rf wallet

npm run build
node dist/enrollAdmin
node dist/registerUser

