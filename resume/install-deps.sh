#!/usr/bin/env bash
# Installs LaTeX packages needed to build amir_raminfar_resume.tex on basictex.
# Run once after `brew install --cask basictex`.

set -euo pipefail

sudo tlmgr update --self
sudo tlmgr install \
  preprint \
  marvosym \
  enumitem \
  titlesec \
  charter \
  psnfss \
  fontawesome5 \
  latexmk
