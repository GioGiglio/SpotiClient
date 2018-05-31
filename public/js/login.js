function showLogup(){
    // Hide login form
    $('#login_form').hide();

    // Show logup form
    $('#logup_form').show();
}

function login(){
    // Get username and password
    var form = $('#login_form')[0];
    var username = form.uname.value;
    var password = form.psw.value;

    // Create JSON object
    var obj = {uname: username, psw: password};

    // Send request
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "server.js", true);
    xhttp.send(JSON.stringify(obj));
}