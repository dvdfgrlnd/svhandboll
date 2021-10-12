async function fetchseasons() {
    let seasons_json = await (await fetch("http://localhost:8000/listseasons")
    ).json();
    let counties_json = await (await fetch("http://localhost:8000/listcounties")
    ).json();

    return { seasons: seasons_json, counties: counties_json };
}

async function fetchdata(season) {
    let teams_json = await (await fetch(`http://localhost:8000/listteams?season=${season}`)
    ).json();
    let divisions_json = await (await fetch(`http://localhost:8000/listdivisions?season=${season}`)
    ).json();

    return { teams: teams_json, divisions: divisions_json };
}

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

function createDropdown(name, callback) {
    // Create select
    let select = htmlToElement(`<select id="dropdown_${name}"></select>`);
    select.addEventListener("change", callback);
    // Create search field
    let searchfield = htmlToElement(`<input type="text" id="searchfield_${name}" name="" size="10">`);

    let container = htmlToElement(`<div class="dropdown"></div>`);
    container.appendChild(htmlToElement(`<h3>${name}</h3>`));
    container.appendChild(searchfield);
    container.appendChild(select);

    return container;
}

function setdropdownvalues(name, values) {
    let select = document.querySelector(`#dropdown_${name}`);
    // Clear values
    select.innerHTML = "";
    // Add values
    let blank = { id: "___blank___", value: "" };
    [blank].concat(values).forEach((elem) => {
        let opt = htmlToElement(`<option value="${elem.id}">${elem.value}</option>`);
        select.appendChild(opt);
    });
}

let con = document.querySelector("#container");
let frame = document.querySelector("#frame");

let data = {};

let get_season = () => {
    let s = document.querySelector("#dropdown_Seasons");
    let id = parseInt(s.value);
    let matching_season = data.seasons.find(x => x.id === id);

    return matching_season;
}

let season_callback = (element) => {
    let id = parseInt(element.target.value);
    let matching_season = data.seasons.find(x => x.id === id);
    console.log(id, matching_season);
    fetchdata(matching_season.id).then(response => {
        let teams = response.teams.map(v => ({ id: v.TeamId, value: v.TeamName }));
        data["teams"] = teams;
        setdropdownvalues("Teams", teams);

        console.log("matching season", get_season());

        let divisions = response.divisions.map(v => ({ id: v.DivisionId, value: v.DivisionName }));
        data["divisions"] = divisions;
        setdropdownvalues("Divisions", divisions);
    });
};
let j2 = (value) => { console.log(value, value.target.value); };
let j3 = (element) => {
    let id = element.target.value;
    let matching_team = data.teams.find(x => x.id === id);

    frame.src = `https://ta.svenskhandboll.se/SerieAndMatchResult/Review?seasonId=${get_season().id}&teamId=${matching_team.id}&showTeamDivisionTable=true`;
    console.log(element,);
};

con.appendChild(createDropdown("Seasons", season_callback));
con.appendChild(createDropdown("Counties", j2));
con.appendChild(createDropdown("Teams", j3));
con.appendChild(createDropdown("Divisions", j2));

// con.appendChild(createDropdown("Counties", season_callback));

fetchseasons()
    .then(response => {
        // Seasons
        let seasons = response.seasons.map(v => ({ id: v.SeasonId, value: v.SeasonName }));
        data["seasons"] = seasons;
        setdropdownvalues("Seasons", seasons);

        // Counties
        let counties = response.counties.map(v => ({ id: v.CountyId, value: v.CountyName }));
        data["counties"] = counties;
        setdropdownvalues("Counties", counties);


    })
    .catch(e => {
        console.log('Error: ' + e.message);
    });
