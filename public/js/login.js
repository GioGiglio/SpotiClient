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
    requests.login(obj, (x) => {
        if (x['status'] === 200){
            // request main page
            requests.mainPage();
        }
        else if (x['status'] === 400){
            // invalid username/password
            alert('Invalid username or password');
        }
    });
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