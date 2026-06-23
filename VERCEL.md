# Building and pushing to the vercel site.
# WIP for the api/events
# we could just host the site here as well if we get more dynamic with it.
# There is git integration here as well.


$ bundle exec jekyll build
Configuration file: none
            Source: /Users/lroehrs/awork/hackerdojo.org
       Destination: /Users/lroehrs/awork/hackerdojo.org/_site
 Incremental build: disabled. Enable with --incremental
      Generating... 
       Jekyll Feed: Generating feed for posts
                    done in 0.507 seconds.
 Auto-regeneration: disabled. Use --watch to enable.
$ vercel --prod