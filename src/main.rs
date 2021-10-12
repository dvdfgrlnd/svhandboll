#[macro_use]
extern crate rocket;

use isahc::prelude::*;

#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}

#[get("/test")]
fn index2() -> Result<String, String> {
    // Send a GET request and wait for the response headers.
    // Must be `mut` so we can read the response body.

    let response = isahc::get("https://www.google.com");
    let response2 = match response{
        Ok(mut r) => {
            // Print some basic info about the response to standard output.
            println!("Status: {}", r.status());
            println!("Headers: {:#?}", r.headers());

            // Read the response body as text into a string and print it.
            let t = r.text().unwrap_or("error".to_string());
            print!("{}", t);

            t
        },
        Err(e) => {
            // "error2".to_string()
            format!("{:?}", e)
        },
    };


    Ok(response2)
}

#[launch]
fn rocket() -> _ {
    rocket::build()
    .mount("/", routes![index, index2])
}
