#!/usr/bin/env bash

################################################################################
# We've compiled all of our example scripts and run them one by one and
# where applicable write result like data to the terminal
################################################################################

# set -x

# additional options to be specified where needed
RUN_OPTIONS=""

function run() {
	# capture our run options and reset it
	_OPTIONS="${RUN_OPTIONS}"; RUN_OPTIONS=""

	# clear the screen and print out the script
	clear; cat "${1}"
	printf "\n./isay.js run ${_OPTIONS} -s ${1}\n"
	# some of our scripts are forever loops. They may break out of these via ctrl-c
	# in which case they will return here. At this point we want to return
	trap return SIGINT
	./isay.js run ${_OPTIONS} -s "${1}"
	if [[ -n "${2}" ]]
	then
		printf "${2}\n"
		${2}
	fi
	printf "\npress enter to continue"; read DUMMY;
}

rm -rf ./tmp 2> /dev/null
run examples/files-concat.js "cat ./tmp/samples.txt"

rm -rf ./tmp 2> /dev/null
run examples/files-copy-flatten.js "find ./tmp"

rm -rf ./tmp 2> /dev/null
run examples/files-copy-rebuild.js "find ./tmp"

rm -rf ./tmp 2> /dev/null
run examples/files-move.js "find ./tmp"
run examples/files-delete.js "find ./tmp"
run examples/files-zip-select.js "unzip -l ./tmp/build.zip"

run examples/json-extract.js
run examples/json-filter-sort.js
run examples/json-mutate.js
run examples/json-to-yaml-file.js "cat ./tmp/pets.yaml"
run examples/json-to-yaml-spacious.js
run examples/json-to-yaml.js
run examples/json-write-compact.js
run examples/json-write-spacious.js
run examples/math-factorial.js
run examples/os-npm-run.js
run examples/os-ping-range.js
run examples/os-ps-cpu.js
run examples/text-count-characters-raven.js
RUN_OPTIONS="-i readme.md"; run examples/text-count-characters-input.js
run examples/text-count-words-raven.js
RUN_OPTIONS="-i readme.md"; run examples/text-count-words-input.js
RUN_OPTIONS="-l verbose"; run examples/text-define-words-raven.js
run examples/text-replace.js
