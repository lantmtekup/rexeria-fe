#!/bin/zsh
set -u
cd /Users/tranminhlan/Documents/rexerai/recon/magnolia
S=/Users/tranminhlan/Documents/rexerai/.claude/skills/framer-recon/scripts/run.py
U=https://magnolia-demo-black.vercel.app/
run() { echo "=== $2 ($1) $(date +%T)"; python3 $S --url $U --selector "$1" --name "$2" --out-base . --video --cdp > "log-$2.txt" 2>&1; echo "exit $? $(date +%T)"; }
run "#main" "magnolia-fullpage"
run "#top" "01-hero"
run "#heritage" "02-heritage"
run "#horizontal-slide" "03-horizontal-slide"
run "#interactive-tour" "04-interactive-tour"
run "#units" "05-units"
run "#grace" "06-grace"
run "#gallery" "07-gallery"
run "#consultation" "08-consultation"
run "header" "00-header"
echo ALL_DONE
