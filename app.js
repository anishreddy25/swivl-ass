const express = require("express");
const { request } = require("http");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
var fs = require('fs');
var pdf = require('html-pdf');
const { error } = require("console");

const dbPath = path.join(__dirname, "database.db");
let db = null;

const initializeDBAndServer = async () => {
    try {
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
      });
      app.listen(3000, () => {
        console.log("Server Running at http://localhost:3000/");
      });
    } catch (e) {
      console.log(`DB Error: ${e.message}`);
      process.exit(1);
    }
  };
  
  initializeDBAndServer();

// const db = new sqlite3.Database("./database.db",sqlite3.OPEN_READWRITE, (err)=>{
//         if(err){
//             return console.error(err.message)
//         }
//         else{
//             console.log("Connection sucessfull")
//         }
//     })

// CREATE TABLE
//const sql = `CREATE TABLE users (first_name VARCHAR(200),last_name VARCHAR(200),phone_number VARCHAR(14),email VARCHAR(200))`
// db.run(sql,(err)=>{
//     if(err){
//         return console.error(err.message)
//     }else{
//         console.log("A New Table is Created")
//     }
// })


app.get("/all-users", async(request, response) => {
    const getQuery = `
    SELECT * FROM users;`
    const data = await db.all(getQuery) 
    response.send(data);
  });

app.post("/specific-user",async(request,response)=>{
    const {phonenumber} = request.body
    const getQuery = `
    SELECT * FROM users WHERE phone_number = '${phonenumber}';`
    const data = await db.get(getQuery) 
    response.send(data);
})
app.post("/user", async (request,response)=>{
    const {firstname,lastname,phonenumber,email} = request.body;

    // firstname
    let first = firstname.split("")
    let special = "!@#$%^&*"
    let value1 = true;
    for(let i of first){
        if(special.includes(i)){
            value1= false
            break
        }
    }
    if(!value1){
        throw new Error("Invalid firstname")
    }

    // lastname
    let last = lastname.split("")
    let value2 = true;
    for(let i of last){
        if(special.includes(i)){
            value2= false
            break
        }
    }
    if(!value2){
        throw new Error("Invalid lastname")
    }

    //phonenumber
    let phone = phonenumber.split("")
    let a = phone[0]
    let v1 = a==="+"
    let len = phone.length
    let v2 = (len >= 12 && len<= 14)
    let value3 = false;
    if(v1 && v2){
        value3 = true
    }
    if(!value3){
        throw new Error("Invalid phonenumber")
    }

    //email
    let mail = email
    let value4 = false
    if((mail.includes("@"))&&(mail.includes(".com"))){
        value4 = true
    }
    if(!value4){
        throw new Error("Invalid email")
    }

    let result = {
        value1,value2,value3,value4
    }

    const getUserQuery = `SELECT * FROM users WHERE phone_number = '${phonenumber}';`;
    const dbUser = await db.get(getUserQuery);
    if(dbUser===undefined){
        const sqlpost = `INSERT INTO users (first_name,last_name,phone_number,email)
            VALUES ('${firstname}','${lastname}','${phonenumber}','${email}')`   

        await db.run(sqlpost)
        //response.send("User created successfully");

        var html = fs.readFileSync('./card.html','utf8');
        let options = {
            format:'Letter',
            childProcessOptions:{env:{
                OPENSSL_CONF:'/dev/null',
            }}
        }
        let mapObj= {
            '{{FIRSTNAME}}':firstname,
            '{{LASTNAME}}':lastname,
            '{{PHONENUMBER}}':phonenumber,
            '{{EMAIL}}':email
        }
        html = html.replace(/{{FIRSTNAME}}|{{LASTNAME}}|{{PHONENUMBER}}|{{EMAIL}}/gi,(matched)=>{return mapObj[matched]});
        pdf.create(html,options).toFile('./invoice.pdf',function(err,resp){
            if(err){
                console.log(err);
            }else{
                console.log(resp);
            }
        })

    const filePath = path.join(__dirname, "invoice.pdf");
        response.send(filePath)
    }else{
    response.send("User already exists");
    }
    })

