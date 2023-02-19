///////////////////////////////
/*//// Data /*////

const fetch = require('@replit/node-fetch');
const fs = require('fs');
const md5 = require('md5');

const smiteAPI = "https://api.smitegame.com/smiteapi.svc/";
const devId = process.env['devID'];
const authKey = process.env['key'];
sId = '';

const ref = JSON.parse(fs.readFileSync('reference.json', 'utf-8'));

const langData = {
  Names: ["ENGLISH", "GERMAN", "SPANISH", "PORTUGESE", "LATAM", "CHINESE", "RUSSIAN", "TURKISH", "FRENCH", "POLISH"],
  IDs: [1, 2, 7, 10, 9, 5, 11, 13, 3, 12]
};

const itemClass = {
  Name: null,
  Id: null,
  Stats: [],
  Description: null,
  Ratatoskr: false,
  isGlyph: false,
  Tier: null,
  DamageType: null,
  RestrictedRoles: null,
  Starter: null,
  URL: null,
  Gold: 0,
  SelfGold: 0
};
const godClass = {
  Name: null,
  Id: null,
  Title: null,
  Role: null,
  Type: null,
  Pantheon: null,
  CardArt: null,
  Icon: null,
  Power: null,
  PowerPL: null,
  Speed: null,
  AttackSpeed: null,
  AttackSpeedPL: null,
  Health: null,
  HealthPL: null,
  HP5: null,
  HP5PL: null,
  Mana: null,
  ManaPL: null,
  MP5: null,
  MP5PL: null,
  MagProt: null,
  MagProtPL: null,
  PhysProt: null,
  PhysProtPL: null,
  Passive: null
}
const statClass = {
  StatName: null,
  Value: null
}

///////////////////////////////
/*//// Smite-API-Application Methods /*////

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

/*//// Main /*////

lastDayUpdated = (new Date()).getDate();
updateNum = 0;
lastReportUpdate = updateNum;

async function main() {
  //await updateJSON();
  try { await stripDownJSON(); }
  catch (e) { 
    console.log(e);
    logReport("ERR: Unable to save formatted files " + getTimeStamp());
  }
  console.log("DONE!")
} main();

///////////////////////////////
/*//// Unique Methods /*////

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

///////////////////////////////
/*//// Largest Method /*////

async function stripDownJSON() {

  JSONGodList = [];
  JSONItemList = [];
  objectList = [];

  for (let i = 0; i < langData.Names.length; i++) {
    JSONGodList.push(JSON.parse(fs.readFileSync("JSON/" + langData.Names[i] + "/" + langData.Names[i] + "_Gods.json", "utf-8")));
    JSONItemList.push(JSON.parse(fs.readFileSync("JSON/" + langData.Names[i] + "/" + langData.Names[i] + "_Items.json", "utf-8")))
    objectList.push(new Object());
    objectList[i].Items = [];
    objectList[i].Gods = [];
  }

  // Order alignment
  let basis = JSONGodList[0];
  for (let listIndex = 1; listIndex < JSONGodList.length; listIndex++) {
    let newList = [];
    for (let basisIndex = 0; basisIndex < basis.length; basisIndex++) 
      for (let godIndex = 0; godIndex < JSONGodList[listIndex].length; godIndex++)
        if (JSONGodList[listIndex][godIndex].id == basis[basisIndex].id) {
          newList.push(JSONGodList[listIndex][godIndex]);
          break;
        }
    JSONGodList[listIndex] = newList;
  }

  basis = JSONItemList[0];
  for (let listIndex = 1; listIndex < JSONItemList.length; listIndex++) {
    let newList = [];
    for (let basisIndex = 0; basisIndex < basis.length; basisIndex++) 
      for (let itemIndex = 0; itemIndex < JSONItemList[listIndex].length; itemIndex++)
        if (JSONItemList[listIndex][itemIndex].ItemId == basis[basisIndex].ItemId) {
          newList.push(JSONItemList[listIndex][itemIndex]);
          break;
        }
    JSONItemList[listIndex] = newList;
  }
  
  // God Classification 
  for (let langIndex = 0; langIndex < langData.Names.length; langIndex++) {
    for (let godIndex = 0; godIndex < JSONGodList[langIndex].length; godIndex++) {
      for (let refIndex = 0; refIndex < ref.Gods.length; refIndex++)
        if (JSONGodList[0][godIndex].Name == ref.Gods[refIndex]) {
          let selection = objectList[langIndex].Gods.push(JSON.parse(JSON.stringify(godClass))) - 1;
          await applyGodInfo(objectList[langIndex].Gods[selection], JSONGodList[langIndex][godIndex], godIndex);
          break;
      }
    }
  }


  // Item Classification
  let obj_ref = JSONItemList[0];
  for (let langIndex = 0; langIndex < langData.Names.length; langIndex++) {
    for (itemIndex = 0; itemIndex < JSONItemList[langIndex].length; itemIndex++) {

    if (itemIndex == 42 || itemIndex == 41) continue;
      
    // Physical Items
    for (refIndex = 0; refIndex < ref.PhysDamage.length; refIndex++) 
      if (JSONItemList[0][itemIndex].DeviceName == ref.PhysDamage[refIndex]) {
        let index = objectList[langIndex].Items.push(JSON.parse(JSON.stringify(itemClass))) - 1;
        objectList[langIndex].Items[index].DamageType = "Physical";
        await applyItemInfo(objectList[langIndex].Items[index], JSONItemList[langIndex][itemIndex], itemIndex, obj_ref);
      }
  
    // Magical Items
    for (refIndex = 0; refIndex < ref.MagDamage.length; refIndex++) 
      if (JSONItemList[0][itemIndex].DeviceName == ref.MagDamage[refIndex]) {
        let index = objectList[langIndex].Items.push(JSON.parse(JSON.stringify(itemClass))) - 1;
        objectList[langIndex].Items[index].DamageType = "Magical";
        await applyItemInfo(objectList[langIndex].Items[index], JSONItemList[langIndex][itemIndex], itemIndex, obj_ref);
      }
  
    // Neutral Items
    for (refIndex = 0; refIndex < ref.Neutral.length; refIndex++) 
      if (JSONItemList[0][itemIndex].DeviceName == ref.Neutral[refIndex]) {
        let index = objectList[langIndex].Items.push(JSON.parse(JSON.stringify(itemClass))) - 1;
        objectList[langIndex].Items[index].DamageType = "Neutral";
        await applyItemInfo(objectList[langIndex].Items[index], JSONItemList[langIndex][itemIndex], itemIndex, obj_ref);
      }
  
    // Ratotoskr
    for (refIndex = 0; refIndex < ref.Ratatoskr.length; refIndex++) 
      if (JSONItemList[0][itemIndex].DeviceName == ref.Ratatoskr[refIndex]) {
        let index = objectList[langIndex].Items.push(JSON.parse(JSON.stringify(itemClass))) - 1;
        objectList[langIndex].Items[index].DamageType = "Physical";
        objectList[langIndex].Items[index].Ratatoskr = true;
        await applyItemInfo(objectList[langIndex].Items[index], JSONItemList[langIndex][itemIndex], itemIndex, obj_ref);
      }
      
    }
  }
  
  for (let langIndex = 0; langIndex < langData.Names.length; langIndex++) {
    let lang = langData.Names[langIndex]
    let fileName = "OUTPUT/SmiteData_" + langData.Names[langIndex] + ".json";
    let correctedTitle = lang.charAt(0) + lang.slice(1).toLowerCase() + " = \n";
    fs.writeFile(fileName, correctedTitle, (err) => { })
    fs.appendFile(fileName, JSON.stringify(objectList[langIndex], null, 4), (err) => {
      if (err) {
        logReport("ERR: Unable to save formatted files " + getTimeStamp());
        return;
      }
    });
  }
  logReport("SUCCESS: formatted and saved files " + getTimeStamp());
  
}

