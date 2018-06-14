/**
 * Append a song to the tracks list
 * @param {Song} song The song object to append
 * @param {String} owner 'user' if track belongs to the user, otherwise 'server'
 */
function appendTrack(song,owner){
    var tracks_list = $('#tracks_list > ul')[0];
    var node_li = document.createElement('li');
    var node_div = document.createElement('div');
    var node_img = document.createElement('div');
    var node_title = document.createElement('p');
    var node_artist = document.createElement('p');
    var node_album = document.createElement('p');
    
    node_title.textContent= song.title;
    node_artist.textContent= song.artist;
    node_album.textContent= song.album;
    // set onclick listener
    $(node_img).addClass('image').click(function(e){
        e.stopPropagation();
        addToPlaylistModal(this);
    });
    node_img.style.backgroundImage = 'url('+song.imageUrl+')';
    
    // set onclick to play() and add class
    $(node_li).click(function(e){
        play($(this).attr('value'));
    }).addClass('track');
    
    // assing id to node_li
    $(node_li).attr('value',String(song.id));
    
    node_div.appendChild(node_img);
    node_div.appendChild(node_title);
    node_div.appendChild(node_artist);
    node_div.appendChild(node_album);
    
    node_li.appendChild(node_div);
    tracks_list.appendChild(node_li);
    
    console.log('Track appended');
}

function addMyPlaceholdersSongs(){
    for(let i=0; i<songs.length; i++){
        appendTrack(songs[i],'user');
    }
}

function addAllPlaceholdersSongs(){
    appendTrack(runBoyRun,'server');
    appendTrack(ancora,'server');
    appendTrack(flamingo,'server');
}

function removeSongs(){
    $('#tracks_list ul').empty();
}

/**
 * Fetch user's songs informations from server and displays them in a list.
 */
function showMySongs(){
    // Switch active <a> element
    $('#navbar a:first-child').addClass('active');
    $('#navbar a:nth-child(2)').removeClass('active');

    // Get users songs
    var xhttp = new XMLHttpRequest();

    // get current user username
    var data = {uname: 'GioGiglio'};

    xhttp.open('POST','/userSongs',true);

    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == XMLHttpRequest.DONE) {
            console.log('response received');
            songs = parseSongs(JSON.parse(xhttp.responseText));
            songs.forEach(function(song){
                appendTrack(song,'user');
            });

            // Add playlists songs
            var songs_ids = songs.map(function(x){return x.id});
            
            for (let i=0; i< playlists.length; i++){
                for (let j=0; j< playlists[i].songs.length; j++){
                    if (songs_ids.indexOf(playlists[i].songs[j].id) === -1) {
                        // playlist's song is not in songs
                        songs.push(playlists[i].songs[j]);
                        console.log('playlist:',playlists[i].name,
                        'song:', playlists[i].songs[j].title,'added');
                    }
                }
            }
        }
    }

    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(JSON.stringify(data));


    // remove existing songs
    removeSongs();

    // change search field to search in 'your songs'
    $('#search_input').attr('placeholder','Search in your songs...');
}

function showAllSongs(){
    // Switch active <a> element
    $('#navbar a:first-child').removeClass('active');
    $('#navbar a:nth-child(2)').addClass('active');

    // first remove existing songs
    removeSongs();
    
    // Fetch all songs

    var xhttp = new XMLHttpRequest();
    xhttp.open('GET','/allSongs',true);

    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == XMLHttpRequest.DONE) {
            console.log('all songs received');
            songs = parseSongs(JSON.parse(xhttp.responseText));
            songs.forEach(function(song){
                appendTrack(song,'server');
            });
        }
    }

    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send();


    // change search field to search in 'all songs'
    $('#search_input').attr('placeholder','Search a song...');
}

function parseSongs(response){
    var out = [];
    response.forEach(function(s){
        out.push(new Song(s._id, s.title, s.artist, s.album, s.img_source, s.audio_source));
    });
    return out;
}

/**
 * Adds a song to user's songs
 * @param {Song} song the song to be added
 */
function addToMySongs(song){
    
}