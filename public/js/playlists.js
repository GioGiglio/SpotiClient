/**
    Shows/Hides the content of a playlist.
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
    
    var play = document.createElement('button');
    $(play).addClass('playlist_btn').text('Play').click(function(e){
        playPlaylist(this);
    });

    var edit = document.createElement('button');
    $(edit).addClass('playlist_btn').text('Edit songs').click(function(e){
        editPlaylistModal(this);
    });

    var delete_btn = document.createElement('button');
    $(delete_btn).addClass('playlist_btn').text('Delete')
    .css('background-color','#ee1111').click(function(){
        deletePlaylistAlert(this);
    });
    
    var playlist_song_list = document.createElement('ul');
    $(playlist_song_list).addClass('playlist_song_list');
    
    dropdown_content.appendChild(play);
    dropdown_content.appendChild(edit);
    dropdown_content.appendChild(delete_btn);
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
        appendSongToPlaylist(playlist.song[i],playlist);
    }
}


/**
 * Adds a <li> representing the song, to the html of a playlist item
 * and calls playlist.addSong()
 * @param {Song} song The song to add to playlist 
 * @param {Playlist} playlist the playlist. 
 */
function appendSongToPlaylist(song,playlist){
    console.log('Adding',song.title,'to',playlist.name);
    playlist.addSong(song);

    var songs_list = $('.dropdown[value=' + playlist.id+ '] .playlist_song_list')[0];

    var song_li = document.createElement('li');
    $(song_li).addClass('playlist_song').attr('value',String(song.id));
    
    // Add onclick listener
    $(song_li).click(function(e){
        playing_from_playlist = false;
        playing_playlist_id = undefined;
        play($(this).attr('value'));
    });

    var song_title = document.createElement('span');
    var song_artist = document.createElement('span');

    $(song_title).text(song.title);
    $(song_artist).text(song.artist);

    song_li.appendChild(song_title);
    song_li.appendChild(song_artist);

    songs_list.appendChild(song_li);
}

/**
 * Fetches user playlists.
 */
function showMyPlaylists(){

    requests.userPlaylists( (x) => {
        if (x['status'] === 200){
            console.log('-- RECEIVED: userPlaylists');

            playlists = parsePlaylists(JSON.parse(x['response']));
            playlists.forEach(function(playlist){
                appendPlaylist(playlist);
            });

            // now get songs of each playlist
            fetchPlaylistsSongs(playlists.map(function(p){return p.id}));
        }
        else {
            alert('Server errors getting user playlists');
        }
    });
}

/**
 * Parses an array of generic objects to an array of Playlist objects.
 * @param {Array} response the generic objects array.
 * @returns an array of Playlist objects.
 */
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

    // if ids is empty, don't send request
    if (ids.length == 0){
        console.log('No need to require playlists songs');
        return;
    }

    var obj = {
        ids: ids
    };

    requests.playlistsSongs(obj, (x) => {
        if (x['status'] === 200){
            console.log('-- DONE: playlistsSongs');

            var data = JSON.parse(x['response']);
            var playlist_ids = data.map(function(e){return e.playlist_id;});

            // remove duplicates

            playlist_ids = playlist_ids.filter(function(item, pos, self) {
                return self.indexOf(item) == pos;
            })

            console.log('playlists ids',playlist_ids);

            for (let i=0; i<playlist_ids.length; i++){
                var data_songs = data.filter(function(elem){
                    return elem.playlist_id == playlist_ids[i];
                });

                /*
                if songs aren't in songs array
                Add them in order to be reproduced
                */

                data_songs.forEach(function(s){
                    var curr_song = new Song(s.song_id, s.song_title, s.song_artist,
                        s.song_album, s.song_img_source, s.song_audio_source);

                    // Add curr_song to songs if songs doesn't contain it
                    if(songs.map(function(e){return e.id;}).indexOf(curr_song.id) == -1){
                        
                        // Add to songs
                        songs.push(curr_song);
                            console.log('song',s.song_id,'added to list of songs');
                    } else {
                        console.log('song',s.song_id,'is already in songs');
                    }

                    // Append curr_song to playlist's html
                    var curr_playlist = playlists.filter(function(e){return e.id == s.playlist_id})[0];
                    appendSongToPlaylist(curr_song,curr_playlist);
                });
            }

        }
        else {
            alert('Error while getting playlists songs');
        }
    });
}

/**
 * Adds the playlist's songs to the playing queue and starts playing.
 * @param {*} element the clicked html element} element 
 */
function playPlaylist (element){
    
    var playlist_id = $(element).parent().parent().attr('value');
    var playlist = playlistFromId(playlist_id);

    // empty playing_queue
    playing_queue = [];

    for(let i= playlist.songs.length-1; i >=0; i--){
        playing_queue.unshift(playlist.songs[i]);
    }

    if (playlist.songs.length > 0){
        playing_from_playlist = true;
        playing_playlist_id = playlist_id;

        play(playing_queue.shift().id);
        console.log('Playing from playlist');
    }
}

/**
 * Adds a new playlist for the current user
 * @param playlist_name the name of the new playlist
 */
function addPlaylist(playlist_name){
    console.log('creating playlist',playlist_name);

    var data = {
        playlist_name: playlist_name
    };

    requests.createPlaylist(data, (x) => {
        if (x['status'] === 200){
            console.log('-- DONE: createPlaylist');

            // remove <html> for playlists and refetch playlists.
            $('#playlists > ul').empty();
            showMyPlaylists();
        }
        else {
            alert('Error while creating playlist');
        }
    });
}