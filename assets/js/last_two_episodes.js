document.addEventListener('DOMContentLoaded', () => {
    const episodesContainer = document.getElementById('episodes-container');
    const loadingMessage = document.getElementById('loading-message');
    const applePodcastId = '1795753809'; // The ID from your Apple Podcasts URL

    async function fetchPodcastEpisodes() {
        try {
            // Step 1: Get the RSS feed URL from the iTunes lookup API
            // Now using the allorigins.win proxy for the lookup API as well to avoid CORS
            const lookupUrl = `https://itunes.apple.com/lookup?id=${applePodcastId}`;
            const proxiedLookupUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(lookupUrl)}`;

            const lookupResponse = await fetch(proxiedLookupUrl);
            const lookupData = await lookupResponse.json();

            // allorigins returns the actual JSON content in the 'contents' property
            const parsedLookupContents = JSON.parse(lookupData.contents);

            if (parsedLookupContents.results && parsedLookupContents.results.length > 0) {
                const feedUrl = parsedLookupContents.results[0].feedUrl;

                if (feedUrl) {
                    // Step 2: Fetch the RSS XML content from the obtained feedUrl
                    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`;
                    const rssResponse = await fetch(proxyUrl);
                    const rssData = await rssResponse.json(); // allorigins returns JSON with contents.text

                    if (rssData.contents) {
                        let rawRssContent = rssData.contents;

                        // Check if the content is base64 encoded and decode it
                        if (typeof rawRssContent === 'string' && rawRssContent.startsWith('data:')) {
                            try {
                                const parts = rawRssContent.split(',');
                                if (parts.length > 1) {
                                    const base64Data = parts[1];
                                    // Decode Base64 string to a binary string
                                    const decodedBinaryString = atob(base64Data);

                                    // Convert binary string to UTF-8 string using TextDecoder
                                    // This is crucial for handling character encoding issues like â
                                    const len = decodedBinaryString.length;
                                    const bytes = new Uint8Array(len);
                                    for (let i = 0; i < len; i++) {
                                        bytes[i] = decodedBinaryString.charCodeAt(i);
                                    }
                                    rawRssContent = new TextDecoder('utf-8').decode(bytes);
                                }
                            } catch (e) {
                                console.error("Failed to decode base64 RSS content:", e);
                                episodesContainer.innerHTML = '<p class="text-center text-danger">Failed to decode RSS feed content.</p>';
                                return;
                            }
                        }

                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(rawRssContent, 'text/xml');
                        const items = xmlDoc.querySelectorAll('item');

                        loadingMessage.remove(); // Remove loading message once data is fetched

                        if (items.length === 0) {
                            episodesContainer.innerHTML = '<p class="text-center text-muted">No episodes found.</p>';
                            return;
                        }

                        var c=0;
                        items.forEach(item => {
                            c=c+1; if(c>2) return;
                            const title = item.querySelector('title')?.textContent || 'No Title';
                            // Use 'itunes:summary' or 'description' for podcast description, with fallback
                            const descriptionElement = item.querySelector('itunes\\:summary') || item.querySelector('description');
                            const description = descriptionElement ? descriptionElement.textContent : 'No Description';
                            const pubDate = item.querySelector('pubDate')?.textContent || 'No Date';
                            const enclosureUrl = item.querySelector('enclosure')?.getAttribute('url');

                            // Create a card for each episode
                            const episodeCard = document.createElement('div');
                            episodeCard.className = 'episode-card';

                            // Make the title clickable instead of a separate "Listen Now" button
                            episodeCard.innerHTML = `
                                        ${enclosureUrl ? `<a href="${enclosureUrl}" target="_blank" rel="noopener noreferrer" class="text-decoration-none text-dark">` : ''}
                                            <h4><i class="fas fa-play-circle me-2"></i>${title}</h4>
                                        ${enclosureUrl ? `</a>` : ''}
                                        <p class="pub-date">${new Date(pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        <p>${description.length > 200 ? description.substring(0, 200) + '...' : description}</p>
                                    `;
                            episodesContainer.appendChild(episodeCard);
                        });
                    } else {
                        episodesContainer.innerHTML = '<p class="text-center text-danger">Failed to retrieve podcast feed content.</p>';
                    }
                } else {
                    episodesContainer.innerHTML = '<p class="text-center text-danger">Could not find RSS feed URL for the podcast.</p>';
                }
            } else {
                episodesContainer.innerHTML = '<p class="text-center text-danger">Podcast not found on iTunes or lookup failed.</p>';
            }

        } catch (error) {
            console.error('Error fetching podcast episodes:', error);
            episodesContainer.innerHTML = `<p class="text-center text-danger">An error occurred while loading episodes: ${error.message}</p>`;
        }
    }

    fetchPodcastEpisodes();
});