#!/bin/bash
# chmod +x count_lines.sh
# ./count_lines.sh
# Count total lines of code (including blank lines) in .js files
find . -type f -name '*.js' ! -path './node_modules/*' ! -path './.git/*' -exec cat {} + | wc -l