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

    console.log(username, password);

    // Create JSON object
    var obj = {uname: username, psw: password};

    // Send request
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/login", true);
    xhttp.setRequestHeader('Content-Type','application/json');
    
    // On receive
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            console.log(xhttp.responseText);
        }
    }

    // send request
    xhttp.send(JSON.stringify(obj));
}