/**
 * Hides login form and shows signup one.
 */
function showLogup(){
    // Hide login form and logup button
    $('#login_form').hide();
    $('#nyr').hide();
    $('#logup_btn').hide();

    // Show logup form and back to login button
    $('#logup_form').show();
    $('#backto_login').show();
}

/**
 * Hides signup form and shows login one.
 */
function showLogin(){
    // hide logup
    $('#logup_form').hide();
    $('#backto_login').hide();

    // show login
    $('#login_form').show();
    $('#nyr').show();
    $('#logup_btn').show();
}

/**
 * Handles login request.
 */
function login(){
    // Get username and password
    var form = $('#login_form')[0];
    var username = form.uname.value;
    var password = form.psw.value;

    // Create JSON object
    var obj = {
        uname: username,
        psw: password.hashCode()
    };

    // Send request
    requests.login(obj, (x) => {
        if (x['status'] === 400){
            // invalid username/password
            alert('Invalid username or password');

            // Clear input fields
            form.uname.value = '';
            form.psw.value = '';
        } else {
            window.location.href = 'index.html';
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

function login_init(){

    fade_login();

    // define hashCode method
    String.prototype.hashCode = function(){
        var hash = 0;
        if (this.length == 0) return hash;
        for (i = 0; i < this.length; i++) {
            char = this.charCodeAt(i);
            hash = ((hash<<5)-hash)+char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }
}

function fade_login() {
    $('#container > div').fadeIn(750);
}