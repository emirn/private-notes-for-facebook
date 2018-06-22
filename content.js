function writeLog(msg) {

  const IS_PRODUCTION = true;

  if (IS_PRODUCTION)
    return;

  try {
    var now = new Date();
    console.log('(' + now.getTime() + ') - ' + msg);
  } catch (e) {

  }
}

// returns json
function findProfilesAll(callbackFunc) {
  //chrome.storage.sync.get('profiles', function(data) {   
  chrome.storage.local.get('profiles', function (data) {

    if (data == undefined || data.profiles == undefined || data.profiles.length == undefined || data.profiles.length == 0) {
      writeLog('writing default data because no data found');
      data = {
        "profiles": '[\
          {"twitter": "emironic", "twitterName": "Evgenii Mironic", "notes": "software developer, tech entrepreneur, maker of Private Notes extension for Facebook."}, \
          {"facebook": "evg.mmi", "facebookName": "Evgenii Mironichev", "notes": "software developer, tech entrepreneur, maker of Private Notes extension for Facebook."}\
        ]'
      };
    }

    var allProfiles = JSON.parse(data['profiles']);

    if (allProfiles) {; // writeLog('all profiles loaded);
    } else {
      alert('Private Notes Plugin: Error reading data');
    }

    callbackFunc(allProfiles);

  });
}

function findProfileById(profileId, profileType, profiles) {
  if (profiles) {

    var index = findProfileIndexById(profileId, profileType, profiles);

    if (index > -1)
      return profiles[index];

  } else
    return null;
}

function findProfileIndexById(profileId, profileType, profiles) {
  if (profiles) {
    var index = profiles.findIndex(function (profile) {
      if (profileType == 0)
        return profile.twitter && profile.twitter == profileId;
      else if (profileType == 1)
        return profile.facebook && profile.facebook == profileId;
    });

    return index;
  } else
    return -1;
}

function updateProfileById(profileId, profileType, newName, newNotes) {

  updateNotesStatus('saving notes..');

  var profiles = findProfilesAll(function (allProfiles) {

    var index = findProfileIndexById(profileId, profileType, allProfiles);
    if (index > -1) {

      if (profileType == 0)
      {
        // update facebook name
          if (newName && newName != "")
            allProfiles[index].twitterName = newName;
      }
        else if (profileType == 1)
      {
      // update facebook name
        if (newName && newName != "")
          allProfiles[index].facebookName = newName;
      }

      // update 
      allProfiles[index].notes = newNotes;
      allProfiles[index].updatedAt = new Date();
    } else {
      if (newName && newName != "")
        newName = profileId;
      // update notes
      var newP = null;
      if (profileType == 0) // twitter
      {
       newP = {
        'twitter': profileId,
        'twitterName': newName,
        'notes': newNotes,
        'updatedAt': new Date()
        };
      } 
      else if (profileType == 1) // facebook
      {
        newP = {
          'facebook': profileId,
          'facebookName': newName,
          'notes': newNotes,
          'updatedAt': new Date()
          };  
      }
      allProfiles[allProfiles.length] = newP;
    }

    /*
    chrome.storage.sync.set( { ['profiles']: JSON.stringify(allProfiles) }, function() {
      return true;
    });
    */

    chrome.storage.local.set({
      ['profiles']: JSON.stringify(allProfiles)
    }, function () {

      updateNotesStatus('notes saved ok');
      writeLog(JSON.stringify(allProfiles));
      return true;


    });

  });

  return;
}


function findProfile(profileId, profileType, callbackFunc) {

  findProfilesAll(function (allProfiles) {

    var profile_info = null;
    profile_info = findProfileById(profileId, profileType, allProfiles);

    //writeLog('PRIVATE PROFILE LOADED:  ' + profileId + ' loaded: ' + JSON.stringify(profile_info));              

    callbackFunc(profile_info);
  });
}

