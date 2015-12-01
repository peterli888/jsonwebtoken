var signin = function (ev) {
    var form = ev.target,
        name = form.querySelector('[name=name]').value,
        password = form.querySelector('[name=password]').value,
        status = document.getElementById('status'),
        data = 'name=' + name + '&password=' + password,
        xhr = new XMLHttpRequest(),
        url = ev.target.action;

    xhr.onerror = function (event) {
        alert('Error: ' + xhr.status + ' ' + xhr.statusText);
    };

    xhr.onreadystatechange = function (event) {
        if (xhr.DONE === xhr.readyState) {
            if (200 === xhr.status) {
                var token = xhr.getResponseHeader('x-access-token');
                sessionStorage.setItem('jwt', token);
                alert(token);
                status.innerHTML = xhr.responseText;
            } else {
                status.innerHTML = xhr.status + ': ' + xhr.statusText;
            }
        }
    };

    status.innerHTML = 'Signing in...';
    
    ev.preventDefault();

    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(data);

};

var usersLinkListener = function () {
    var xhr = new XMLHttpRequest(),
        url = event.target.href,
        token = sessionStorage.getItem('jwt'),
        users = document.getElementById('users');
    
    event.preventDefault();
    
    xhr.onerror = function (event) {
        alert('Error: ' + xhr.status + ' ' + xhr.statusText);
    };
    
    xhr.onreadystatechange = function (event) {
        if (xhr.DONE === xhr.readyState) {
            if (200 === xhr.status) {
                users.innerHTML = xhr.responseText;
            } else if (403 === xhr.status) {
                users.innerHTML = '';
                document.getElementById('status').innerHTML = 'Not logged in';
                sessionStorage.setItem('jwt', null);
            } else {
                users.innerHTML = '';
                document.getElementById('status').innerHTML = xhr.status + ': ' + xhr.statusText;
            } 
        }
    };

    xhr.open('GET', url);
    if (token) {
        xhr.setRequestHeader('x-access-token', token);
    }
    xhr.send();
};

var init = function () {
    document.forms.namedItem('signin').addEventListener('submit', signin, false);
    document.getElementById('secure').addEventListener('click', usersLinkListener);
};

window.onload = init;
