---
layout: default
---
{% assign sorted_articles = site.articles | sort: 'date' | reverse %}

<h1>All Articles</h1>
<p>Latest first.</p>
<section id="episodes" class="container">

    <div class="grid episodes-grid">

        {% for entry in sorted_articles  %}
        <article>
            <a href="{{site.baseurl}}{{entry.url}}"><h2>{{entry.title}}</h2></a>    
            <figure>
                <img src="/assets/images/{{entry.image}}" alt="Episode {{entry.seq}}">
                <figcaption>Episode {{entry.seq}}: {{entry.title}}</figcaption>
            </figure>
            <p><em>{{ entry.date | date: "%B %d, %Y" }}</em></p>
            <p>{{entry.slug}}</p>
            {% include speaker_icons.html speakers=entry.speakers %}
        </article>
        {% endfor %}
    </div>

</section>
