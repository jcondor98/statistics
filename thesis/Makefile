# Makefile for thesis
.ONESHELL: # 'cd' command works in make recipes

SRCDIR := source
BUILDDIR := build

TEX := xelatex
TEX_FLAGS := --output-directory=$(BUILDDIR)
BIBTEX := bibtex


content.tex: ../docs/thesis.md
	pandoc --shift-heading-level-by -1 -f gfm -t latex $< | tail -n +3 > $@

thesis.pdf: main.tex content.tex
	$(TEX) $(TEX_FLAGS) main
	mv $(BUILDDIR)/main.pdf $@

thesis: thesis.pdf ;

bibliography:
	cp $(SRCDIR)/main.bib $(BUILDDIR)/
	cd $(BUILDDIR)
	$(BIBTEX) main

all: thesis ;

clean:
	-rm $(BUILDDIR)/*
	-rm content.tex

.PHONY: all clean thesis thesis.pdf