async function applyGodInfo(obj, god, i) {
  obj.Name = god.Name;
  obj.Id = god.id;
  obj.Title = god.Title;
  obj.Role = god.Roles;
  obj.Pantheon = god.Pantheon;
  obj.CardArt = god.godCard_URL;
  obj.Icon = god.godIcon_URL;
  obj.Power = god.MagicalPower + god.PhysicalPower;
  obj.PowerPL = god.MagicalPowerPerLevel + god.PhysicalPowerPerLevel;
  if (god.MagicalPower == 0) obj.Type = "Physical";
  else obj.Type = "Magical";
  obj.Speed = god.Speed;
  obj.AttackSpeed = god.AttackSpeed;
  obj.AttackSpeedPL = god.AttackSpeedPerLevel;
  obj.Health = god.Health;
  obj.HealthPL = god.HealthPerLevel;
  obj.HP5 = god.HealthPerFive;
  obj.HP5PL = god.HP5PerLevel;
  obj.Mana = god.Mana;
  obj.ManaPL = god.ManaPerLevel;
  obj.MP5 = god.ManaPerFive;
  obj.MP5PL = god.MP5PerLevel;
  obj.MagProt = god.MagicProtection;
  obj.MagProtPL = god.MagicProtectionPerLevel;
  obj.PhysProt = god.PhysicalProtection;
  obj.PhysProtPL = god.PhysicalProtectionPerLevel;
  try { obj.Passive = god.Ability_5.Description.itemDescription.description; } catch (e) {}
  obj.PassiveName = god.Ability_5.Summary;
}

async function applyItemInfo(obj, item, i, obj_ref) {
  obj.Name = item.DeviceName;
  obj.Id = item.ItemId;
  for (statIndex = 0; statIndex < item.ItemDescription.Menuitems.length; statIndex++) {
    obj.Stats.push(JSON.parse(JSON.stringify(statClass)));
    obj.Stats[statIndex].StatName = item.ItemDescription.Menuitems[statIndex].Description;
    obj.Stats[statIndex].Value = item.ItemDescription.Menuitems[statIndex].Value;
  }
  obj.Description = item.ItemDescription.SecondaryDescription;
  obj.Tier = item.ItemTier;
  obj.Starter = item.StartingItem;
  obj.URL = item.itemIcon_URL;
  obj.RestrictedRoles = item.RestrictedRoles;
  for (glyphIndex = 0; glyphIndex < ref.Glyphs.length; glyphIndex++)
    if (item.DeviceName == ref.Glyphs[glyphIndex]) obj.isGlyph = true;
  obj.SelfGold = item.Price;
  if (!item.childItemId) obj.Gold = obj.SelfGold;
  else {
    let targetItem = getItemById(item.childItemId);
    obj.Gold = 0;
    while (targetItem.childItemId) {
      obj.Gold += targetItem.Price;
      targetItem = targetItem.childItemId;
    }
  }
}

async function getItemById(id, obj_ref) {
  for (let idIndex = 0; idIndex < obj_ref.length; idIndex++)
    if (ob_ref[idIndex].ItemId == id) 
      return obj_ref[idIndex];
}