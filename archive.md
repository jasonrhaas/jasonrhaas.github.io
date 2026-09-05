---
layout: default
title: Archive
permalink: /archive/
---

<article class="post">
  <header class="post__header">
    <h1 class="post__title">Archive</h1>
    <p class="post__meta"><span>{{ site.posts | size }} posts, newest first</span></p>
  </header>

  {%- assign years = site.posts | group_by_exp: "post", "post.date | date: '%Y'" -%}
  {%- for year in years %}
  <h2 class="year">{{ year.name }}</h2>
  <ul class="list">
    {%- for post in year.items -%}
      {% include post-row.html post=post %}
    {%- endfor -%}
  </ul>
  {%- endfor %}
</article>
