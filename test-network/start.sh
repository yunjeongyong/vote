#!/bin/bash

# ./network.sh down
# sleep 3

./network.sh up createChannel
sleep 3

./network.sh deployCC
sleep 3

pushd ../invoke/
./run.sh
popd

