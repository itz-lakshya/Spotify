// Harry --> songs[] = {Afgan%20.mp3, ...}
// href / link --> http://127.0.0.1:3000/SPOTIFY/Songs/Afgan%20.mp3
// SongNameURL[0].url --> href

console.log('Let\'s write some JavaScript!');

let songNameURL = [];

let currentSong = new Audio();

let currentVolume = 0.7;  // default 70%
currentSong.volume = currentVolume;

async function getSongs(folder) {
    songNameURL = [];  // Empty before loading new album

    try {
        const res = await fetch(`${location.origin}/${folder}/manifest.json`);
        const songFiles = await res.json();  // e.g. ["Afgan.mp3", "Tu Jaane Na.mp3"]

        for (let file of songFiles) {
            let songName = file.replace('.mp3', '').replaceAll('%20', ' ');
            let songUrl = `${location.origin}/${folder}/${file}`;
            songNameURL.push({ name: songName, url: songUrl });
        }

        // Show all the songs in the left pane
        let songUL = document.querySelector('.songList').getElementsByTagName('ul')[0];
        songUL.innerHTML = "";  // Clear before new album

        for (let song of songNameURL) {
            let li = document.createElement('li');
            li.setAttribute('data-name', song.name);
            li.setAttribute('data-url', song.url);
            li.innerHTML = `
                <img class='invert' width='34' src='img/music.svg' alt=''>
                <div class='info'>
                    <div>${song.name}</div>
                </div>
                <div class='playNow'>
                    <span>Play Now</span>
                    <img class='invert' width='34' src='img/playnow.svg' alt=''>
                </div>`;
            songUL.appendChild(li);
            observer.observe(li);
        }

        // Attach event listeners to each song
        Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", element => {
                let songname = e.getAttribute("data-name");
                let songUrl = e.getAttribute("data-url");
                playMusic(songUrl, songname);
            });
        });

        return songFiles;

    } catch (err) {
        console.error(`❌ Failed to load songs from ${folder}/manifest.json`, err);
        return [];
    }
}

const playMusic = (trackUrl, trackName) => {
    currentSong.src = trackUrl;
    currentSong.play().then(() => {
        play.src = 'img/pause.svg'; // ✅ playback started, set pause icon
    }).catch((error) => {
        play.src = 'img/play.svg'; // ❌ playback blocked (e.g. auto-play when refresh), show play icon
        console.warn("Playback was prevented:", error);
    });
    document.querySelector(".songinfo").innerHTML = `${trackName}`;
    document.querySelector(".songtime").innerHTML = `00:00 / 00:00`;
}

async function displayAlbums(parentFolder) {
    let albumList = await fetch(`${location.origin}/${parentFolder}/manifest.json`);
let folders = await albumList.json();

let cardContainer = document.querySelector(".cardContainer");

for (let folderName of folders) {
    try {
        let meta = await fetch(`${location.origin}/${parentFolder}/${folderName}/info.json`);
        let info = await meta.json();

        cardContainer.innerHTML += `
            <div data-folder="${parentFolder}/${folderName}" class="card">
                <div class="play">
                    <img src="img/play.svg" class="play_icon" alt="Play">
                </div>
                <img src="${info.coverImg}" alt="SONG">
                <h2 class="title font-2">${info.title}</h2>
                <p class="song_info font-3">${info.description}</p>
            </div>`;
    } catch (e) {
        console.error(`Failed loading ${folderName}:`, e);
    }
}

}

