/**
 * Bootstrapping
 */
function init(){
    initVars();
    
    showMySongs();
    showMyPlaylists();
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

            requests.updatePlaylist(data, (x) => {
                if (x['status'] === 200){
                    console.log('-- DONE: updatePlaylist');
                }
                else {
                    alert('Server errors while adding song to playlist');
                }
            });
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
    var data = {
        playlist_id: playlist.id ,
        to_add: to_add ,
        to_remove: to_remove
    };

    requests.updatePlaylist(data, (x) => {
        if (x['status'] === 200){
            console.log('-- DONE: updatePlaylist');
           
            // delete html song elements from playlist
            $('.dropdown[value=' + playlist.id+ '] .playlist_song_list').empty();
            playlist.removeAllSongs();

            // re-fetch songs
            fetchPlaylistsSongs([playlist.id]);
        }
        else {
            alert('Server errors while modifying playlist songs');
        }
    });

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

    var song_to_play = songFromId(id);

    if (playing_from_playlist){
        // playing from a playlist
        // do not calc playing_queue

        player.src = song_to_play.path;
        player.play();
        current_song = song_to_play;
        // update graphics
        updatePlayingInfo();
        return;
    }

    // initial state
    if (player.currentSrc === ''){
        player.src = song_to_play.path;
        player.play();
        current_song = song_to_play;
        // update graphics
        updatePlayingInfo();
        populateQueue();
        return;
    }

    if (player.paused){
        // player is paused
        if (current_song.id === song_to_play.id){
            // same song -> play
            player.play()
        }
        else {
            // different song -> replace
            player.src = song_to_play.path;
            player.play();
            current_song = song_to_play;
            // update graphics
            updatePlayingInfo();
            populateQueue();
        }
    }
    else {
        // player is playing
        if (current_song.id === song_to_play.id){
            // same song -> pause
            player.pause();
        }
        else {
            // different song -> replace
            player.src = song_to_play.path;
            player.play();
            current_song = song_to_play;
            // update graphics
            updatePlayingInfo();
            populateQueue();
        }
    }

}

function play_prev(){
    // find previous song
    var previous_id = -1;
    var target;

    if (playing_from_playlist){
        target = '.dropdown[value=' + playing_playlist_id + '] .playlist_song';
    }
    else {
        target = '.track';
    }

    $(target).each(function() {
        var curr_id = Number($(this).attr('value'));
        
        if (curr_id === current_song.id){
            // break the loop
            return false;
        }
        previous_id = curr_id;
    });

    if (previous_id !== -1){
        play(previous_id);
    }
    else {
        console.log('There\'s not a previous song');
    }
    
}

function play_next(){
    if (playing_queue.length > 0){

        if (playing_from_playlist){
            play(playing_queue.shift().id);
        }
        else{
            // not playing from playlist
            play(playing_queue[0].id);
        }
    }
    else {
        console.log('There\'s not a next song');
    }
}

/**
 * Updates player info
 */
function updatePlayingInfo(){
    // update player song title and image
    $(player_title).text(current_song.title);
    $(player_image).css('background-image','url('+current_song.imageUrl+')');
    $('#play_prev, #play_next').css('display','inline');
}

/**
 * Adds next songs to the playing_queue
 */
