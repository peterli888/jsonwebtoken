/**
   A very minimalist single page application (SPA) to demonstrate
   authentication using JSON Web Tokens (JWT). Note that a production
   environment must use HTTPS.

   @author EHGO Analytics LLC
*/

'use strict';

/**
   Called on form submit to route action.
*/
function signx(event) {
    var form = event.target,
        url = event.target.action,
        button = form.querySelector('[name=button]');

    event.preventDefault();
    event.stopPropagation();

    if ('Sign Out' === button.value) {
        signout(form, button);
    } else {
        signin(form, button, url);
    }
}

function signin(form, button, url) {
    var name = form.querySelector('[name=name]').value,
        password = form.querySelector('[name=password]').value,
        status = document.getElementById('status'),
        data = 'name=' + name + '&password=' + password,
        xhr = new XMLHttpRequest();

    xhr.onerror = function (event) {
        alert('Error: ' + xhr.status + ' ' + xhr.statusText);
    };

    xhr.onreadystatechange = function (event) {
        if (xhr.DONE === xhr.readyState) {
            if (200 === xhr.status) {
                var token = xhr.getResponseHeader('x-access-token');
                sessionStorage.setItem('jwt', token);
                status.innerHTML = xhr.responseText;
                button.value = 'Sign Out';
                button.innerHTML = button.value;
                alert(token);
            } else {
                status.innerHTML = xhr.status + ': ' + xhr.statusText;
                button.value = 'Sign In';
            }
        }
    };

    status.innerHTML = 'Signing in...';
    
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(data);

}

function signout(form, button) {
    sessionStorage.setItem('jwt', null);
    form.querySelector('[name=name]').value = '';
    form.querySelector('[name=password]').value = '';
    button.value = 'Sign In';
    button.innerHTML = button.value;
    document.getElementById('status').innerHTML = 'Not signed in';
    document.getElementById('users').innerHTML = '';
    alert('Signed out');
}

/**
   Add the Web token to all link GET requests. The server will use the
   token as needed.
*/
function linkListener(evt) {
    var xhr = new XMLHttpRequest(),
        url = evt.target.href,
        token = sessionStorage.getItem('jwt');

    evt.preventDefault();
    evt.stopPropagation();

    xhr.onerror = function (event) {
        alert('Error: ' + xhr.status + ' ' + xhr.statusText);
    };

    xhr.onreadystatechange = function (event) {
        var statusEl = document.getElementById('status'),
            users = document.getElementById('users');

        if (xhr.DONE === xhr.readyState) {
            if (200 === xhr.status) {
                users.innerHTML = xhr.responseText;
            } else if (403 === xhr.status) {
                users.innerHTML = '';
                statusEl.innerHTML = 'Not signed in';
                sessionStorage.setItem('jwt', null);
            } else {
                users.innerHTML = '';
                statusEl.innerHTML = xhr.status + ': ' + xhr.statusText;
            } 
        }
    };

    xhr.open('GET', url);
    if (token) {
        xhr.setRequestHeader('x-access-token', token);
    }
    xhr.send();
}

function init() {
    document.forms.namedItem('signx')
        .addEventListener('submit', signx, false);
    document.getElementById('secure')
        .addEventListener('click', linkListener);
    document.getElementById('open')
        .addEventListener('click', linkListener);
}

window.onload = init;
