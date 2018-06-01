function querySongs(res){
    connection.query('SELECT * FROM Songs', function (error, results, fields) {
    if (error) throw error;
    console.log(results);
    });
}

function queryLogin(res, uname, psw){
    connection.query("SELECT * FROM Users WHERE username = '"+uname+"' AND psw_hash = '"+psw+"'",
    function(error, results, fields){
        if (error) throw error;
        
        // check if result is valid
        if (results[0] !== undefined){
            // Access granted, redirect to /
            res.redirect('/');
        }
        else {
            // Access denied, redirect to login.html
            res.redirect('login.html');
        }
    });
}

function queryAddUser(res, uname, email, psw){
    connection.query("INSERT INTO Users \
    VALUES ('"+uname+"' , '"+email+"' , '"+psw+"');",
    function(error, results, fields){
        if (error) throw error;
        res.redirect('/');
    });
}