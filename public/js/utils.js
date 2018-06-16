/**
 * Bootstrapping
 */
function init(){
    initVars();
    
    showMySongs();
    showMyPlaylists();

    // String hashCode prototype

    String.prototype.hashCode = function(){
        var hash = 0;
        if (this.length == 0) return hash;
        for (i = 0; i < this.length; i++) {
            char = this.charCodeAt(i);
            hash = ((hash<<5)-hash)+char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }
}

/**
 * Shows the AddToPlaylist Modal
 * @param {*} element the clicked html element
 */
function addToPlaylistModal(element){
    // get clicked song
    var selected_song_id = $(element).parent().parent().attr('value');
    var selected_song = songFromId(selected_song_id);

    // show modal and song title
    $('#addToPlaylistModal').show();
    $('#addToPlaylistModal .modal-content > h3').text('Add "' + selected_song.title + '" to:');

    // show playlists
    var ul = $('.modal-content > ul')[0];

    // Add To / Remove From my songs
    var mySongsBtn = document.createElement('li');

    if (user_songs_ids.indexOf(Number(selected_song_id)) == -1){
        // selected_song is not in user's songs
        $(mySongsBtn).text('My Songs').click(function(){
            addToMySongs(selected_song_id);
            closeModal();
        });
    }
    else {
        // selected_song is already in user's songs
        $(mySongsBtn).text('Remove from My Songs').css('background-color','#ee1111').click(function(){
            removeFromMySongs(selected_song_id);
            closeModal();
        });
    }
    
    ul.appendChild(mySongsBtn);
    
    for(let i=0; i< playlists.length; i++){
        var li = document.createElement('li');
        $(li).attr('value',playlists[i].id).text(playlists[i].name);
        ul.appendChild(li);
    }

    // playlist element onclick listener
    $('.modal-content > ul > li:not(:first-child)').click(function(element){
        console.log(element.target);
        var playlist = playlistFromId(element.target.getAttribute('value'));

        // check if song is already in playlist
        if (playlist.songs.map(function(x){return x.id;}).indexOf(selected_song.id) == -1){
            // song is not in playlist
            appendSongToPlaylist(selected_song, playlist);
            
            // updatePlaylist serverside and DB
            var data = {
                playlist_id: playlist.id,
                to_add: [Number(selected_song_id)],
                to_remove: []
            };

            var xhttp = new XMLHttpRequest();
            xhttp.open('POST','/updatePlaylist',true);
            xhttp.onreadystatechange = function() {
                if (xhttp.readyState == XMLHttpRequest.DONE) {
                    if (xhttp.status == 200){
                        console.log('Song added to playlist');
                    }
                    else {
                        alert('Server errors while adding song to playlist');
                    }
                }
            }
            xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhttp.send(JSON.stringify(data));
        }
        else{
            alert(playlist.name + ' already contains ' + selected_song.title + '!');
        }
        closeModal();
    });
}

/**
 * Closes the AddToPlaylist modal
 */
function closeModal(){
    $('#addToPlaylistModal').hide();

    // remove <li> playlist elements
    $('.modal-content > ul').empty();

}

/**
 * Shows the editPlaylist Modal
 * @param {*} element the clicked html element
 */
function editPlaylistModal(element){
    // TODO get clicked playlist
    var playlist_id = $(element).parent().parent().attr('value');
    var selected_playlist = playlistFromId(playlist_id);

    // Show modal and playlist's name
    $('#editPlaylist').show();
    $('#editPlaylist .modal-content > h3').text('Select "' + selected_playlist.name + '" songs:');

    console.log('selected playlist',selected_playlist);

    // show songs
    var ul = $('.modal-content > ul')[1];
    var selected_playlist_songs_ids = selected_playlist.songs.map(function(x){return x.id;});

    console.log('songs ids:',selected_playlist_songs_ids);
    
    for(let i=0; i< songs.length; i++){

        var li = document.createElement('li');
        var input = document.createElement('input');
        var label = document.createElement('label');

        // Add attributes to elements
        $(input).attr('type','checkbox').attr('id',songs[i].id);
        $(label).attr('for',songs[i].id).text(songs[i].title);

        // check songs contained in selected_playlist
        if(selected_playlist_songs_ids.indexOf(songs[i].id) != -1){
            // songs[i] is in selected_playlist
            $(input).prop('checked',true);
        }

        $(li).attr('value',songs[i].id);

        li.appendChild(input);
        li.appendChild(label);
        ul.appendChild(li);
    }

    // done button onClick listener
    $('#editPlaylist button').unbind('click').click(function(e){
        updatePlaylistSongs(selected_playlist);
    });

}

/**
 * Closes the editPlaylist Modal
 */
function editPlaylistClose(){
    $('#editPlaylist').hide();
    $('.modal-content > ul').empty();
}

/**
 * Send informations about the new playlist content to server
 * when playlist's songs get modified
 * @param {*} playlist the playlist to modify
 */
function updatePlaylistSongs(playlist){
    // get Checked and Unchecked songs
    var checked_ids = [];
    var unchecked_ids = [];
    var songs_ids = playlist.songs.map((x) => x.id);

    var check = $('.modal-content > ul > li > input:checked')
    var uncheck = $('.modal-content > ul > li > input:not(:checked)')
    
    for (let i=0; i< check.length; i++){
        checked_ids.push(Number($(check[i]).parent().attr('value')));
    }

    for (let i=0; i< uncheck.length; i++){
        unchecked_ids.push(Number($(uncheck[i]).parent().attr('value')));
    }

    console.log('checked:',checked_ids);
    console.log('unchecked:',unchecked_ids);

    // Songs to be added and removed
    var to_add = checked_ids.filter((x) => songs_ids.indexOf(x) == -1);
    var to_remove = unchecked_ids.filter((x) => songs_ids.indexOf(x) != -1);

    console.log('to add', to_add);
    console.log('to remove',to_remove);

    // Update playlist in database
    var xhttp = new XMLHttpRequest();

    var data = {
        playlist_id: playlist.id ,
        to_add: to_add ,
        to_remove: to_remove
    };

    xhttp.open('POST','/updatePlaylist',true);

    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == XMLHttpRequest.DONE) {
            if (xhttp.status == 200){
                console.log('Playlist updated');
            }
            else {
                alert('Server errors while adding song to playlist');
                return;
            }
            
            // delete html song elements from playlist
            $('.playlist_song_list').empty();
            playlist.removeAllSongs();

            // re-fetch songs
            console.log('utils.UpdatePlaylistSongs calls fetchPlaylistsSongs()');
            fetchPlaylistsSongs([playlist.id]);
        }
    }

    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(JSON.stringify(data));
    editPlaylistClose();
}

