function init(){
    player = $('#music_player')[0];
    
    /* GLOBAL INDEXES */
    /* TODO consider creating an object with methods for generating an unsed index number
        var playlists_index = new IndexGenerator();
        playlists_index.getNew();
        playlists_index.remove(index);
    */

    initVars();
        
    showMySongs();
    addPlaceholdersPlaylist();
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
    playlists_index = 0;
    songs_index = 0;
    player_title = $('#player_title')[0];
    player_image = $('#player_image')[0];
    current_song = undefined;

    runBoyRun = new Song('Run Boy Run','Woodkid','The Golden Age','media/covers/thegoldenage.jpg','media/run_boy_run.mp3');
    ancora = new Song('Ancora','Eduardo De Crescenzo','All The Best','media/covers/allthebest.jpg','media/mmh_ha_ha_ha.mp3');
    flamingo = new Song('Flamingo','Oliver Heldens','Heldeep','media/covers/heldeep.jpg');

    songs=[];
    songs.push(runBoyRun);
    songs.push(ancora);
    //songs.push(flamingo)

    summer = new Playlist('Summer');
    summer.addSong(runBoyRun);
    summer.addSong(ancora);

    var i = new Indexer();
    i.addKey('songs');
    i.addKey('playlists');
}