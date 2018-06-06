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
            module.exports.songs(res, connection, results);
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
    function(error,result,fileds){
        if (error) throw error;
        res.json(result);
    });
        
    }
};