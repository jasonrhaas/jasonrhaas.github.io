# jasonrhaas.github.io
Github pages blog

## Deployment

GitHub Pages uses GitHub Actions as its source. The Build workflow installs the
locked Gemfile dependencies, builds the production site, checks internal links,
and deploys the checked output on pushes to `master`. Pull requests only build
and check the site. The weekly Link check workflow also checks external URLs.

## Installation

- `sudo gem install jekyll bundler` to install jekyll and bundler
- `bundle install` to install the dependencies in the Gemfile

## Running the site

- `bundle exec jekyll serve` to run the site on http://localhost:4000

## Creating a new blog post
