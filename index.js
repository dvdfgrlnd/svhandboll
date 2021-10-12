fetch("http://localhost:8000/test")
    .then(res => res.text())
    .then(response => {
        console.debug(response);
    }).catch(error => {
        console.error(error);
    });

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

function createDropdown(name, values) {
    // Create select
    let select = htmlToElement(`<select id="dropdown_${name}"></select>`);
    // Create search field
    let searchfield = htmlToElement(`<input type="text" id="searchfield_${name}" name="" size="10">`);
    // Add values
    values.forEach((elem) => {
        let opt = htmlToElement(`<option value="${elem.id}">${elem.value}</option>`);
        select.appendChild(opt);
    });

    let container = htmlToElement(`<div class="container"></div>`);
    container.appendChild(select);
    container.appendChild(searchfield);

    return container;
}

let blank = {id:"___blank___", value:""};
let c1 = createDropdown("test", [blank, {id:"id1", value:"value1"},{id:"id2", value:"value2"}]);
let c2 = createDropdown("test2", [blank, {id:"id2", value:"value2"}]);

let con = document.querySelector("#container");
con.appendChild(c1);
con.appendChild(c2);