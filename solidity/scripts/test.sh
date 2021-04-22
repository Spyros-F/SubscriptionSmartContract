#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

# Executes cleanup function at script exit.
trap cleanup EXIT

cleanup() {
  # Kill the ganache instance that we started (if we started one and if it's still running).
  if [ -n "$ganache_pid" ] && ps -p $ganache_pid > /dev/null; then
    kill -9 $ganache_pid
  fi
}

if [ "$SOLIDITY_COVERAGE" = true ]; then
  ganache_port=8555
else
  ganache_port=8545
fi

ganache_running() {
    if hash nc 2>/dev/null; then
        nc -z localhost "$ganache_port"
    else
        netcat -z localhost "$ganache_port"
    fi
}

start_ganache() {
  local mnemonic="master ask swing define pepper humor expect caught vapor fly stand convince"

  if [ "$SOLIDITY_COVERAGE" = true ]; then
    node_modules/.bin/testrpc-sc --gasLimit 8000000 --port "$testrpc_port" --mnemonic "${mnemonic}" --defaultBalanceEther '200000' > /dev/null &
  else
    node_modules/.bin/ganache-cli --gasLimit 8000000  --mnemonic "${mnemonic}" --defaultBalanceEther '2000000'> /dev/null &
  fi

  ganache_pid=$!
}

if ganache_running; then
  echo "Using existing ganache instance"
else
  echo "Starting our own ganache instance"
  start_ganache
fi

truffle version

if [ "$SOLIDITY_COVERAGE" = true ]; then
  node_modules/.bin/solidity-coverage

  if [ "$CONTINUOUS_INTEGRATION" = true ]; then
    cat coverage/lcov.info | node_modules/.bin/coveralls
  fi
else
  node_modules/.bin/truffle test "$@"
fi

