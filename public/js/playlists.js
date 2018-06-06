/**
    Shows/Hides a playlist.
    @param index: the index of the playlist.
*/
function showPlaylistContent(index) {
    var menu = $('li.dropdown[value='+index+'] div.dropdown_content');
    console.log('displaying content of playlist with value:',index);
    if ($(menu).css('display') === 'none') {
        // show menu
        // $(menu).show();
        $(menu).css('display','list-item');
    }
    else {
        // hide menu
        //$(menu).hide();
        $(menu).css('display','none');
    }
}

/**
    Creates the html structure of a playlist element, and sets the playlist's name and id.
    @param name The name of the playlist
    @param id The id to assing to the <li> item representing the playlist.
    @return the <li> element representing the playlist in the playlists list.
*/
function createPlaylist(name,id){
    var list = $('#playlists > ul')[0];
    
    var li = document.createElement('li');
    $(li).addClass('dropdown');
    
    // assing playlist id to <li> element
    $(li).attr('value',String(id));
    
    var img = document.createElement('img');
    $(img).attr('src','media/playlist.svg');
    
    var playlist_name = document.createElement('span');
    $(playlist_name).addClass('playlist_name').click(function(e){
        showPlaylistContent($(this).parent().attr('value'));
    }).text(name);
    
    var dropdown_content = document.createElement('div');
    $(dropdown_content).addClass('dropdown_content').hide();
    
    var input = document.createElement('input');
    $(input).addClass('playlist_input').attr('type','text').attr('placeholder','Search...').keyup(function(e){filterPlaylistContent();});
    
    var playlist_song_list = document.createElement('ul');
    $(playlist_song_list).addClass('playlist_song_list');
    
    var song = document.createElement('li');
    $(song).addClass('playlist_song');
    
    var span_title = document.createElement('span');
    var span_artist = document.createElement('span');
    span_title.textContent = 'Song Title';
    span_artist.textContent = 'Song Artist';
    song.appendChild(span_title);
    song.appendChild(span_artist);
    
    playlist_song_list.appendChild(song);
    
    dropdown_content.appendChild(input);
    dropdown_content.appendChild(playlist_song_list);
    
    li.appendChild(img);
    li.appendChild(playlist_name);
    li.appendChild(dropdown_content);
    list.appendChild(li);

    return li;
}
/**
 * Appends a playlist to the playlists list.
 * @param {Playlist} playlist the playlist to be appendend.
 */
function appendPlaylist(playlist){
    var li = createPlaylist(playlist.name, playlist.id);
   
    // Append all songs to playlist
    for (let i=0; i<playlist.songs.length; i++){
        addToPlaylist(playlist.song[i],playlist);
    }
}

/**
 * Appends a song to the html element representing the list of the songs in a playlist.
 * @param {[Song]} songs The song to be appended to the html playlist item
 * @param {Number} playlist_id The id of the playlist.
 */
function appendSongsToPlaylist(songs, playlist_id){
    
    var li = createPlaylist(playlist.name);
    for(let i=0; i<songs.length; i++){
        // TODO append songs
    }


    var songs_list = $('.dropdown[value=1] .playlist_song_list');
}

function addPlaceholdersPlaylist(){
    createPlaylist('Playlist 1');
    createPlaylist('Playlist 2');
    createPlaylist('Playlist 3');
    createPlaylist('Playlist 4');
    createPlaylist('Playlist 5');
}

/**
 * 
 * @param {Song} song The song to add to playlist 
 * @param {Playlist} playlist the playlist. 
 */
function addToPlaylist(song,playlist){
    console.log('Adding',song.title,'to',playlist.name);
}

function showMyPlaylists(){
    var data = {uname: 'GioGiglio'};
    var xhttp = new XMLHttpRequest();
    xhttp.open('POST','/userPlaylists',true);

    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == XMLHttpRequest.DONE) {
            console.log('response received');
            playlists = parsePlaylists(JSON.parse(xhttp.responseText));
            playlists.forEach(function(playlist){
                appendPlaylist(playlist);
            });

            // now get songs of each playlist
            fetchPlaylistsSongs(playlists.map(function(p){return p.id}));
        }
    }

    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(JSON.stringify(data));
}

function parsePlaylists(response){
    var out = [];
    response.forEach(function(r){
        out.push(new Playlist(r._id, r.name));
    });
    return out;
}

/**
 * Fetches the songs contanied in the user's playlists.
 * @param {Array} ids The array of ids of the playlists.
 */
function fetchPlaylistsSongs(ids){
    var data = JSON.stringify(ids);
    var xhttp = new XMLHttpRequest();
    xhttp.open('POST','/playlistsSongs',true);

    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == XMLHttpRequest.DONE) {
            console.log('Playlists Songs received');
            var data = JSON.parse(xhttp.responseText);
            var playlist_ids = data.map(function(e){return e.playlist_id;});
            console.log('playlists ids',playlist_ids);

            for (let i=0; i<playlist_ids.length; i++){
                var data_songs = data.filter(function(elem){
                    return elem.playlist_id == playlist_ids[i];
                });

                /*
                if songs aren't in songs array
                Add them in order to reproduce them
                */

                data_songs.forEach(function(s){
                    console.log(s);
                    if(songs.map(function(e){return e.id;}).indexOf(s.song_id) == -1){
                        
                        // add to songs
                        songs.push(new Song(s.song_id, s.song_title, s.song_artist,
                            s.song_album, s.song_img_source, s.song_audio_source));
                            console.log('song',s.song_id,'added to list of songs');
                    } else {
                        console.log('song',s.song_id,'is already in songs');
                    }
                });
            }
        }
    }

    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(data);
}