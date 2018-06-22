/**
 * Appends a song to the tracks list
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

/**
 * Removes the html elements representing the songs in the tracks section.
 */
function removeSongs(){
    $('#tracks_list ul').empty();
}

/**
 * Fetches user's songs informations from server and displays them in a list.
 */
function showMySongs(){
    // Switch active <a> element
    $('#navbar a:nth-child(2)').addClass('active');
    $('#navbar a:nth-child(3)').removeClass('active');

    // Get users songs

    requests.userSongs( (x) => {
        if (x['status'] === 200){
            console.log('-- RECEIVED: userSongs');

            /* VISUAL CHANGES */
            // remove existing songs
            removeSongs();

            // change search field to search in 'your songs'
            $('#search_input').attr('placeholder','Search in your songs...');

            /* LOGIC */

            // delete current user_songs_ids;
            user_songs_ids = [];

            songs = parseSongs(JSON.parse(x['response']));

            if (songs.length == 0){
                // No songs for user
                return;
            }

            songs.forEach(function(song){
                appendTrack(song,'user');

                // add to user_songs_ids
                user_songs_ids.push(song.id);
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
        else {
            alert('Server errors getting user songs');
        }
    });
}

/**
 * Fetches global songs and display them.
 */
function showAllSongs(){
    // Switch active <a> element
    $('#navbar a:nth-child(2)').removeClass('active');
    $('#navbar a:nth-child(3)').addClass('active');

    // first remove existing songs
    removeSongs();
    
    // Fetch all songs

    requests.allSongs( (x) => {
        if (x['status'] === 200){
            console.log('-- RECEIVED: allSongs');

            /* VISUAL CHANGES */
            // change search field to search in 'all songs'
            $('#search_input').attr('placeholder','Search a song...');

            /* LOGIC */
            songs = parseSongs(JSON.parse(x['response']));
            songs.forEach(function(song){
                appendTrack(song,'server');
            });
        } 
        else {
            alert('Server errors while getting global songs');
        }
    });    
}

/**
 * Parses an array of generics object to an array of Song objects.
 * @param {*} response the generic objects array.
 * @returns an array of Song objects. 
 */
function parseSongs(response){
    var out = [];
    response.forEach(function(s){
        out.push(new Song(s._id, s.title, s.artist, s.album, s.img_source, s.audio_source));
    });
    return out;
}

/**
 * Adds a song to user's songs
 * @param {Song} song_id the id of the song to be added
 */
function addToMySongs(song_id){
    // add to songs
    songs.push(songFromId(song_id));

    // Add to UserSongs Server side and DB

    var data = {
        song_id: song_id
    };

    requests.addToUserSongs(data, (x) => {
        if (x['status'] === 200){
            console.log('-- DONE: addToUserSongs');
        }
        else {
            alert('Errors while adding song');
        }
    });
}

/**
 * Removes a song from the user's songs
 * @param {Song} song_id the id of the song to be removed
 */
function removeFromMySongs(song_id){
    // remove from songs
    var index = songs.indexOf(songs.find((x) => x.id == song_id));
    if (index != -1) songs.splice(index,1);

    // Remove from UserSongs Server side and DB

    var data = {
        song_id: song_id
    };

    requests.removeFromUserSongs(data, (x) => {
        if (x['status'] === 200){
            console.log('-- DONE: removeFromUserSongs');
        }
        else {
            alert('Error while removing song');
        }
        showMySongs();
    });
}