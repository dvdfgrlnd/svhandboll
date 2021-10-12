#[macro_use]
extern crate rocket;

use isahc::{prelude::*, Request as IsahcRequest};


use rocket::{Request, Data, Response};
use rocket::fairing::{Fairing, Info, Kind};
use rocket::http::{Method, ContentType, Status, Header};

struct Counter;

#[rocket::async_trait]
impl Fairing for Counter {

    // This is a request and response fairing named "GET/POST Counter".
    fn info(&self) -> Info {
        Info {
            name: "GET/POST Counter",
            kind: Kind::Request | Kind::Response
        }
    }

    async fn on_response<'r>(&self, request: &'r Request<'_>, response: &mut Response<'r>) {
        response.set_header(Header::new("Access-Control-Allow-Origin", "*"));
        response.set_header(Header::new("Access-Control-Allow-Methods", "POST, GET, PATCH, OPTIONS"));
        response.set_header(Header::new("Access-Control-Allow-Headers", "*"));
        response.set_header(Header::new("Access-Control-Allow-Credentials", "true"));
        // // Don't change a successful user's response, ever.
        // if response.status() != Status::NotFound {
        //     return
        // }

        // // Rewrite the response to return the current counts.
        // if request.method() == Method::Get && request.uri().path() == "/counts" {
        //     let get_count = self.get.load(Ordering::Relaxed);
        //     let post_count = self.post.load(Ordering::Relaxed);
        //     let body = format!("Get: {}\nPost: {}", get_count, post_count);

        //     response.set_status(Status::Ok);
        //     response.set_header(ContentType::Plain);
        //     response.set_sized_body(body.len(), Cursor::new(body));
        // }
    }
}
// pub struct CORS;

// impl Fairing for CORS {
//     fn info(&self) -> Info {
//         Info {
//             name: "Add CORS headers to responses",
//             kind: Kind::Response
//         }
//     }

//     fn on_response(&self, request: &Request, response: &mut Response) {
//         response.set_header(Header::new("Access-Control-Allow-Origin", "*"));
//         response.set_header(Header::new("Access-Control-Allow-Methods", "POST, GET, PATCH, OPTIONS"));
//         response.set_header(Header::new("Access-Control-Allow-Headers", "*"));
//         response.set_header(Header::new("Access-Control-Allow-Credentials", "true"));
//     }
// }

#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}

#[get("/test")]
fn index2() -> Result<String, String> {
    // Send a GET request and wait for the response headers.
    // Must be `mut` so we can read the response body.

    // let response = isahc::get("https://www.google.com");
    let url = "https://services.svenskhandboll.se/v1/api/County/ListCounties?APIKey=28c7X8AK";
    //  -H 'Referer: '
    let re = IsahcRequest::builder()
        .uri(url)
        .header("Referer", "https://ta.svenskhandboll.se/")
        .body(());
    let response2 = match re {
        Ok(r) => {
            let response2 = match r.send() {
                Ok(mut r) => {
                    // Print some basic info about the response to standard output.
                    println!("Status: {}", r.status());
                    println!("Headers: {:#?}", r.headers());

                    // Read the response body as text into a string and print it.
                    let t = r.text().unwrap_or("error".to_string());
                    print!("{}", t);

                    t
                }
                Err(e) => {
                    // "error2".to_string()
                    format!("{:?}", e)
                }
            };

            response2
        }
        Err(_) => "".to_string()
    };

    Ok(response2)
}

#[launch]
fn rocket() -> _ {
    rocket::build()
    .mount("/", routes![index, index2])
    .attach(Counter)
}