/**
 * Shows the createPlaylist Modal
 */
function createPlaylistModal(){
    // Show modal
    $('#createPlaylist').show();

    // Create button onclick listener
    $('#createPlaylist button').unbind('click').click(function(){
        // Get playlist name from <input>
        var playlist_name = $('#createPlaylist input').val();

        addPlaylist(playlist_name);
        createPlaylistClose();
    });

}

/**
 * Closes the createPlaylist Modal
 */
function createPlaylistClose(){
    // Hide modal
    $('#createPlaylist').hide();

    // Clear input field text
    $('#createPlaylist input').val('');
}

/**
 * Get a song object by the id
 * @param {*} id The id of the song.
 * @returns The song object having that id.
 */
function songFromId(id){
    return songs.filter(function(s){return s.id == id})[0];
}

/**
 * Get a playlist object by the id
 * @param {*} id The id of the playlist.
 * @returns The playlist object having that id.
 */
function playlistFromId(id){
    return playlists.filter(function(s){return s.id == id;})[0];
}

/**
    Make the player play a song.
    @param id: the id of the song in the tracks list.
*/
function play(id){
    console.log('play() called for song:',id);

    var to_play = songFromId(id);

    if (player.currentSrc === ''){
        // Initial state
        playing_queue.unshift(to_play);
        populateQueue();
        current_song = to_play;

        player.src= current_song.path;
        player.play();

        // update player song title and image
        $(player_title).text(current_song.title);
        $(player_image).css('background-image','url('+current_song.imageUrl+')');
        
        return;
    }
    
    if (current_song === undefined){
        current_song = to_play;
    }
    
    if (player.paused){
        // player is paused -> play
        if (current_song.id !== to_play.id){
            // User clicked a different song from the current one

            //remove current song from queue and add the new one
            playing_queue.shift();
            playing_queue.unshift(to_play);
            populateQueue();
            current_song = to_play;
            
            
            // update audio source
            player.src = current_song.path;
        }
        player.play();
        
    } else {
        // player is playing

        if (current_song.id !== to_play.id){

            //remove current song from queue and add the new one
            playing_queue.shift();
            playing_queue.unshift(to_play);
            populateQueue();

            current_song = to_play;
            
            // Different song -> play
            player.src = current_song.path;
            player.play();
        }
        else {
            // Same song -> pause
            player.pause();
        }
    }
    // update player song title and image
    $(player_title).text(current_song.title);
    $(player_image).css('background-image','url('+current_song.imageUrl+')');
}

/**
 * Adds next songs to the playing_queue
 */
function populateQueue(){
    // first of all, empty the playling_queue except for the first element
    playing_queue.length = 1;

    // for each track
    $('.track').each(function() {
        var curr_id = Number($(this).attr('value'));
        
        if (curr_id > playing_queue[0].id){
            playing_queue.push(songFromId(curr_id));
        }
    });
}

/**
 * Inits some global variables and click listeners
 */
