// LAKI COVER SONG - Music Streaming App JavaScript

class MusicApp {
    constructor() {
        this.songs = [];
        this.currentAudio = null;
        this.deleteMode = false;
        this.init();
    }

    init() {
        this.loadSongs();
        this.renderSongs();
        this.setupEventListeners();
        this.startBackgroundAnimations();
    }

    // Load songs from localStorage or initialize with sample data
    loadSongs() {
        const savedSongs = localStorage.getItem('lakiSongs');
        if (savedSongs) {
            this.songs = JSON.parse(savedSongs);
        } else {
            // Sample songs for demonstration
            this.songs = [
                {
                    id: 1,
                    title: "Perfect Cover",
                    artist: "Laki",
                    audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                    mp3Url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                    documentUrl: null
                },
                {
                    id: 2,
                    title: "Someone Like You Cover",
                    artist: "Laki",
                    audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                    mp3Url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                    documentUrl: null
                }
            ];
            this.saveSongs();
        }
    }

    // Save songs to localStorage
    saveSongs() {
        localStorage.setItem('lakiSongs', JSON.stringify(this.songs));
    }

    // Render songs in the grid
    renderSongs() {
        const grid = document.getElementById('songsGrid');
        grid.innerHTML = '';

        this.songs.forEach((song, index) => {
            const card = this.createSongCard(song, index);
            grid.appendChild(card);
        });
    }

    // Create individual song card
    createSongCard(song, index) {
        const template = document.getElementById('songCardTemplate');
        const card = template.content.cloneNode(true);
        
        const songCard = card.querySelector('.song-card');
        songCard.style.animationDelay = `${index * 0.1}s`;

        card.querySelector('.song-title').textContent = song.title;
        card.querySelector('.song-artist').textContent = song.artist || 'Unknown Artist';
        
        const audio = card.querySelector('.song-audio');
        audio.src = song.audioUrl;
        
        const playBtn = card.querySelector('.play-btn');
        const playIcon = playBtn.querySelector('i');
        
        playBtn.addEventListener('click', () => {
            this.togglePlay(audio, playIcon);
        });

        const speedControl = card.querySelector('.speed-control');
        speedControl.addEventListener('change', (e) => {
            audio.playbackRate = parseFloat(e.target.value);
        });

        const downloadMp3 = card.querySelector('.download-mp3');
        downloadMp3.addEventListener('click', () => {
            this.downloadFile(song.mp3Url, `${song.title}.mp3`);
        });

        const downloadDoc = card.querySelector('.download-doc');
        if (song.documentUrl) {
            downloadDoc.addEventListener('click', () => {
                this.downloadFile(song.documentUrl, `${song.title}-document.pdf`);
            });
        } else {
            downloadDoc.style.display = 'none';
        }

        const deleteBtn = card.querySelector('.delete-btn');
        deleteBtn.style.display = this.deleteMode ? 'block' : 'none';
        deleteBtn.addEventListener('click', () => {
            this.deleteSong(song.id);
        });

        audio.addEventListener('ended', () => {
            playIcon.classList.remove('fa-pause');
            playIcon.classList.add('fa-play');
        });

        return card;
    }

    // Toggle play/pause for audio
    togglePlay(audio, playIcon) {
        if (this.currentAudio && this.currentAudio !== audio) {
            this.currentAudio.pause();
            const prevIcon = this.currentAudio.closest('.song-card').querySelector('.play-btn i');
            prevIcon.classList.remove('fa-pause');
            prevIcon.classList.add('fa-play');
        }

        if (audio.paused) {
            audio.play();
            playIcon.classList.remove('fa-play');
            playIcon.classList.add('fa-pause');
            this.currentAudio = audio;
        } else {
            audio.pause();
            playIcon.classList.remove('fa-pause');
            playIcon.classList.add('fa-play');
            this.currentAudio = null;
        }
    }

