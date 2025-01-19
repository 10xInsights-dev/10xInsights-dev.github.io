---
layout: default
---
{% assign sorted_podcasts = site.podcasts | sort: 'seq' | reverse %}

<section id="episodes" class="container">

    <div class="grid episodes-grid">

        {% for entry in sorted_podcasts  %}
        <article>
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
