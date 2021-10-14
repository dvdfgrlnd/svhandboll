let base_url = "https://svhandboll.herokuapp.com";
// let base_url = "http://localhost:8000";

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
    let c = htmlToElement(`<div class="d2" id="dropdown_${name}"></div>`);
    let i = htmlToElement(`<input type="text" id="searchfield_${name}" placeholder="${name}" name="" size="10">`);
    i.addEventListener("input", (e) => search_callback(e.target.value));
    i.addEventListener("click", () => {
        let dp = document.querySelector(`#dropdown_${name} > div.d3`);
        dp.hidden = !dp.hidden;
    });
    let b = htmlToElement(`<button type="button" id="clearbutton_${name}">X</button>`);
    let d = htmlToElement(`<div class="d3"></div>`);
    d.addEventListener("click", (e) => {
        let element = e.target;
        if (element.classList.contains("d4")) {
            // Close dropdown on click
            document.querySelector(`#dropdown_${name} > div.d3`).hidden = true;
            // Send event
            let id = element.attributes.myid.value;
            c.value = id;
            // Set input text to clicked item value
            i.value = element.innerText;
            // Send onclick event
            c.dispatchEvent(new Event("change"));
        }
    });


    d.hidden = true;

    b.addEventListener("click", () => {
        i.value = "";
        i.dispatchEvent(new Event("input"));
    });

    c.appendChild(i);
    c.appendChild(b);
    c.appendChild(d);

    c.addEventListener("change", callback);

    return c;
}

function setdropdownvalues(name, values) {
    values.sort((a, b) => a.value.localeCompare(b.value));
    let d = document.querySelector(`#dropdown_${name} > div.d3`);
    d.innerHTML = "";
    let blank = { id: "___blank___", value: "" };
    [blank].concat(values).forEach((elem) => {
        let p = htmlToElement(`<p class="d4" myid="${elem.id}">${elem.value}</p>`);
        d.appendChild(p);
    });
}

function get_input(name){
    return document.querySelector(`#dropdown_${name} #searchfield_${name}`).value;
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
        search("Teams", "teams")(get_input("Teams"), true);

        let divisions = response.divisions.map(v => ({ id: v.DivisionId, value: v.DivisionName }));
        data["divisions"] = divisions;
        search("Divisions", "divisions")(get_input("Divisions"), true);
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

    if (selections.season && (selections.team || selections.division)) {
        let id_or_empty = (v) => v || { id: "" };
        frame.src = `https://ta.svenskhandboll.se/SerieAndMatchResult/Review?seasonId=${selections.season.id}&teamId=${id_or_empty(selections.team).id}&divisionId=${id_or_empty(selections.division).id}&showTeamDivisionTable=true`;
    }
};


let con = document.querySelector("#container");
let frame = document.querySelector("#frame");

let search = (name, values) => (search_term, hidden=false) => {
    document.querySelector(`#dropdown_${name} > div.d3`).hidden = hidden;
    var filtered = undefined;
    if (search_term) {
        let words = search_term.split(" ");

        filtered = data[values].filter(f => words.every(word => f.value.toLowerCase().includes(word.toLowerCase())));
    } else {
        filtered = data[values]
    }
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

        let season_element = Array.from(document.querySelectorAll("#dropdown_Seasons p.d4"));
        let current_season_element = season_element.find((e) => e.attributes.myid.value === String(current_season.SeasonId));
        if (current_season_element) {
            current_season_element.click();
        }


        // Counties
        // let counties = response.counties.map(v => ({ id: v.CountyId, value: v.CountyName }));
        // data["counties"] = counties;
        // setdropdownvalues("Counties", counties);

    })
    .catch(e => {
        console.log('Error: ' + e.message);
    });


