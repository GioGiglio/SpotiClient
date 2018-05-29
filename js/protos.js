function Song(title, artist, album, imageUrl){
	this.title = title;
	this.artist = artist;
	this.album = album;
	this.imageUrl = imageUrl;
}

function Playlist (name){
	this.name = name;
	this.songs = [];
	this.addSong = function(song){
		this.songs.push(song);
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
}