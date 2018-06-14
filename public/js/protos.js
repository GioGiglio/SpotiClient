function Song(id, title, artist, album, imageUrl, path){
	this.id = id;
	this.title = title;
	this.artist = artist;
	this.album = album;
	this.imageUrl = imageUrl;
	this.path = path;
}


function Playlist (id, name){
	this.id = id;
	this.name = name;
	this.songs = [];
	this.addSong = function(song){
		this.songs.push(song);
	}
	this.removeSong = function(id){
		var index = this.songs.indexOf(this.songs.find((x) => x.id == id));
		if (index != -1){
			this.songs.splice(index,1);
		}
		else {
			throw new Error ('Playlist.removeSong(' + id + '): No such song having such id');
		}
	}
	this.removeAllSongs = function(){
		this.songs = [];
	}
}