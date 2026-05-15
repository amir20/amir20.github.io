#!/usr/bin/env bash
# Watches amir_raminfar_resume.tex and rebuilds the PDF on save.

set -euo pipefail

latexmk -pdf -pvc -interaction=nonstopmode amir_raminfar_resume.tex
