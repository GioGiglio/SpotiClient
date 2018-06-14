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
}

function Indexer(){
	this.keys = [];
	this.addKey = function(key){
		// Check if key already exists
		if (this.keys.find(k => k.key === key) !== undefined){
			throw new Error('Key ' + key + ': already exists');
		}
		this.keys.push({key: key, indexes: []});
	}

	this.key = function(keyToSearch){
		var retval  = this.keys.find(k => k.key === keyToSearch);
		if (retval === undefined)
			throw new Error(keyToSearch + ': No key exists with such name');
		
		return retval;
	}

	this.newIndex = function(key){
		var indexes = this.key(key)['indexes'];

		if(indexes.length === 0){
			// if there aren't any indexes, create the first one
			indexes.push(0);
			return indexes[0];
		}
		// or just create a new one increasing the last one.
		indexes.push(indexes[indexes.length-1] +1 );
		return indexes[indexes.length -1];
	}

	this.indexes = function(key){
		return this.key(key)['indexes'];
	}

	this.clear = function(key){
		this.key(key).indexes = [];
	}
}	