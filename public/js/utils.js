function init(){
    initVars();
        
    showMySongs();
    showMyPlaylists();

    //addPlaceholdersPlaylist();

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
 * 
 * @param {*} id The id of the song.
 * @returns The song object having that id.
 */
function songFromId(id){
    return songs.filter(function(s){return s.id == id})[0];
}

/**
    Make the player play a song.
    @param id: the id of the song in the tracks list.
*/
function play(id){
    // TODO: provide track name, and check if the track is already cached;
    // if cache gets filled, remove less played song
    
    console.log('play() called for song:',id);

    if (player.currentSrc === ''){
        // Initial state
        current_song = songFromId(id);

        player.src= current_song.path;
        player.play();

        // update player song title and image
        $(player_title).text(current_song.title);
        $(player_image).css('background-image','url('+current_song.imageUrl+')');
        
        return;
    }
    
    if (current_song === undefined){
        current_song = songFromId(id);
    }
    
    if (player.paused){
        // player is paused -> play
        if (current_song !== songFromId(id)){
            // User clicked a different song from the current one
            current_song = songFromId(id);
            
            // update audio source
            player.src = current_song.path;
        }
        player.play();
        
    } else {
        // player is playing

        if (current_song !== songFromId(id)){
            current_song = songFromId(id);
            
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

function initVars(){
    player = $('#music_player')[0];
    player_title = $('#player_title')[0];
    player_image = $('#player_image')[0];
    current_song = undefined;

    songs=[];
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
 * @returns The username associated with the cookie.
 */
function parseCookie(){
    return document.cookie.split(':')[1];
}