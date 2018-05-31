function init(){
    initVars();
        
    showMySongs();
    addPlaceholdersPlaylist();

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
    Make the player play a song.
    @param index: the index of the song in the tracks list.
*/
function play(index){
    // TODO: provide track name, and check if the track is already cached;
    // if cache gets filled, remove less played song
    
    console.log('play() called for song:',index);

    if (player.currentSrc === ''){
        // Initial state
        current_song = songs[index];
        player.src= current_song.path;
        player.play();

        // update player song title and image
        $(player_title).text(current_song.title);
        $(player_image).css('background-image','url('+current_song.imageUrl+')');
        
        return;
    }
    
    if (current_song === undefined){
        current_song = songs[index];
    }
    
    if (player.paused){
        // player is paused -> play
        if (current_song !== songs[index]){
            // User clicked a different song from the current one
            current_song = songs[index];
            
            // update audio source
            player.src = current_song.path;
        }
        player.play();
        
    } else {
        // player is playing

        if (current_song !== songs[index]){
            current_song = songs[index];
            
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

    runBoyRun = new Song('Run Boy Run','Woodkid','The Golden Age','media/covers/thegoldenage.jpg','media/run_boy_run.mp3');
    ancora = new Song('Ancora','Eduardo De Crescenzo','All The Best','media/covers/allthebest.jpg','media/ancora.mp3');
    flamingo = new Song('Flamingo','Oliver Heldens','Heldeep','media/covers/heldeep.jpg');

    songs=[];
    songs.push(runBoyRun);
    songs.push(ancora);
    //songs.push(flamingo)

    summer = new Playlist('Summer');
    summer.addSong(runBoyRun);
    summer.addSong(ancora);

    indexer = new Indexer();
    indexer.addKey('mySongs');
    indexer.addKey('allSongs');
    indexer.addKey('playlists');
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