function initVars(){
    player = $('#music_player')[0];
    player_title = $('#player_title')[0];
    player_image = $('#player_image')[0];
    current_song = undefined;

    songs=[];
    playing_queue = [];
    user_songs_ids = [];
    
    // player on completition listener
    $(player).on('ended', function(){
        var curr_song_index = songs.indexOf(current_song);

        if (curr_song_index < songs.length -1){
            console.log('PLAYER: Playing next song');
            var next_song_id = songs[curr_song_index+1].id;
            play(next_song_id);
        }
        else {
            console.log('PLAYER: Nothing to play');
        }
    });

    // width based behavior
    //$(document).load($(window).bind("resize", checkPosition));
}

function checkPosition(){
    
}

/**
 * Logs the current user out the session
 */
function logout(){
    document.cookie = 'username=;';
    window.location.href="/login.html";
}

/**
 * Filter tracks_list according to user's input.
 */
function search_filter(){
    var user_input = document.getElementById('search_input').value;
    var lis = $('#tracks_list ul')[0].getElementsByTagName('li');

    var key = event.keyCode || event.charCode;

    if (key === 8 || key === 46){
        // backspace or del clicked
        // Show again all songs
        $(lis).show();
    }

    for (let i=0; i<lis.length; i++){
        if( ! lis[i].innerText.toLowerCase().includes(user_input.toLowerCase())){
            // Hide element
            $(lis[i]).hide();
        }
    }

}

/**
 * Shows an alert to confirm to delete a playlist
 * @param {*} element the clicked html element
 */
function deletePlaylistAlert(element){
    var playlist_id = $(element).parent().parent().attr('value');
    var playlist = playlistFromId(playlist_id);

    if (confirm('Are you sure to delete playlist "' + playlist.name+ '" ? \n' + 
                'This action cannot be reverted')){
        console.log('deleting playlist', playlist.name);

        var xhttp = new XMLHttpRequest();
        var data = {
            playlist_id: playlist_id
        };

        xhttp.open('POST','/deletePlaylist',true);
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState == XMLHttpRequest.DONE) {
                if (xhttp.status == 200){
                    console.log('playlist removed');
                }
                else {
                    alert ('Server errors while removing playlist');
                }
            }
        }

        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhttp.send(JSON.stringify(data));
        
        // remove <html> for playlists
        $('#playlists > ul').empty();
        showMyPlaylists();
    }
}

/**
 * Shows or hides the top menu in the mobile view
 */
function menuHideShow(){
    // do not hide in desktop view
    if ( ! $('#navbar_playlists').is(':visible')){
        return;
    }

    var visible = $('#navbar a:nth-child(2)').is(':visible');

    if (visible){
        // hide
        $('#navbar a:not(:first-child)').hide();
    }
    else {
        // show
        $('#navbar a:not(:first-child)').show();
    }
}

/**
 * Show the friendsModal
 */
function friendsModalShow(){
    // show modal
    $('#friendsModal').show();

    // get friends listening songs
    var xhttp = new XMLHttpRequest();
    xhttp.open('GET','/friendsListeningSongs',true);
    xhttp.withCredentials = true;

    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == XMLHttpRequest.DONE) {
            if (xhttp.status == 200){
                console.log('friends listening songs received');
                var result = JSON.parse(xhttp.responseText);

                // Show result
                result.forEach((x) => {
                    appendFriendListening(x.username, Number(x.song_id));
                });

            }
            else if (xhttp.status == 204){
                console.log(xhttp.statusText);
            }
            else{
                alert('Server errors while getting listening songs for friends');
            }
        }
    }
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(null);
}

/**
 * Closes the friendsModal
 */
function friendsModalClose(){
    // hide modal
    $('#friendsModal').hide();

    // clear input field
    $('#friendsModal input').val('');

    // delete friends <li>s
    $('#friendsList').empty();
}

/**
 * Sends a request to the server for adding a user as friend.
 */
function addFriend(){
    // get username from input field
    var username = $('#friendsModal input').val();
    var data = {
        friend: username
    };
    
    var xhttp = new XMLHttpRequest();
    xhttp.open('POST','/addFriend',true);
    xhttp.withCredentials = true;

    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == XMLHttpRequest.DONE) {
            if (xhttp.status == 200){
                console.log('friend added');
            }
            else if (xhttp.status == 400){
                alert(xhttp.statusText);
            }
            else {
                alert('Server errors while adding friend');
            }
        }
    }

    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(JSON.stringify(data));
}

/**
 * Appends html elements representing a friend listening to a song
 * @param {String} username 
 * @param {Number} song_id 
 */
function appendFriendListening(username, song_id){
    if (song_id == -1){
        // user isn't listening to any song
        return;
    }
    var ul = $('#friendsModal ul')[0];
    var li = document.createElement('li');
    $(li).text(username + ' is listening to '+ songFromId(song_id).title);
    ul.appendChild(li);
}