async function main() {
    // Get the list of all songs
    // By default loaded album‼️‼️
    let songs = await getSongs("songs/songs101");
    let albums = await displayAlbums("songs");

    // by default, play the first song
    if (songs.length > 0) {
        playMusic(songNameURL[0].url, songNameURL[0].name);
    }   // Remember it copilot‼️‼️‼️‼️‼️


    // Attaching event listeners to play button
    play.addEventListener("click", () => {
        if (!currentSong.paused) {
            currentSong.pause();
            play.src = 'img/play.svg';
        }
        else {
            play.src = 'img/pause.svg';
            currentSong.play();
        }
    })


    // Listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        let currentTime = secondsToMinutesSeconds(Math.floor(currentSong.currentTime));
        let totalTime = secondsToMinutesSeconds(Math.floor(currentSong.duration));
        document.querySelector(".songtime").innerHTML = `${currentTime} / ${totalTime}`;

        // Update the progress bar
        let circlePoint = document.querySelector('.circle');
        circlePoint.style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
    })

    // Add event listener to seekBar
    document.querySelector('.seekBar').addEventListener('click', (e) => {
        console.log(e.target.getBoundingClientRect().width, e.offsetX);
        let seekBarWidth = e.target.getBoundingClientRect().width;
        let clickPosition = e.offsetX;
        document.querySelector('.circle').style.left = `${(clickPosition / seekBarWidth) * 100}%`;

        // Calculate the new time based on click position
        currentSong.currentTime = (clickPosition / seekBarWidth) * currentSong.duration;
    });

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    // Add event listener for previous button
    document.querySelector('#previous').addEventListener('click', () => {
        // Finds until matched with file /Songs/(....)  ... is file
        let currentFile = currentSong.src.split("/").pop();
        let index = songNameURL.findIndex(song => song.url.split("/").pop() === currentFile);
        if (index - 1 >= 0) {
            playMusic(songNameURL[index - 1].url, songNameURL[index - 1].name);
        }
        else {
            // Start the first song from start
            currentSong.currentTime = 0;
        }

    })

    // Add event listener for next button
    document.querySelector('#next').addEventListener('click', () => {
        // Finds until matched with file /Songs/(....)  ... is file
        let currentFile = currentSong.src.split("/").pop();
        let index = songNameURL.findIndex(song => song.url.split("/").pop() === currentFile);
        if (index + 1 < songNameURL.length) {
            playMusic(songNameURL[index + 1].url, songNameURL[index + 1].name);
        }
        else {
            // Play the first song as next of last song
            playMusic(songNameURL[0].url, songNameURL[0].name);
        }
    })

    // Load the playlist whenever the card is clicked !
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async iteeem => {
            songs = await getSongs(`${iteeem.currentTarget.dataset.folder}`);
        })
    })

    // Play first song of album if .play is clicked 
    document.querySelector('.cardContainer').addEventListener('click', async (e) => {
        if (e.target.classList.contains('play')) {
            e.stopPropagation(); // Block card click
            const card = e.target.closest('.card');
            if (card) {
                await getSongs(card.dataset.folder);
                if (songNameURL.length > 0) {
                    playMusic(songNameURL[0].url, songNameURL[0].name);
                }
            }
        }
    });

}

main();

// 🎧 Volume Slider Logic
const volumeSlider = document.getElementById('volumeSlider');
const volumeProgress = document.getElementById('volumeProgress');
const volumeIcon = document.getElementById('volumeIcon');

function updateVolumeDisplay() {
    volumeProgress.style.width = (currentVolume * 100) + '%';

    if (currentVolume === 0) {
        volumeIcon.src = 'img/volume-mute.svg';
    } else if (currentVolume < 0.5) {
        volumeIcon.src = 'img/volume-low.svg';
    } else {
        volumeIcon.src = 'img/volume.svg';
    }
}

// Add the event listener only once, outside the function!
document.querySelector(".volume-icon").addEventListener("click", e => {
    if (currentSong.volume > 0) {
        currentVolume = 0;
        currentSong.volume = 0;
    } else {
        currentVolume = 0.6; // or previousVolume if you want to store/restore
        currentSong.volume = currentVolume;
    }
    updateVolumeDisplay();
});

volumeSlider.addEventListener('click', function (e) {
    const rect = volumeSlider.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    currentVolume = offsetX / rect.width;

    currentSong.volume = currentVolume;
    updateVolumeDisplay();
});

updateVolumeDisplay();



// Fade Up animation observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Reset animation by forcing reflow
            entry.target.classList.remove('fadeUp');
            void entry.target.offsetWidth; // Trick to restart animation
            entry.target.classList.add('fadeUp');
        }
    });
}, {
    root: document.querySelector('.songList'),  // 👈 Your scroll container
    threshold: 0.2,  // Trigger when at least 20% is visible
});



// Function to convert seconds to MM:SS format
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}