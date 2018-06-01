module.exports = {
    
    songs: function (res, results) {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.write(results); // You Can Call Response.write Infinite Times BEFORE response.end
        res.end("Hello World\n");
        console.log(results);
        return;
    },

    login: function (res, connection, uname, psw) {
        connection.query("SELECT * FROM Users WHERE username = '" + uname + "' AND psw_hash = '" + psw + "';",
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
                if (error) throw error;
                res.redirect('/');
            });

    },

    songsForUser: function (res, connection, uname) {
        connection.query("SELECT song_id FROM UsersSongs \
    WHERE username = '" + uname + "';",
        function (error, results, fields) {
            if (error) throw Error;
            songs(res, results);
        });
    }
};