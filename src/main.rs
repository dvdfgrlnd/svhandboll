#[macro_use]
extern crate rocket;

use isahc::{prelude::*, Request as IsahcRequest};

use rocket::fairing::{Fairing, Info, Kind};
use rocket::http::{ContentType, Header, Method, Status};
use rocket::{Data, Request, Response};

struct Counter;

#[rocket::async_trait]
impl Fairing for Counter {
    // This is a request and response fairing named "GET/POST Counter".
    fn info(&self) -> Info {
        Info {
            name: "GET/POST Counter",
            kind: Kind::Request | Kind::Response,
        }
    }

    async fn on_response<'r>(&self, _request: &'r Request<'_>, response: &mut Response<'r>) {
        response.set_header(Header::new("Access-Control-Allow-Origin", "*"));
        response.set_header(Header::new(
            "Access-Control-Allow-Methods",
            "POST, GET, PATCH, OPTIONS",
        ));
        response.set_header(Header::new("Access-Control-Allow-Headers", "*"));
        response.set_header(Header::new("Access-Control-Allow-Credentials", "true"));
    }
}


#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}

type HttpError = String;

fn make_request(url: &str) -> Result<String, HttpError> {
    let result = IsahcRequest::builder()
        .uri(url)
        .header("Referer", "https://ta.svenskhandboll.se/")
        .body(())
        .map_err(|x| x.to_string())
        .and_then(|x| x.send().map_err(|x| x.to_string()))
        .map(|mut r| {
            // Print some basic info about the response to standard output.
            // println!("Status: {}", r.status());
            // println!("Headers: {:#?}", r.headers());

            // Read the response body as text into a string and print it.
            let text = r.text().unwrap_or_else(|x| x.to_string());

            text
        });

    result
}

#[get("/listcounties")]
fn listcounties() -> Result<String, String> {
    let url = "https://services.svenskhandboll.se/v1/api/County/ListCounties?APIKey=28c7X8AK";
    make_request(url)
}

#[get("/listteams?<season>")]
fn listteams(season: &str) -> Result<String, String> {
    let url = format!("https://services.svenskhandboll.se/v1/api/Team/ListTeamsByClubAndSeasonWithFavorites?APIKey=28c7X8AK&clubId=&seasonId={}&favIds=0", season);
    make_request(&url)
}

#[get("/listdivisions?<season>&<countyid>")]
fn listdivisions(season: &str, countyid: Option<&str>) -> Result<String, String> {
    let url = format!("https://services.svenskhandboll.se/v1/api/Division/ListDivisionsWithFavorites?APIKey=28c7X8AK&favIds=0&countyId={}&seasonId={}", countyid.unwrap_or(""), season);
    make_request(&url)
}

#[get("/listseasons")]
fn listseasons() -> Result<String, String> {
    let url = "https://services.svenskhandboll.se/v1/api/Season/ListSeasons?APIKey=28c7X8AK";
    make_request(url)
}


#[launch]
fn rocket() -> _ {
    rocket::build()
        .mount("/", routes![index, listcounties, listteams, listdivisions, listseasons])
        .attach(Counter)
}