// add note with information about profiles
function addNotesToLinks() {
  return; // because not working good

  writeLog('START adding notes for profiles');

  findProfilesAll(function (allProfiles) {

    var currentProfile = getCurrentProfileId();

    allProfiles.forEach(function (profile) {

      // skip current profile
      if (currentProfile == profile.facebook)
        return;

      writeLog('Searching links for ' + profile.facebook);

      var allLinks = document.querySelectorAll("[href*='" + profile.facebook + "']");

      allLinks.forEach(function (elem) {

        writeLog('Adding Link for ' + profile.facebook);

        if (elem.attributes &&
          (
            (elem.attributes.class && elem.attributes.class.value == 'profileLink') ||
            (elem.attributes['data-hovercard'] != undefined)
          )
        ) {
          var prevElem = elem.previousElementSibling;
          if (prevElem == null || prevElem.getAttribute('class') != 'private_note_profile_icon') {
            var tooltip = document.createElement('span');
            tooltip.setAttribute('tooltip', profile.notes);
            tooltip.setAttribute('class', 'private_note_profile_icon');
            tooltip.innerHTML = "&#128221;";
            elem.parentNode.insertBefore(tooltip, elem);
          }
          //elem.innerHTML = "<span tooltip='" + info['notes'] + "'>&#128221;</span>";
        }
      });
    });

  });

  writeLog('END adding notes for profiles');
}

function cleanString(input) {
  input = input.trim();
  // we are not removing line breaks, let it stay inside note
  //input = input.replace("\n", ' ').replace("\r", ' ').replace("\t", ' '); 
  return input;
}

function updateNotes() {
  var notes_value = document.getElementById("notes_profile_value");
  if (notes_value) {
    val = notes_value.value;
    var profileId = getCurrentProfileId();
    var profileType = getProfileType();

    if (profileType == -1){
      return -1;
    }
    // clean
    val = cleanString(val);

    var allLinks = document.querySelectorAll("[href*='" + profileId + "']");

    var name = null;

    if (profileType == 0) // twitter
    {
      for (var elem of allLinks) {
        if (elem.attributes &&
          (
            ( elem.attributes.class && elem.attributes.class.value.indexOf('ProfileHeaderCard-nameLink') > -1 )
          )
        ) {
          name = cleanString(elem.innerText);
          break;
        }
      }

    }
    else if (profileType == 1) // facebook
    {
      for (var elem of allLinks) {
        if (elem.attributes &&
          (
            ( elem.attributes.class && elem.attributes.class.value.indexOf('profileLink') > -1) ||
            (elem.attributes.class && elem.attributes.class.value.indexOf('_2nlw _2nlv') > -1)
          )
        ) {
          name = cleanString(elem.innerText);
          break;
        }
      }
    }
    else {
      return;
    }

    // update notes for this profile

    updateProfileById(profileId, profileType, name, val);
  } else
    writeLog('PRIVATE PROFILE: Can not find notes on the page! SAVE your UPDATED NOTES! Then reload the page and try again');

}

// returns 1 = twitter, 0 = facebook
function getProfileType()
{
  var profile_matches = (/https:\/\/(www.)?twitter\.com/ig).exec(window.location.href); 
  if (profile_matches && profile_matches.length > 1) return 0;
  
  profile_matches = (/https:\/\/(www.)?facebook\.com/ig).exec(window.location.href); 
  if (profile_matches && profile_matches.length > 1) return 1;

  writeLog('Private Notes: can not extract info about profile on Facebook or Twitter');
  return -1;
}

function getCurrentProfileId() {
  var url = window.location.href;
  var profileId = null;

  // TWITTER
  // if not found then try to extract profile nickname
  // https://www.twitter.com/some.nicknameuser98002?sdkjkjid=23e  
  var profile_matches = (/twitter\.com\/([0-9a-zA-Z\.]+)[$\?]*/ig).exec(window.location.href); // getting username out of link
  if (profile_matches && profile_matches.length > 1) {
    profileId = profile_matches[1];
  }
  else {
    // try to extract profile id first , for example 
    // https://www.facebook.com/profile.php?id=123456890123&hc_ref=AABCDFEF
    var profile_matches = (/facebook\.com\/profile.php\?id=([0-9]+)[\&$\?]*/ig).exec(url);
    if (profile_matches && profile_matches.length > 1) {
      profileId = profile_matches[1];
    } else {
      // if not found then try to extract profile nickname
      // https://www.facebook.com/some.nicknameuser98002?sdkjkjid=23e  
      profile_matches = (/facebook\.com\/([0-9a-zA-Z\.]+)[$\?]*/ig).exec(window.location.href); // getting username out of link
      if (profile_matches && profile_matches.length > 1) {
        profileId = profile_matches[1];
      }
    }
  }

  return profileId;
}

