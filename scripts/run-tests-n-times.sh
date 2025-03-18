#!/bin/bash

# Check if the number of iterations is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <number_of_iterations> [filename]"
  exit 1
fi

# Get the number of iterations from the first argument
n=$1

# Check if a filename is provided as the second argument
filename=""
if [ -n "$2" ]; then
  filename="$2"
fi

# Loop to run the test n times
for (( i=1; i<=n; i++ ))
do
  echo "Running test iteration $i of $n..."
  
  # Run the test command with the optional filename
  if [ -n "$filename" ]; then
    yarn run test-local "$filename"
  else
    yarn run test-local
  fi
  
  # Check the exit status of the last command
  if [ $? -ne 0 ]; then
    echo "Test failed on iteration $i. Exiting..."
    exit 1
  fi
  
  echo "Test iteration $i passed."
done

# If all iterations pass, print success message
echo "All $n test iterations passed successfully."
