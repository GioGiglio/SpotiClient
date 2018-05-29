/**
    Shows/Hides a playlist.
    @param index: the index of the playlist.
*/

function showPlaylistContent(index) {
    var menu = $('li.dropdown[value='+index+'] div.dropdown_content');
    console.log('displaying content of playlist with value:',index,'\n',menu);
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
    Assings an auto-incremented index as the attribute 'value' of a playlist.
    @param li: the <li> element representing the playlist in the playlists list.
*/
function playlist_assign_index(li){
    $(li).attr('value',String(playlists_index++));
}

/**
    Creates the html structure of a playlist element, and sets the playlist's name.
    @param name the name to be set to the new playlist.
    @return the <li> element representing the playlist in the playlists list.
*/
function createPlaylist(name){
    var list = $('#playlists > ul')[0];
    
    var li = document.createElement('li');
    $(li).addClass('dropdown');
    
    // assing index to playlist
    playlist_assign_index(li);
    
    $(li).attr('value',playlists_index);
    
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

function appendPlaylist(playlist){
    var li = createPlaylist(playlist.name);
    playlist_assign_index(li);

    // Get playlist index
    var playlists_names = $('.dropdown .playlist_name');
    var playlist_index = -1;

    for (let i=0; i< playlists_names.length; i++){
        if ($(playlists_names)[i].text() === playlist.name){
            playlist_index = i;
            break;      
        }
    }

    if(playlist_index === -1){
        throw new Error(playlist.name + ' no such playlist');
    }
   
    // Append all songs to playlist
    appendSongsToPlaylist(playlist.songs,playlist_index);
}

/**
 * Appends a song to the html element representing the list of the songs in a playlist.
 * @param {[Song]} songs The song to be appended to the html playlist item
 * @param {Number} playlist_index The index of the playlist in the playlists list.
 */
function appendSongsToPlaylist(songs, playlist_index){
    
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

function addToPlaylist(song,playlist){
    
}