function updateNotesStatus(newStatus) {
  var notes_status = document.getElementById('notes_status');
  if (notes_status == undefined) {
    writeLog('Error: notes status element was not found');
  }
  notes_status.innerText = newStatus;
}

// MAIN CODE STARTS HERE

function initExtension() {

  if (document.getElementById('notes_profile_value') != undefined) {
    writeLog('Profile notes control is already added');
    return;
  }

  var info_section = null;
  var notes_block = null;

  var profileType = getProfileType();

  if (profileType == -1)
    return;

  if (profileType == 0) // twitter
  {
    info_section = document.getElementsByClassName('ProfileHeaderCard-bio');
    // insert block into twitter profile
    if (info_section && info_section.length > 0) {

      var notes_block = document.createElement('div');
      notes_block.setAttribute('id', 'notes_block');
      //notes_block.setAttribute('class', 'profile_notes_area');  

      info_section[0].parentNode.insertBefore(notes_block, info_section[0]);
    }
    else {
      writeLog('twitter profile block not detected');
      return; // not found
    }


  }
  else if (profileType == 1) // facebook
  {

    info_section = document.getElementsByClassName('_1vc-');

    // insert block into facebook profile
    if (info_section && info_section.length > 0 && info_section[0].childNodes && info_section[0].childNodes.length > 0) {

      notes_block = document.createElement('div');
      notes_block.setAttribute('id', 'notes_block');
      //notes_block.setAttribute('class', 'profile_notes_area');  

      info_section[0].insertBefore(notes_block, info_section[0].childNodes[0]);
    }
    else {
      writeLog('facebook profile block not detected');      
      return; // not found
    }
  }
  else {
    writeLog
  }

  var notes_value = document.createElement('textarea');
  notes_value.setAttribute('id', 'notes_profile_value');
  notes_value.setAttribute('class', 'notes_area_profile');
  notes_value.setAttribute('placeholder', 'enter some private notes about this person');
  notes_block.appendChild(notes_value);

  var br = document.createElement("br");
  notes_block.appendChild(br);

  // button - commented out as now saves automatically on any change
  /*
  var update_notes = document.createElement('span');
  update_notes.setAttribute('id','notes_update_btn');
  update_notes.setAttribute('class', 'notes_update_btn');
  update_notes.innerText = 'Update';
  notes_block.appendChild(update_notes);
  */

  var notes_status = document.createElement('span');
  notes_status.setAttribute('id', 'notes_status');
  notes_status.setAttribute('class', 'notes_status');
  notes_status.innerText = '';
  notes_block.appendChild(notes_status);


  findProfile(getCurrentProfileId(), profileType, function (profile_info) {

    if (profile_info) {
      //writeLog('loaded profile_info:' + JSON.stringify(profile_info));
      var notes_val = profile_info.notes;
      if (notes_val) {
        notes_value.innerText = notes_val;
        writeLog('notes is set to ' + notes_val);
      }
    }

    //document.getElementById('notes_update_btn').onclick = updateNotes;

    // save on key press or change inside notes
    document.getElementById('notes_profile_value').oninput = updateNotes;
    document.getElementById('notes_profile_value').onpropertychange = updateNotes; // for IE        
  });



}

// INITALIZATION

const DELAY_TIME = 1000;

// listening for updates from background
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {

  writeLog("RECEIVED msg:" + msg);
  if (msg === 'load-completed') {
    setTimeout(function () {
      initExtension();
    }, DELAY_TIME);
  }
});


// listening for updates from background - Adding notes to profile links
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {

  writeLog("RECEIVED msg (second listener for ADDING LINKS):" + msg);
  if (msg === 'load-completed') {
    setTimeout(function () {
      addNotesToLinks();
    }, DELAY_TIME);
  }
});


// execute on document idle (first time)
setTimeout(function () {
  initExtension();
}, DELAY_TIME);

// add notes to profile links (on first time)
setTimeout(function () {
  addNotesToLinks();
}, DELAY_TIME);