source "https://rubygems.org"

# Hello! This is where you manage which Jekyll version is used to run.
# When you want to use a different version, change it below, save the
# file and run `bundle install`. Run Jekyll with `bundle exec`, like so:
#
#     bundle exec jekyll serve
#
# This will help ensure the proper Jekyll version is running.
# Happy Jekylling!
#
# Tracks the Jekyll 3.x line that GitHub Pages builds this site with.
# Do not pin below 3.9 -- earlier releases cannot run on Ruby 3.x.
gem "jekyll", "~> 3.10"


# If you have any plugins, put them here!
group :jekyll_plugins do
   gem "jekyll-feed", "~> 0.6"
   # Add github gist support
   gem "jekyll-gist"
end

# kramdown 2.x moved the GitHub-flavored markdown parser into its own gem.
gem "kramdown-parser-gfm"

# Removed from the Ruby stdlib in 3.0; `jekyll serve` needs it.
gem "webrick"

# Leaves the default gems in Ruby 3.4; safe_yaml still requires it.
gem "base64"

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]

group :test do
  gem "html-proofer", "~> 5.0"
end