function populateQueue(){
    // first of all, empty the playling_queue except for the first element
    playing_queue = [];

    // for each track
    $('.track').each(function() {
        var curr_id = Number($(this).attr('value'));
        
        if (curr_id > current_song.id){
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
    playing_from_playlist = false;
    playing_playlist_id = undefined;

    songs=[];
    playing_queue = [];
    user_songs_ids = [];
    
    // player on completition listener
    $(player).on('ended', function(){

        if (playing_queue.length > 0){
            console.log('- Player: Playing next song');

            if (playing_from_playlist){
                play(playing_queue.shift().id);
            }
            else {
                // not playing from playlist
                play(playing_queue[0].id);
            }

            //if (playing_from_playlist) playing_queue.shift();

        }
        else {
            console.log('- Player: Nothing to play');
            playing_queue = [];
            if (playing_from_playlist){
                playing_from_playlist = false;
                playing_playlist_id = undefined;
            }
            // update listening song to -1 in server
            updateListeningSong(-1);
        }
    });

    // First-time initialization
    if (window.width <= 768){
        // track list -> full width
        $('#tracks_list').removeClass('col-9').addClass('col-12');

        // audio player -> full width
        $('#music_player').removeClass('col-8').addClass('col-12');
    }

    // Media queries
    $(window).on('resize', function() {
        var win = $(this);
        if (win.width() <= 768) {
            // track list -> full width
            $('#tracks_list').removeClass('col-9').addClass('col-12');

            // audio player -> full width
            $('#music_player').removeClass('col-8').addClass('col-12');
        }
        else {
            // back to default view

            // track list -> reduced width
            $('#tracks_list').removeClass('col-12').addClass('col-9');

            // audio player -> reduced width
            $('#music_player').removeClass('col-12').addClass('col-8');
        }
    });
}

/**
 * Updates the listening song for the user in the server
 * @param {Number} song_id the id of listening song
 * @param {function} callback an optional callback function
 */
function updateListeningSong(song_id, callback){
    console.log('Updating listening song to',song_id);

    var data = {
        song_id: song_id
    };

    requests.updateListeningSong(data, (x) => {
        if (x['status'] === 200){
            console.log('-- DONE: updateListeningSong');
        }
        else {
            alert('Errors while updating listening song');
        }

        if (callback !== undefined)
            callback();

    });
}

/**
 * Show PlaylistsList
 * Called only in mobile view
 */
function showPlaylists(){

    // if playlists are already showing, hide them
    if ($('#playlists').is(':visible')){
        hidePlaylists();
        return;
    }

    // hide tracksList
    $('#tracks_list').removeClass('col-9').hide();

    // show playlists
    $('#playlists').removeClass('col-3').addClass('col-12')
    .css('margin-left','10px').css('margin-top','120px')
    .show();

    menuHideShow();
    alert('Click again PLAYLISTS to hide them');
}

/**
 * Hides playlists
 * Called only in mobile view
 */
function hidePlaylists(){
    // hides playlists
    $('#playlists').removeClass('col-12').addClass('col-3').hide();
    //.css('margin-left','10px').css('margin-top','120px')

    // show tracksList
    $('#tracks_list').addClass('col-9').show();

    menuHideShow();
}

/**
 * Logs the current user out the session
 */
function logout(){
    // reset listeningSong
    updateListeningSong(-1, function(){
        // updateListeningSong completed

         // reset cookie
        document.cookie = 'username=;';

        // redirect to login.html
        window.location.href="/login.html";
    });
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
        
        var data = {
            playlist_id: playlist_id
        };

        requests.deletePlaylist(data, (x) => {
            if (x['status'] === 200){
                console.log('-- DONE: deletePlaylist');
                showMyPlaylists();
            }
            else {
                alert('Errors while deleting playlist');
            }
        });

        // remove <html> for playlists
        $('#playlists > ul').empty();
    }
}

/**
 * Shows or hides the top menu in the mobile view
 */
function menuHideShow(){
    // do not hide in desktop view
    if ( ! $('#menu_hide_show').is(':visible')){
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
    
    requests.friendsListeningSongs( (x) => {
        if (x['status'] === 200){
            console.log('-- RECEIVED: friendsListeningSongs');
            var result = JSON.parse(x['response']);

            // Show result
            result.forEach((x) => {
                appendFriendListening(x.username, x.title);
            });
        }
        else if (x[status] === 204){
            console.log('- No friends for user');
        }
        else {
            alert('Error while getting listening songs for friends');
        }
    });
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

    // check empty string
    if (username === ''){
        alert('Please insert username');
        return;
    }

    var data = {
        friend: username
    };

    requests.addFriend(data, (x) => {
        if (x['status'] === 200){
            console.log('-- DONE: addFriend');
        }
        else if (x[status] === 400){
            alert('No such user ' + username);
        }
        else {
            alert('Error while adding friend');
        }
    });

    friendsModalClose();
}

/**
 * Appends html elements representing a friend listening to a song
 * @param {String} username 
 * @param {String} song_title 
 */
function appendFriendListening(username, song_title){
    var ul = $('#friendsModal ul')[0];
    var li = document.createElement('li');
    $(li).text(username + ' is listening to '+ song_title);
    ul.appendChild(li);
}

function removeFriend(){
    // get username from input field
    var username = $('#friendsModal input').val();

    // check empty string
    if (username === ''){
        alert('Please insert username');
        return;
    }

    var data = {
        friend: username
    };

    requests.removeFriend(data, (x) => {
        if (x['status'] === 200){
            console.log('-- DONE: removeFriend');
        }
        else if (x['status'] === 400){
            alert('No such user ' + username);
        }
        else {
            alert('Error while removing friend');
        }
    });
    
    friendsModalClose();
}