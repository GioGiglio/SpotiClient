function init(){
    player = $('#music_player')[0];
    
    /* GLOBAL INDEXES */
    /* TODO consider creating an object with methods for generating an unsed index number
        var playlists_index = new IndexGenerator();
        playlists_index.getNew();
        playlists_index.remove(index);
    */
    playlists_index = 0;
    songs_index = 0;
    
    initVars();

    // Init current song
    current_song = undefined;
    
    // song title
    player_title.textContent='currentSong.title';
    player_title.textContent='RUN BOY RUN';
    
    showMySongs();
    addPlaceholdersPlaylist();
    
    var tracks = $('.track .image');
    for (var i=0; i<tracks.length; i++){
        //tracks[i].addEventListener('mouseover',song_hover(tracks[i],i));
    }
}

/**
    Make the player play a song.
    @param index: the index of the song in the tracks list.
*/
function play(index){
    // TODO: provide track name, and check if the track is already cached;
    // if cache gets filled, remove less played song
    
    // TODO handle playing songs[index];
    console.log('play() called for song:',index);
    
    if (current_song === undefined){
        current_song = songs[index];
    } 
    else {
        
    }

    if (player.paused){
        player.play();
        
    } else {
        player.pause();
    }
}

function song_hover(track,index){
    var hover_img = player.paused ? 'url(../media/play.svg)' : 'url(../media/pause.svg)';
    track.style.backgroundImage = hover_img;
}

function initVars(){
    runBoyRun = new Song('Run Boy Run','Woodkid','The Golden Age','media/covers/thegoldenage.jpg');
    ancora = new Song('Ancora','Eduardo De Crescenzo','All The Best','media/covers/allthebest.jpg');
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

    player_title = $('#player_title')[0];
}