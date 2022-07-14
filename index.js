#!/usr/bin/env node

const fs = require("fs");
const { io } = require("socket.io-client");
const agent_info = require("./agent_info");
const spawn = require('child_process').spawn;
var status = {}
status.agent_status = "connected";
status.agent_running = "stopped";
const path = require("path");
const Confirm = require('prompt-confirm');
const prompts = require("prompts");


async function start() {
    try {
        var project_path = process.cwd();

        if(!fs.existsSync(path.join(project_path , "pawn.json"))){
          console.log("Pawn config not found");
          console.log("Please add pawn.json");
         // process.exit(1);
        }
        var package_json = require(project_path + "/pawn.json");
        var cypress_json = package_json
        

        if(cypress_json == null){
            console.log("Pawn config not found");
            console.log("Please add pawn.json");
            process.exit(1);
        }
       

        if (package_json) {
            console.log("Commander Remote Runner"); 

            if(!package_json.server_url){
              // const prompt = new Confirm({
              //     name: 'sync_mode', 
              //     message: 'PLease provide server url',
              // });
              // var ans = await prompt.ask();
              // console.log(ans);

              console.log("No server url set")

              const response = await prompts({
                type: 'text',
                name: 'server_url',
                message: 'Please provide server url?'
              });
            
              //console.log(response.server_url);

              if(!isValidHttpUrl(response.server_url)){
                console.log("Invalid URL");
                console.log("Please re run the command");
                process.exit(1);
              }

              package_json.server_url = response.server_url;

              fs.writeFileSync(path.join(project_path , "pawn.json"),JSON.stringify(package_json,null,2));

              console.log("Server URL set");
            }
            if(!package_json.project_id){

              console.log("-----------------------------------------------------")

              console.log("No project set")

              const project_id = await prompts({
                type: 'text',
                name: 'project_id',
                message: 'Please project ID?'
              });

              package_json.project_id = project_id.project_id;

              fs.writeFileSync(path.join(project_path , "pawn.json"),JSON.stringify(package_json,null,2));

              console.log("Project ID set");
            }
            
            console.log(`Pawn Name : ${package_json.name} connecting to server!`)
            console.log(`Server URL : ${package_json.server_url}`)

            console.table(package_json)


            const socket = io(package_json.server_url);
            socket.on("connect", async function () {
                console.log("Connected to Commander Server");
                var res = await agent_info.getinfo();
                var d = {
                    project_id: package_json.project_id,
                    system_info: res,
                    status: status,
                    agent_name: package_json.number
                }
                console.log("Project ID ", d)
                socket.emit("join_agent", d);
            });

            //var res = await agent_info.getinfo();
            // var d = {
            //     agent_id: socket.id,
            //     project_id: package_json.tiny_cypress.project_id,
            //     system_info: res,
            //     status: status,
            //     agent_name: package_json.tiny_cypress.agent_name
            // };
            // socket.emit("agent_info_recv", d);

            socket.on("agent_start", async function (data) {
                
                if(package_json.tiny_cypress.agent_name == data.agents){
                    console.log("Agent Start Requested");
                    if(status.agent_running == "stopped"){
                        status.agent_running = "started";
                        console.log("Agent Started");
                        cypress.run(cypress_json)
                        .then(result => {
                            var res = {
                                result : result,
                                status: "finished",
                            }
                           // console.log("Cypress Run Result",res);
                            status.agent_running = "stopped";
                            socket.emit("agent_result", res);
                        })
                        .catch(err => {
                            console.error(err.message)
                            var res = {
                                result : err,
                                status: "err",
                            }
                          //  console.log("Cypress Run Result",res);
                            status.agent_running = "stopped";
                            socket.emit("agent_result", res);
                        })
                    }else{
                        console.log("Agent Already Running");
                    }
                }
  
            });
            socket.on("agent_info_send", async function () {
                console.log("Agent Info Sent");
                var res = await agent_info.getinfo();
                var d = {
                    agent_id: socket.id,
                    project_id: package_json.project_id,
                    system_info: res,
                    status: status,
                    agent_name: package_json.agent_name
                };
                socket.emit("agent_info_recv", d);
            });

            socket.on("agent_status_send", function (data) {
                socket.emit("agent_status_recv", status);
            });

            socket.on("agent_specs_send", function (data) {
                socket.emit("agent_specs_recv", status);
            });

            // socket.on("ui_after_spec_media", async function (data) {
            //     console.log("UI After Spec Media");
            //     console.log(data,__dirname)
            //     console.log("Agent media request");
            //     var base_data  = Buffer.from(JSON.stringify(data), 'utf-8');
            //     var base_url = Buffer.from( package_json.tiny_cypress.server_url, 'utf-8');
            //     var child = spawn('node', [path.join(__dirname,'./uploader.js'),base_data.toString('base64'),base_url.toString('base64')]);
            //     child.stdout.setEncoding('utf8');
            //     child.stdout.on('data', function (data) {
            //         //Here is where the output goes
            
            //         console.log('stdout: ' + data);
            
            //         //data=data.toString();
            //         //scriptOutput+=data;
            //     });
            
            //     child.stderr.setEncoding('utf8');
            //     child.stderr.on('data', function (data) {
            //         //Here is where the error output goes
            
            //         console.log('stderr: ' + data);
            
            //         //data=data.toString();
            //         //scriptOutput+=data;
            //     });
            
            //     child.on('close', function (code) {
            //         //Here you can get the exit code of the script
            
            //         console.log('closing code: ' + code);
            
            //         //console.log('Full output of script: ', scriptOutput);
            //     });
            // });




        } else {
            console.log("Commander config not found");
            console.log("Please configure Commander in package.json");
            process.exit(1);
        }





    } catch (error) {
        console.log(error)
        console.log("cypress not installed");
        console.log("Install cypress with: npm install cypress");
        console.log("Then run: npm run cypress:run");
        console.log("Existing ..");
        process.exit(1);


    }
}

start()


function isValidHttpUrl(string) {
  let url;
  
  try {
    url = new URL(string);
  } catch (_) {
    return false;  
  }

  return url.protocol === "http:" || url.protocol === "https:";
}


// const axios = require("axios")

// var project_path = process.cwd();

// var package_json = require(project_path + "/package.json");

// var cypress_json = null;

// if(fs.existsSync(project_path + "/cypress.json")){
//     cypress_json = fs.readFileSync(project_path + "/cypress.json");
// }else{

// }



//const cypress = require('cypress')




