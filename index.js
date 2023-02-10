// store current time
// store iteration of updates
// check iteration and current time to determine if enough time has passed
// IF: true, update time, begin process. OPTIONAL: manual process
// process standard, based on original
// generate report (timestamp?)

const langData = {
  Names = ["ENGLISH", "GERMAN", "SPANISH", "PORTUGESE", "LATAM", "CHINESE", "RUSSIAN", "TURKISH", "FRENCH", "POLISH"];
  IDs = [1, 2, 7, 10, 9, 5, 11, 13, 3, 12];
};

case '1': language = 1; break;
        case '2': language = 2; break;
        case '3': language = 3; break;
        case '4': language = 5; break;
        case '5': language = 7; break;
        case '6': language = 9; break;
        case '7': language = 10; break;
        case '8': language = 11; break;
        case '9': language = 12; break;
        case '10': language = 13; break;

async function main() {
  await updateJSON();
  let lastDayUpdated = (new Date()).getDate();
  
  setInterval(async function() {
    if (lastDayUpdated != (new Date()).getDate()) {
      await updateJSON();
      lastDayUpdated = (new Date()).getDate();
    }
      
  }, 1000);
  console.log("Application has exited.")
}

async function updateJSON() {
  // get JSON and store in respective folders
  await logReport();
}

async function logReport() {
 // Log result of each JSON grab 
}


function generateTimestamp() {
  const date = new Date();

  const day = date.getDate();
  const month = date.getMonth() + 1; 
  const year = date.getFullYear();
  const hour = date.getHours() - 5;

  return month + '-' + day + '-' + year + ' ' + (hour > 12 ? hour - 12 : hour) + (hour >= 12 ? "pm" : "am");
}

function filterJSON() {
  
}