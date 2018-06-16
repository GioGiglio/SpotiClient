function showLogup(){
    // Hide login form and logup button
    $('#login_form').hide();
    $('#nyr').hide();
    $('#logup_btn').hide();

    // Show logup form and back to login button
    $('#logup_form').show();
    $('#backto_login').show();
}

function showLogin(){
    // hide logup
    $('#logup_form').hide();
    $('#backto_login').hide();

    // show login
    $('#login_form').show();
    $('#nyr').show();
    $('#logup_btn').show();
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
/**
 * Check user input on registration form.
 * @returns true if registration form's data is ok
 */
function logupCheck(){
    var form = $('#logup_form')[0];

    // Check password
    if (form.psw1.value !== form.psw2.value){
        alert('Passwords do not match!');
        return false;
    }
    return true;
}