module.exports = {
    
    songs: function (res, connection, results) {
        // get songs ids
        var in_clause = '';
        for(let i=0; i< results.length; i++){
            in_clause= in_clause + results[i].song_id + ',';
        }
        in_clause = '(' + in_clause.slice(0, -1) + ')';

        connection.query('SELECT * FROM Songs WHERE _id IN ' + in_clause + ';',
        function (error, results, fields) {
            if (error) throw error;
            res.json(results);
        });
    },

    login: function (res, connection, uname, psw) {
        connection.query("SELECT * FROM Users WHERE username = '" + uname + "' AND password = '" + psw + "';",
            function (error, results, fields) {
                if (error) throw error;

                // check if result is valid
                if (results[0] !== undefined) {
                    // Access granted, redirect to /
                    res.redirect('/');
                }
                else {
                    // Access denied, redirect to login.html
                    res.redirect('login.html');
                }
            });
    },

    addUser: function (res, connection, uname, email, psw) {
        connection.query("INSERT INTO Users \
    VALUES ('"+ uname + "' , '" + email + "' , '" + psw + "');",
            function (error, results, fields) {
                if (error){
                    res.writeHead(400, {"Content-Type":"text/plain"});
                    res.end("An error occurred");
                    return;
                }
                res.redirect('/');
            });

    },

    songsForUser: function (res, connection, uname) {
        console.log('getting songs for user: ', uname);
        connection.query("SELECT song_id FROM UsersSongs \
    WHERE username = '" + uname + "';",
        function (error, results, fields) {
            if (error) throw Error;
            console.log('result is ',results);
            if (results.length == 0){
                console.log('No songs for user', uname);
                res.json(results);
            }
            else {
                // request songs
                module.exports.songs(res, connection, results);
            }
        });
    },

    playlistsForUser: function (res, connection, uname) {
        console.log('getting playlists for user: ', uname);
        connection.query("select p._id, p.name \
        from Playlists as p, UsersPlaylists as up \
        WHERE p._id = up.playlist_id \
        AND up.username = '" + uname +"';",
    function(error, results, fields){
        if (error) throw error;
        res.json(results);
    });
    },

    playlistsSongs: function(res, connection, ids){
        console.log('getting songs for playlists:', ids);

        var in_clause = '';
        for(let i=0; i< ids.length; i++){
            in_clause= in_clause + ids[i] + ',';
        }
        in_clause = '(' + in_clause.slice(0, -1) + ')';

        connection.query('select playlist_id, s._id as song_id, s.title as song_title, s.artist as song_artist, \
        s.album as song_album, s.img_source song_img_source, audio_source as song_audio_source \
        FROM Songs s, Playlists p, PlaylistsSongs as ps \
        WHERE p._id in ' + in_clause +' AND ps.playlist_id = p._id AND ps.song_id = s._id;',
    function(error,result,fields){
        if (error) throw error;
        res.json(result);
    }); 
    },

    allSongs: function(res,connection){
        console.log('getting all songs');

        connection.query('select * from Songs;', function(error, result, fields){
            if (error) throw error;
            res.json(result);
        });
    },

    addSongsToPlaylist: function(connection,playlist_id, songs){
        console.log('adding songs ',songs, 'to playlist',playlist_id);

        var values = '';
        for(let i=0; i<songs.length; i++){
            values = values + '(' +playlist_id + ',' + songs[i] + '),';
        }
        values = values.slice(0,-1);

        connection.query(' \
        INSERT INTO PlaylistsSongs \
        VALUES ' + values + ' ;', function(e,r,f){
            if (e) throw e;
            return r;
        });
    },

    removeSongsFromPlaylist: function(connection, playlist_id, songs){
        console.log('removing songs', songs, 'from playlist', playlist_id);

        var in_clause = '';
        for(let i=0; i< songs.length; i++){
            in_clause = in_clause + songs[i] + ',';
        }
        in_clause = '(' + in_clause.slice(0, -1) + ')';

        connection.query(' \
        DELETE FROM PlaylistsSongs \
        WHERE playlist_id = ' + playlist_id +' \
        AND song_id IN ' + in_clause + ' ;', function(e,r,f){
            if (e) throw e;
            return r;
        });
    },

    addUserSong: function(res, connection,uname, song_id){
        console.log('adding song', song_id,'to user',uname);

        connection.query('\
        INSERT INTO UsersSongs \
        VALUES ("' + uname + '", ' + song_id + ') \
        ;', function(e,r,f){
            if (e) throw e;
            res.json(r);
        });
    },

    removeUserSong: function(res, connection,uname, song_id){
        console.log('removing song', song_id,'from user',uname);

        connection.query('\
        DELETE FROM UsersSongs \
        WHERE username = "' + uname + '" AND song_id =  ' + song_id + ' ;', function(e,r,f){
            if (e) throw e;
            res.json(r);
        });
    },

    newPlaylist: function(res,connection,uname,playlist_name){
        // first create the playlist
        console.log('creating playlist',playlist_name);
        var playlist_id;

        connection.query('\
        INSERT INTO Playlists (name) \
        VALUES ("' + playlist_name + '");',function(e,r,f){
            if (e) throw e;

            playlist_id = r.insertId;
            
            // now associate the playlist to the user
            console.log('associating',playlist_name,'to',uname);

            connection.query(' \
            INSERT INTO UsersPlaylists \
            VALUES ("' + uname + '", ' + playlist_id + ');', function(e,r,f){
                if (e) throw e;
                res.json(r);
            });
        });
        
    }
};