function Song(id, title, artist, album, imageUrl, path){
	
	Object.defineProperties(this, {
		'id': {
			value : id,
			writable : false
		},
		'title': {
			value : title,
			writable : false
		},
		'artist': {
			value : artist,
			writable : false
		},
		'album': {
			value : album,
			writable : false
		},
		'imageUrl': {
			value : imageUrl,
			writable : false
		},
		'path': {
			value : path,
			writable : false
		}
	});
}

function Playlist (id, name){

	Object.defineProperties(this, {
		'id': {
			value : id,
			writable : false
		},
		'name': {
			value : name,
			writable : false
		},
		'songs': {
			value : [],
			writable : true
		},
		'addSong': {
			value : function(song){
				this.songs.push(song);
			},
			writable : false
		},
		'removeSong': {
			value : function(id){
				var index = this.songs.indexOf(this.songs.find((x) => x.id == id));
				if (index != -1){
					this.songs.splice(index,1);
				}
				else {
					throw new Error ('Playlist.removeSong(' + id + '): No such song having such id');
				}
			},
			writable : false
		},
		'removeAllSongs': {
			value : function(){
				this.songs = [];
			}
		}
	});
}