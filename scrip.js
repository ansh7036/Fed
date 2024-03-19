document.addEventListener('DOMContentLoaded', function() {
    const clientId = 'ee1021e827784a8289d8fedcc2b97176';
    const redirectUri = 'http://127.0.0.1:5500/java.html#';
    const scopes = 'user-read-recently-played';

    let audioPlayer = new Audio();
    let recentlyPlayedTracks = []; // Array to store recently played tracks

    // Function to fetch recently played tracks from Spotify API
    async function fetchRecentlyPlayed() {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                alert('Please log in first.');
                return;
            }

            const response = await fetch('https://api.spotify.com/v1/me/player/recently-played', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            const data = await response.json();
            const recentlyPlayedElement = document.getElementById('recent-tracks-list');
            recentlyPlayedElement.innerHTML = '';
            recentlyPlayedTracks = data.items.map(item => {
                const trackName = item.track.name;
                const artistName = item.track.artists.map(artist => artist.name).join(', ');
                const trackImage = item.track.album.images[0].url;
                const trackId = item.track.id;
                return { trackName, artistName, trackImage, trackId };
            });
            // Render recently played tracks
            recentlyPlayedTracks.forEach(track => {
                const listItem = createTrackListItem(track.trackName, track.artistName, track.trackImage, track.trackId);
                recentlyPlayedElement.appendChild(listItem);
            });
        } catch (error) {
            console.error('Error fetching recently played tracks:', error);
        }
    }

    // Function to create track list item
    function createTrackListItem(trackName, artistName, trackImage, trackId) {
        const listItem = document.createElement('li');
        listItem.classList.add('card', 'track-item');
        listItem.setAttribute('data-track-id', trackId);
        listItem.innerHTML = `
            <img src="${trackImage}" alt="${trackName}">
            <div>
                <strong>${trackName}</strong>
                <span>${artistName}</span>
            </div>
            <button class="play-button" data-track-preview-url="https://p.scdn.co/mp3-preview/${trackId}">Play</button>
        `;
        return listItem;
    }

    // Function to handle play button click
    function handlePlayButtonClick(event) {
        const trackPreviewUrl = event.currentTarget.getAttribute('data-track-preview-url');
        const trackName = event.currentTarget.parentElement.querySelector('strong').innerText;
        const artistName = event.currentTarget.parentElement.querySelector('span').innerText;
        if (trackPreviewUrl) {
            audioPlayer.src = trackPreviewUrl;
            audioPlayer.play();
            // Add the played song to recently played list
            const trackId = event.currentTarget.parentElement.getAttribute('data-track-id');
            const trackImage = event.currentTarget.parentElement.querySelector('img').src;
            recentlyPlayedTracks.unshift({ trackName, artistName, trackImage, trackId });
            updateRecentlyPlayedList();
        } else {
            alert('No preview available for this track.');
        }
    }

    // Function to update recently played list
    function updateRecentlyPlayedList() {
        const recentlyPlayedElement = document.getElementById('recent-tracks-list');
        recentlyPlayedElement.innerHTML = '';
        recentlyPlayedTracks.forEach(track => {
            const listItem = createTrackListItem(track.trackName, track.artistName, track.trackImage, track.trackId);
            recentlyPlayedElement.appendChild(listItem);
        });
    }

    // Function to handle search button click
    async function handleSearchButtonClick() {
        const searchQuery = document.getElementById('search-input').value.trim();
        if (!searchQuery) {
            alert('Please enter a search query.');
            return;
        }

        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                alert('Please log in first.');
                return;
            }

            const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            const data = await response.json();
            const searchResultsElement = document.getElementById('search-results-list');
            searchResultsElement.innerHTML = '';
            data.tracks.items.forEach(item => {
                const trackName = item.name;
                const artistName = item.artists.map(artist => artist.name).join(', ');
                const trackImage = item.album.images[0].url;
                const trackId = item.id;
                const listItem = createTrackListItem(trackName, artistName, trackImage, trackId);
                searchResultsElement.appendChild(listItem);
            });
        } catch (error) {
            console.error('Error searching tracks:', error);
        }
    }

    // Add event listener for play buttons
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('play-button')) {
            handlePlayButtonClick(event);
        }
    });

    // Add event listener for search button
    document.getElementById('search-button').addEventListener('click', handleSearchButtonClick);

    // Check if the page URL contains an access token
    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = params.get('access_token');
    if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        fetchRecentlyPlayed();
    } else {
        // Redirect to Spotify login page if not authenticated
        window.location = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
    }
});
