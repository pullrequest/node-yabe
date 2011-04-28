#!/bin/sh
nohup node app.js $1 > /dev/null &

if [ "$1" = "stop" ]
then
  rm -rf pids/*
  rm cluster*.sock
fi
