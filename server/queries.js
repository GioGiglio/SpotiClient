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
        // TODO implement
    }
};