# onkeltom.github.io Authoring Guide

Welcome! This repository powers the onkeltom.github.io Jekyll site. This guide walks you through adding new content, managing media, and running the site locally.

## Adding a Blog Post

1. Create a new Markdown file in `_posts/` named using the pattern `YYYY-MM-DD-title.md` (all lowercase, words separated by hyphens).
2. Copy the front matter template below into the top of the file and adjust the values.

```yaml
---
layout: post
title: "Your Post Title"
description: "Short summary for cards and previews"
date: YYYY-MM-DD HH:MM:SS +/-TTTT
categories: [blog]
tags: [tag-one, tag-two]
cover_image: /assets/images/blog/your-cover.jpg
image: /assets/images/blog/your-social-share.jpg
---
```

3. Write your content below the front matter using standard Markdown. Use headings, lists, and images to structure the post.
4. Save images in `assets/images/blog/` and reference them with absolute paths that begin with `/`.

### Post Conventions
- **File names:** lowercase, hyphen-separated (`2024-05-12-my-great-post.md`).
- **Tags:** lowercase hyphenated keywords, limited to 3–5 per post for clarity.
- **Cover images:** the `cover_image` appears on listing pages; size them to a 3:2 ratio when possible.
- **Social images:** set `image` to a 1200×630 image for social sharing cards.

## Adding a Recipe

1. Add a Markdown file in `_recipes/` named `recipe-title.md` (lowercase and hyphenated).
2. Insert the recipe front matter and fill in the details.

```yaml
---
layout: recipe
title: "Recipe Title"
description: "One-line teaser"
yield: "Serves 4"
prep_time: "15 minutes"
cook_time: "30 minutes"
tags: [recipe, tag]
cover_image: /assets/images/recipes/recipe-title-cover.jpg
image: /assets/images/recipes/recipe-title-social.jpg
ingredients:
  - 1 cup example ingredient
  - 2 tbsp another ingredient
steps:
  - Step one instructions.
  - Step two instructions.
notes:
  - Optional note or variation.
---
```

3. Store supporting photos under `assets/images/recipes/`.
4. Write the method, tips, and serving suggestions below the front matter in Markdown.

### Recipe Conventions
- **File names:** `recipe-title.md` (no dates).
- **Tags:** reuse global tags when possible; add specific technique or ingredient tags as needed.
- **Images:** use high-resolution photos with descriptive file names. Keep `cover_image` and `image` consistent with blog guidance.

## Using Recipe Filters

Recipe collection pages can be filtered by tags, yield, prep time, and cook time. The `ingredients`, `steps`, and other attributes from the front matter automatically populate data attributes (e.g., `data-tags`, `data-yield`) for the recipe cards. To enable a filter:

- Ensure the front matter includes the relevant field (e.g., `tags`, `prep_time`).
- Use consistent formatting (strings for times like "30 minutes").
- Update any JavaScript filter lists if you introduce new categories.

## Local Preview Options

Choose the method that suits your environment to run the site locally.

### Docker (Easiest)
```
docker run --rm -p 4000:4000 -v "$PWD":/srv/jekyll jekyll/jekyll:4 jekyll serve --livereload
```
This command builds the site and serves it with live reload at `http://localhost:4000`.

### Ruby Environment
1. Install Ruby (2.7+ recommended) and Bundler.
2. Install dependencies:
   ```bash
   bundle install
   ```
3. Serve the site locally with live reload:
   ```bash
   bundle exec jekyll serve
   ```

## GitHub Pages Deployment

1. Push changes to the `main` branch.
2. In GitHub, navigate to **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose the `main` branch and `/ (root)` folder, then click **Save**.
5. GitHub Pages will automatically build and publish the site. Monitor the **Actions** tab for build status.

## Troubleshooting

- **Site fails to build locally:** Remove `_site/` (if present) and rerun the chosen serve command.
- **Gem version conflicts:** Delete `Gemfile.lock`, run `bundle install`, and retry.
- **Missing images:** Confirm the file path starts with `/assets/` and that the file is committed.
- **Liquid errors:** Check that front matter keys are spelled correctly and that YAML indentation is consistent.
- **Filters not working:** Verify that the recipe front matter includes the expected fields and that tags match the filter options exactly.
- **`bundle install` returns `Gem::Net::HTTPClientException 403 "Forbidden"`:** This usually means an upstream proxy or firewall is blocking outbound HTTPS traffic to `rubygems.org`. Confirm general network access with `curl -I https://rubygems.org/`; if that also returns 403, use an allowed network, configure the required proxy credentials, or run inside the official `jekyll/jekyll` Docker image which bundles the dependencies.

Happy publishing!
