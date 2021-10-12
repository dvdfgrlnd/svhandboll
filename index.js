fetch("http://localhost:8000/test")
    .then(res => res.text())
    .then(response => {
        console.debug(response);
    }).catch(error => {
        console.error(error);
    });