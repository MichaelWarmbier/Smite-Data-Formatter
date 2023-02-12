const fetch = require('@replit/node-fetch');
const fs = require('fs');
const md5 = require('md5');

const smiteAPI = "https://api.smitegame.com/smiteapi.svc/";
const devId = process.env['devID'];
const authKey = process.env['key'];
sId = '';

const langData = {
  Names: ["ENGLISH", "GERMAN", "SPANISH", "PORTUGESE", "LATAM", "CHINESE", "RUSSIAN", "TURKISH", "FRENCH", "POLISH"],
  IDs: [1, 2, 7, 10, 9, 5, 11, 13, 3, 12]
};

// Borrowed from Smite-API-Application

async function createSession() {
  let signature = md5(devId + "createsession" + authKey + getTimeStamp());
  let resp = await fetch(smiteAPI + "createsessionjson/" + devId + '/' + signature + '/' + getTimeStamp());
  sID = (await resp.json()).session_id;
}

async function createSignature(methodName) {
  return md5(devId + methodName + authKey + getTimeStamp());
}

async function createLink(methodName, language) {
  args = [devId, await createSignature(methodName), sID, getTimeStamp(), language];
  let link = smiteAPI + methodName + "json";
  for (let argIndex = 0; argIndex < args.length; argIndex++) 
    link += '/' + args[argIndex];
  return link;
}

function getTimeStamp() {

  const date = new Date();
  let year, month, day, hour, minute, second;

  year = date.getUTCFullYear();
  if (date.getUTCMonth() < 9) month = '0' + (date.getUTCMonth() + 1); 
  else month = date.getUTCMonth() + 1;
  if (date.getUTCDate() < 10) day = '0' + date.getUTCDate(); 
  else day = date.getUTCDate();
  if (date.getUTCHours() < 10) hour = '0' + date.getUTCHours(); 
  else hour = date.getUTCHours();
  if (date.getUTCMinutes() < 10) minute = '0' + date.getUTCMinutes(); 
  else minute = date.getUTCMinutes();
  if (date.getUTCSeconds() < 10) second = '0' + date.getUTCSeconds(); 
  else second = date.getUTCSeconds();

  return '' + year + month + day + hour + minute + second;

}

// Main

lastDayUpdated = (new Date()).getDate();
updateNum = 0;
lastReportUpdate = updateNum;

async function main() {
  //await updateJSON();
  
  
  setInterval(async function() {
    if (lastDayUpdated != (new Date()).getDate()) {
      await updateJSON();
      lastDayUpdated = (new Date()).getDate();
      updateNum++;
    }
      
  }, 1000);
  await logReport("Application ended on " + getTimeStamp());
  console.log("Application has exited.")
} main();


// New Methods

async function updateJSON() {
  let itemResp, godResp, itemData, godData;
  let writeErr = false;
  await createSession();
  
  for (let i = 0; i < langData.Names.length; i++) {
    itemLink = await createLink("getitems", langData.IDs[i]);
    godLink = await createLink("getgods", langData.IDs[i]);
    try {
      itemResp = await fetch(itemLink);
      itemData = await itemResp.json();
    } catch (e)  { 
      await logReport("ERR: unable to fetch data for ITEMS @" + getTimeStamp() + '\n' + itemLink);
      continue;
    }
    
    try {
      godResp = await fetch(godLink);
      godData = await godResp.json();
    } catch (e)  { 
      await logReport("ERR: unable to fetch data for GODS @ " + getTimeStamp()  + '\n' + godLink);
      continue;
    }
    await logReport("SUCCESS: retrieved data in " + langData.Names[i] + ' ' + getTimeStamp());
    
    fs.writeFile("./JSON/" + langData.Names[i] + '/' + langData.Names[i] + "_Items.json", JSON.stringify(itemData), function (err) {
      if (err) writeErr = true;
    });
    fs.writeFile("./JSON/" + langData.Names[i] + '/' + langData.Names[i] + "_Gods.json", JSON.stringify(godData), function (err) {
      if (err) writeErr = true;
    });
    if (!writeErr) await logReport("SUCCESS: stored data in " + langData.Names[i] + ' ' + getTimeStamp());
    else await logReport("ERR: unable to store data for gods and items in " + langData.Names[i] + ' ' + getTimeStamp());
    writeErr = false;
  }
}

async function logReport(text) {
  let fileName = "./REPORTS/update_report_" + getTimeStamp().slice(0, 8) + '_' + updateNum + ".txt";
  if (lastReportUpdate == updateNum)
    fs.appendFile(fileName, text + '\n', function (err) { });
  else {
    lastReportUpdate = updateNum;
    fs.writeFile(fileName, text + '\n', {'flags': 'a'}, function (err) { });
  }
}