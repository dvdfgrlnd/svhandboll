// let base_url = "https://svhandboll.herokuapp.com";
let base_url = "http://localhost:8000";

async function fetchseasons() {
    let seasons_json = await (await fetch(`${base_url}/listseasons`)
    ).json();
    let counties_json = await (await fetch(`${base_url}/listcounties`)
    ).json();

    return { seasons: seasons_json, counties: counties_json };
}

async function fetchdata(season) {
    let teams_json = await (await fetch(`${base_url}/listteams?season=${season}&club=`)
    ).json();
    let divisions_json = await (await fetch(`${base_url}/listdivisions?season=${season}`)
    ).json();

    return { teams: teams_json, divisions: divisions_json };
}

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

function createDropdown(name, callback, search_callback) {
    // Create select
    let select = htmlToElement(`<select id="dropdown_${name}"></select>`);
    select.addEventListener("change", callback);
    // Create search field
    let searchfield = htmlToElement(`<input type="text" id="searchfield_${name}" name="" size="10">`);
    searchfield.addEventListener("input", (e) => search_callback(e.target.value))

    let container = htmlToElement(`<div id="dropdown_container_${name}" class="dropdown"></div>`);
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

let data = {};

let get_selections = () => {
    let season_id = document.querySelector("#dropdown_Seasons").value;
    let matching_season = (data.seasons || []).find(x => String(x.id) === season_id);

    let county_id = document.querySelector("#dropdown_Counties".value);
    let matching_counties = (data.counties || []).find(x => String(x.id) === county_id);

    let team_id = document.querySelector("#dropdown_Teams").value;
    let matching_team = (data.teams || []).find(x => String(x.id) === team_id);

    let division_id = document.querySelector("#dropdown_Divisions").value;
    let matching_division = (data.divisions || []).find(x => String(x.id) === division_id);

    return { season: matching_season, county: matching_counties, team: matching_team, division: matching_division };
}

let season_callback = () => {
    let matching_season = get_selections().season;
    console.log(matching_season, get_selections());
    fetchdata(matching_season.id).then(response => {
        let teams = response.teams.map(v => ({ id: v.TeamId, value: v.TeamName }));
        data["teams"] = teams;
        setdropdownvalues("Teams", teams);

        console.log("matching season", get_selections());

        let divisions = response.divisions.map(v => ({ id: v.DivisionId, value: v.DivisionName }));
        data["divisions"] = divisions;
        setdropdownvalues("Divisions", divisions);
    });

    // Activate divsions and teams
    teamscontainer.style.opacity = 1;
    divisionscontainer.style.opacity = 1;
};

let team_and_divsion_callback = (element) => {
    if (element.target.id === "dropdown_Teams") {
        let division = document.querySelector("#dropdown_Divisions");
        division.value = undefined;
    } else if (element.target.id === "dropdown_Divisions") {
        let team = document.querySelector("#dropdown_Teams");
        team.value = undefined;
    }
    let selections = get_selections();
    console.log("selections", selections);
    // let id = element.target.value;
    // let matching_team = data.teams.find(x => x.id === id);

    if (selections.season && (selections.team || selections.division)) {
        let id_or_empty = (v) => v || { id: "" };
        frame.src = `https://ta.svenskhandboll.se/SerieAndMatchResult/Review?seasonId=${selections.season.id}&teamId=${id_or_empty(selections.team).id}&divisionId=${id_or_empty(selections.division).id}&showTeamDivisionTable=true`;
    }
};


let con = document.querySelector("#container");
let frame = document.querySelector("#frame");

let search = (name, values) => (s) => {
    let filtered = s ? data[values].filter(f => f.value.toLowerCase().includes(s.toLowerCase())) : data[values];
    setdropdownvalues(name, filtered);
}
let seasonscontainer = createDropdown("Seasons", season_callback, search("Seasons", "seasons"));
// let countiescontainer = createDropdown("Counties", j2);
let teamscontainer = createDropdown("Teams", team_and_divsion_callback, search("Teams", "teams"));
teamscontainer.style.opacity = 0.1;
let divisionscontainer = createDropdown("Divisions", team_and_divsion_callback, search("Divisions", "divisions"));
divisionscontainer.style.opacity = 0.1;

con.appendChild(seasonscontainer);
// con.appendChild(countiescontainer);
con.appendChild(teamscontainer);
con.appendChild(divisionscontainer);




fetchseasons()
    .then(response => {
        // Seasons
        let seasons = response.seasons.map(v => ({ id: v.SeasonId, value: v.SeasonName }));
        data["seasons"] = seasons;
        setdropdownvalues("Seasons", seasons);
        let current_season = response.seasons.find(v => v.SeasonInProgress);
        let element = document.querySelector("#dropdown_Seasons");
        element.value = String(current_season.SeasonId);
        element.dispatchEvent(new Event('change'));


        // Counties
        // let counties = response.counties.map(v => ({ id: v.CountyId, value: v.CountyName }));
        // data["counties"] = counties;
        // setdropdownvalues("Counties", counties);

    })
    .catch(e => {
        console.log('Error: ' + e.message);
    });