    // Download file functionality
    downloadFile(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Show add song form
    showAddSongForm() {
        document.getElementById('addSongForm').style.display = 'block';
    }

    // Hide add song form
    hideAddSongForm() {
        document.getElementById('addSongForm').style.display = 'none';
        this.clearForm();
    }

    // Clear form inputs
    clearForm() {
        document.getElementById('newSongTitle').value = '';
        document.getElementById('newSongArtist').value = '';
        document.getElementById('newSongFile').value = '';
        document.getElementById('newDocumentFile').value = '';
    }

    // Add new song
    addNewSong() {
        const title = document.getElementById('newSongTitle').value.trim();
        const artist = document.getElementById('newSongArtist').value.trim();
        const audioFile = document.getElementById('newSongFile').files[0];
        const docFile = document.getElementById('newDocumentFile').files[0];

        if (!title || !audioFile) {
            alert('Please fill in the song title and select an audio file.');
            return;
        }

        const newSong = {
            id: Date.now(),
            title: title,
            artist: artist,
            audioUrl: URL.createObjectURL(audioFile),
            mp3Url: URL.createObjectURL(audioFile),
            documentUrl: docFile ? URL.createObjectURL(docFile) : null
        };

        this.songs.push(newSong);
        this.saveSongs();
        this.renderSongs();
        this.hideAddSongForm();
        
        // Show success message
        this.showNotification('Song added successfully!', 'success');
    }

    // Delete song
    deleteSong(id) {
        if (confirm('Are you sure you want to delete this song?')) {
            this.songs = this.songs.filter(song => song.id !== id);
            this.saveSongs();
            this.renderSongs();
            this.showNotification('Song deleted successfully!', 'success');
        }
    }

    // Toggle delete mode
    toggleDeleteMode() {
        this.deleteMode = !this.deleteMode;
        this.renderSongs();
        
        const deleteBtn = document.querySelector('.admin-controls button:last-child');
        deleteBtn.textContent = this.deleteMode ? 'Exit Delete Mode' : 'Delete Songs';
        deleteBtn.innerHTML = this.deleteMode ? 
            '<i class="fas fa-times"></i> Exit Delete Mode' : 
            '<i class="fas fa-trash"></i> Delete Songs';
    }

    // Send song request via WhatsApp
    sendSongRequest(event) {
        event.preventDefault();
        
        const songName = document.getElementById('requestSongName').value.trim();
        const description = document.getElementById('requestDescription').value.trim();
        
        if (!songName || !description) {
            alert('Please fill in all fields.');
            return;
        }

        const message = `Song Request: ${songName}%0A%0ADescription: ${description}`;
        const whatsappUrl = `https://wa.me/94767546714?text=${message}`;
        
        window.open(whatsappUrl, '_blank');
        
        // Clear form
        document.getElementById('requestSongName').value = '';
        document.getElementById('requestDescription').value = '';
        
        this.showNotification('Request sent via WhatsApp!', 'success');
    }

    // Show notification
    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        if (type === 'success') {
            notification.style.background = 'rgba(0, 255, 0, 0.8)';
            notification.style.border = '2px solid #00ff00';
            notification.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.5)';
        } else {
            notification.style.background = 'rgba(255, 0, 0, 0.8)';
            notification.style.border = '2px solid #ff0000';
            notification.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.5)';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Start background animations
    startBackgroundAnimations() {
        // Add parallax effect to background
        document.addEventListener('mousemove', (e) => {
            const particles = document.querySelector('.particles');
            const waves = document.querySelector('.waves');
            
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;
            
            if (particles) {
                particles.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
            }
            if (waves) {
                waves.style.transform = `translate(${x * 0.05}px, ${y * 0.05}px)`;
            }
        });

        // Add scroll animations
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = document.querySelector('.background-animation');
            if (parallax) {
                parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
            }
        });
    }

    // Setup event listeners
    setupEventListeners() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Add intersection observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe all sections
        document.querySelectorAll('section').forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'all 0.6s ease-out';
            observer.observe(section);
        });
    }

    // Performance optimization for large song libraries
    optimizeForLargeLibrary() {
        // Implement virtual scrolling for large lists
        if (this.songs.length > 100) {
            this.implementVirtualScrolling();
        }
        
        // Implement lazy loading for audio files
        this.implementLazyLoading();
        
        // Implement search and filter functionality
        this.implementSearch();
    }

    // Implement virtual scrolling (for future enhancement)
    implementVirtualScrolling() {
        // This would be implemented for very large song libraries
        console.log('Virtual scrolling implemented for large library');
    }

    // Implement lazy loading
    implementLazyLoading() {
        const audioElements = document.querySelectorAll('.song-audio');
        const lazyLoadOptions = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };

        const lazyLoadObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const audio = entry.target;
                    if (audio.dataset.src && !audio.src) {
                        audio.src = audio.dataset.src;
                        audio.load();
                    }
                }
            });
        }, lazyLoadOptions);

        audioElements.forEach(audio => {
            if (audio.dataset.src) {
                lazyLoadObserver.observe(audio);
            }
        });
    }

    // Implement search functionality
    implementSearch() {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <input type="text" id="songSearch" placeholder="Search songs..." class="search-input">
        `;
        
        const songsSection = document.querySelector('.songs-section .container');
        songsSection.insertBefore(searchContainer, songsSection.querySelector('.admin-controls'));
        
        const searchInput = document.getElementById('songSearch');
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            this.filterSongs(searchTerm);
        });
    }

    // Filter songs based on search term
    filterSongs(searchTerm) {
        const songCards = document.querySelectorAll('.song-card');
        songCards.forEach(card => {
            const title = card.querySelector('.song-title').textContent.toLowerCase();
            const artist = card.querySelector('.song-artist').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || artist.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
}

// Utility functions
function showAddSongForm() {
    app.showAddSongForm();
}

function hideAddSongForm() {
    app.hideAddSongForm();
}

function addNewSong() {
    app.addNewSong();
}

function toggleDeleteMode() {
    app.toggleDeleteMode();
}

function sendSongRequest(event) {
    app.sendSongRequest(event);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .search-container {
        margin-bottom: 30px;
        text-align: center;
    }
    
    .search-input {
        width: 100%;
        max-width: 400px;
        padding: 15px;
        background: rgba(26, 26, 26, 0.8);
        border: 2px solid var(--neon-blue);
        border-radius: 25px;
        color: var(--text-light);
        font-size: 1rem;
        transition: all 0.3s ease;
    }
    
    .search-input:focus {
        outline: none;
        box-shadow: 0 0 20px var(--neon-blue);
        transform: scale(1.02);
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new MusicApp();
    
    // Optimize for performance
    app.optimizeForLargeLibrary();
    
    // Add loading animation
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-overlay';
    loadingDiv.innerHTML = '<div class="loading"></div>';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(10, 10, 10, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;
    document.body.appendChild(loadingDiv);
    
    // Remove loading animation after everything is loaded
    window.addEventListener('load', () => {
        setTimeout(() => {
            loadingDiv.remove();
        }, 500);
    });
});

// Handle offline/online status
window.addEventListener('online', () => {
    app.showNotification('Connection restored!', 'success');
});

window.addEventListener('offline', () => {
    app.showNotification('You are offline. Some features may not work.', 'error');
});

// Service Worker for offline functionality (future enhancement)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => {
        console.log('Service Worker registration failed:', err);
    });
}
// Service Worker for LAKI COVER SONG (sw.js)
const CACHE_NAME = 'laki-covers-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                if (response) {
                    return response;
                }
                
                return fetch(event.request).then((response) => {
                    // Don't cache non-successful responses
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone the response
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                });
            })
            .catch(() => {
                // Offline fallback
                return new Response('Offline - Content not available');
            })
    );
});