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
            if (error){
                throw error;
                res.sendStatus(500);
            } else {
                res.status(200).json(results);
            }
        });
    },

    login: function (res, connection, uname, psw) {
        connection.query("SELECT * FROM Users WHERE username = '" + uname + "' AND password = '" + psw + "';",
            function (error, results, fields) {
                if (error) throw error;

                // check if result is valid
                if (results[0] !== undefined) {
                    // Access granted
                    // first set cookie
                    res.cookie('username',uname);
                    res.sendStatus(200);
                    //res.redirect('index.html');
                }
                else {
                    // Access denied
                    res.sendStatus(400);
                    //res.redirect('login.html');
                }
            });
    },

    addUser: function (res, connection, uname, email, psw) {

        // check if the user already exists
        connection.query(' \
        SELECT * from Users \
        WHERE username = "' + uname + '" ;',function(e,r,f){
            if (e){
                throw (e);
                res.sendStatus(500);
                return;
            }
            if (r[0] !== undefined){
                // user already exist
                res.writeHead(400, {"Content-Type":"text/plain"});
                res.end('ERROR: User ' + uname + ' already exists');
                return;
            }
        });

        connection.query("INSERT INTO Users \
        VALUES ('"+ uname + "' , '" + email + "' , '" + psw + "');",
            function (error, results, fields) {
                if (error){
                    res.writeHead(400, {"Content-Type":"text/plain"});
                    res.end("An error occurred");
                    return;
                }

                // insert user in UsersListening table

                connection.query('\
                INSERT INTO UsersListening \
                VALUES ("' + uname +'", -1) ;', function(e,r,f){
                    if (e){
                        throw (e);
                        res.sendStatus(500);
                        return;
                    }
                });

                // set cookie for user
                res.cookie('username',uname);
                res.redirect('index.html');
            });

    },

    songsForUser: function (res, connection, uname) {
        console.log('getting songs for user: ', uname);
        connection.query("SELECT song_id FROM UsersSongs \
    WHERE username = '" + uname + "';",
        function (error, results, fields) {
            if (error){
                throw Error;
                res.sendStatus(500);
                return;
            }
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
        if (error){
            throw error;
            res.sendStatus(500);
        } else {
            res.status(200).json(results);
        }
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
        if (error){
            throw error;
            res.sendStatus(500);
            return;
        }
        res.status(200).json(result);
    }); 
    },

    allSongs: function(res,connection){
        console.log('getting all songs');

        connection.query('select * from Songs;', function(error, result, fields){
            if (error){
                throw error;
                res.sendStatus(500);
                return;
            }
            res.status(200).json(result);
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
        });
    },

    addUserSong: function(res, connection,uname, song_id){
        console.log('adding song', song_id,'to user',uname);

        connection.query('\
        INSERT INTO UsersSongs \
        VALUES ("' + uname + '", ' + song_id + ') \
        ;', function(e,r,f){
            if (e){
                throw e;
                res.sendStatus(500);
                return;
            } else {
                res.sendStatus(200);
            }
        });
    },

    removeUserSong: function(res, connection,uname, song_id){
        console.log('removing song', song_id,'from user',uname);

        connection.query('\
        DELETE FROM UsersSongs \
        WHERE username = "' + uname + '" AND song_id =  ' + song_id + ' ;', function(e,r,f){
            if (e){
                throw e;
                res.sendStatus(500);
                return;
            } else {
                res.sendStatus(200);
            }
        });
    },

    newPlaylist: function(res,connection,uname,playlist_name){
        // first create the playlist
        console.log('creating playlist',playlist_name);
        var playlist_id;

        connection.query('\
        INSERT INTO Playlists (name) \
        VALUES ("' + playlist_name + '");',function(e,r,f){
            if (e){
                throw e;
                res.sendStatus(500);
                return;
            }

            playlist_id = r.insertId;
            
            // now associate the playlist to the user
            console.log('associating',playlist_name,'to',uname);

            connection.query(' \
            INSERT INTO UsersPlaylists \
            VALUES ("' + uname + '", ' + playlist_id + ');', function(e,r,f){
                if (e){
                    throw e;
                    res.sendStatus(500);
                    return;
                } else {
                    res.sendStatus(200);
                }


            });
        });
        
    },

    deletePlaylist: function(res, connection, playlist_id){
        console.log('deleting playlist',playlist_id);
        
        // remove association with songs
        connection.query(' \
        DELETE FROM PlaylistsSongs \
        WHERE playlist_id = ' + playlist_id + ';', function(e,r,f){
            if (e){
                throw e;
                res.sendStatus(500);
                return;
            }
            
            // remove association with users
            connection.query(' \
            DELETE FROM UsersPlaylists \
            WHERE playlist_id = ' + playlist_id + ';', function(e,r,f){
                if (e){
                    throw e;
                    res.sendStatus(500);
                    return;
                }
                // remove entry from Playlists table
		        connection.query(' \
		        DELETE FROM Playlists \
		        WHERE _id = ' + playlist_id + ';', function(e,r,f){
		            if (e){
		                throw e;
		                res.sendStatus(500);
		            } else {
		            	res.sendStatus(200);
		            }
		        });
            });
        });
    },

    updateListening: function(res, connection, uname, song_id){
        console.log('updating listening song for user',uname);

        connection.query('\
        UPDATE UsersListening \
        SET song_id = ' + song_id + ' \
        WHERE username = "' + uname + '" ;', function(e,r,f){
            if (e){
                throw e;
                res.sendStatus(500);
            } else {
                res.sendStatus(200);
            }
        });
    },

    friendsListening: function(res, connection, uname){
        console.log('getting friends listening songs for user', uname);

        // first get following friends list
        connection.query(' \
        SELECT following FROM Friends \
        WHERE username = "' + uname +'" ;', function(e,r,f){
            if (e){
                throw e;
                res.sendStatus(500);
                return;
            }

            if (r.length == 0){
                // No friends for user
                res.statusMessage = 'No friends for user ' + uname;
                res.status(204).end();
                return;
            }
            
            // parse result (following friends)
            var friends = [];
            r.forEach( (x) => {
                friends.push(x.following);
            });

            var in_clause = '';
            for(let i=0; i< friends.length; i++){
                in_clause= in_clause + '"' +friends[i] + '",';
            }
            in_clause = '(' + in_clause.slice(0, -1) + ')';

            // get listening song for friends
            connection.query('\
            SELECT username, title FROM Songs as s JOIN UsersListening as ul ON ul.song_id = s._id \
            WHERE username in '+ in_clause +' ;', function(e,r,f){
                if (e){
                    throw e;
                    res.sendStatus(500);
                } else {
                    res.status(200).json(r);
                }
            });
        });

    },

    addFriend: function(res, connection, uname, friend){
        console.log('adding friend',friend, 'for user', uname);

        // first check if friends exists
        connection.query('\
        SELECT * FROM Users \
        WHERE username = "' + friend + '" ;', function(e,r,f){
            if (e){
                throw e;
                res.sendStatus(500);
                return;
            }

            if (r[0] === undefined){
                // No such user
                res.statusMessage = 'User ' + friend + ' does not exist'
                res.status(400).end();
                return;
            }

            // friend exists, add entry to Friends
            connection.query('\
            INSERT INTO Friends \
            VALUES ("' + uname +'", "' + friend + '");', function(e,r,f){
                if (e){
                    throw e;
                    res.sendStatus(500);
                    return;
                }

                res.sendStatus(200);
            });
        });
    },

    removeFriend: function(res, connection, uname, friend){
        console.log('removing friend',friend, 'for user', uname);

        // first check if friends exists
        connection.query('\
        SELECT * FROM Users \
        WHERE username = "' + friend + '" ;', function(e,r,f){
            if (e){
                throw e;
                res.sendStatus(500);
                return;
            }

            if (r[0] === undefined){
                // No such user
                res.statusMessage = 'User ' + friend + ' does not exist'
                res.status(400).end();
                return;
            }

            // friend exists, remove entry from Friends
            connection.query('\
            DELETE FROM Friends \
            WHERE username = "' + uname + '" AND following = "' + friend + '" ;', function(e,r,f){
                if (e){
                    throw e;
                    res.sendStatus(500);
                    return;
                }
                res.sendStatus(200);
            });
        });
    }
};