/**
 * Append a song to the tracks list
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
    $(node_img).addClass('image');
    node_img.style.backgroundImage = 'url('+song.imageUrl+')';
    
    // set onclick to play() and add class
    $(node_li).click(function(e){
        play($(this).attr('value'));
    }).addClass('track');
    
    // assing index to node_li
    song_assign_index(node_li,owner);
    
    node_div.appendChild(node_img);
    node_div.appendChild(node_title);
    node_div.appendChild(node_artist);
    node_div.appendChild(node_album);
    
    node_li.appendChild(node_div);
    tracks_list.appendChild(node_li);
    
    console.log('Track appended');
}

/**
    Assings an auto-incremented index as the attribute 'value' of a song.
    @param li: the <li> element representing the song in the songs list.
*/
function song_assign_index(li,owner){
    var index = (owner === 'user')? indexer.newIndex('mySongs') : indexer.newIndex('allSongs');
    $(li).attr('value',String(index));
}

function resetIndexes(){
    indexer.clear('mySongs');
    indexer.clear('allSongs');
}

function addMyPlaceholdersSongs(){
    for(let i=0; i<songs.length; i++){
        appendTrack(songs[i],'user');
    }
}

function addAllPlaceholdersSongs(){
    appendTrack(runBoyRun,'server');
    appendTrack(ancora,'server');
    appendTrack(flamingo,'server');
}

function removeSongs(){
    $('#tracks_list ul').empty();
}

function showMySongs(){
    // Switch active <a> element
    $('#navbar a:first-child').addClass('active');
    $('#navbar a:nth-child(2)').removeClass('active');
    
    // first remove existing songs
    removeSongs();
    resetIndexes();
    addMyPlaceholdersSongs();

    // change search field to search in 'your songs'
    $('#search_input').attr('placeholder','Search in your songs...');
}

function showAllSongs(){
    // Switch active <a> element
    $('#navbar a:first-child').removeClass('active');
    $('#navbar a:nth-child(2)').addClass('active');

    // first remove existing songs
    removeSongs();
    addAllPlaceholdersSongs();

    // change search field to search in 'all songs'
    $('#search_input').attr('placeholder','Search a song...');
}