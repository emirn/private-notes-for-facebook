

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

function dateToString(input)
{
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Dec'];

    return input.getFullYear() + "-" 
    + monthNames[(input.getMonth())]  + "-" 
    + input.getDate() + " "
    + input.getHours() + "-"  
    + input.getMinutes() + "-" 
    + input.getSeconds();

}
  

var encodeHtmlEntity = function(str) {
    var buf = [];
    for (var i=str.length-1;i>=0;i--) {
      buf.unshift(['&#', str[i].charCodeAt(), ';'].join(''));
    }
    return buf.join('');
  };

document.addEventListener('DOMContentLoaded', function() {

 generateContent();

 var btn = document.getElementById('btnRefresh'); 
 btn.onclick = function(){ 
     generateContent();
 };
/*
 var btn = document.getElementById('btnPrint');
 btnPrint.onclick = function(){
    window.print();
 }
*/  
});

function removeProfile(id)
{
    if (confirm("Are you sure ? ")) {
        writeLog( "You pressed OK!    " + id)
    } else {
        writeLog( "You pressed Cancel!   " + id);
    }

}

function generateContent()
{
    writeLog('generating content for popup');

    chrome.storage.local.get('profiles', function(data) {

        if (data == undefined || data.profiles == undefined || data.profiles.length == undefined || data.profiles.length == 0 )
        {
            writeLog('no data yet, generating default data');
            data = {"profiles": '[{"facebook": "evg.mmi", "facebookName": "Evgenii Mironichev", "notes": "software developer, tech entrepreneur, maker of Private Notes extension for Facebook."}]'};
        }   

        var allProfiles = JSON.parse(data['profiles']);

        writeLog('generating CSV export..');
        var link = document.getElementById('exportCSV');
        link.text = "please wait...";



        allProfiles.sort(function(a,b){
            var aTime = 0;
            var bTime = 0;
            if (a.updatedAt && a.updatedAt != "") aTime = new Date(a.updatedAt).getTime();
            if (b.updatedAt && b.updatedAt != "") bTime = new Date(b.updatedAt).getTime();
            return aTime - bTime;
        });

        var allProfilesLength = allProfiles.length;
        var outputCSV = '';
        for (var i = allProfilesLength; i--; i >= 0) {
            var profile = allProfiles[i];
            input = profile.notes.trim();
            input = input.replace("\n", ' ').replace("\r", ' ').replace("\t", ' ');          

            var name = profile.facebook;
            if (profile.facebookName != undefined && profile.facebookName != "")
                name = profile.facebookName;

            var updatedAt = '';
            if (profile.updatedAt) updatedAt = dateToString(new Date(profile.updatedAt));

            outputCSV = outputCSV + '"https://facebook.com/' + profile.facebook + '","' + name + '","' + input + '","'+  updatedAt + "\"\r\n";
        };

        var currentDate = dateToString(new Date());
        
        link.textContent = "Export as CSV";
        link.download = "PrivateNotesForFacebook-" + currentDate + ".csv";        
        link.href = "data:text/csv,Facebook,FacebookName,Notes,UpdatedAt\n" + outputCSV;
        link.text = "Export as CSV..";    
    

        // making a table
        var table = document.getElementById('main_table');

        table.innerHTML = '<i>please wait...</i>'
        var tableHTML = "<table width='99%'>\n";

        for (var i = allProfilesLength; i--; i>= 0) {
            var profile = allProfiles[i];

            var name = profile.facebook;

            // if defined and not empty
            if (profile.facebookName != undefined && profile.facebookName != "")
                name = profile.facebookName;

            var updatedAt = '';
            if (profile.updatedAt) updatedAt = dateToString(new Date(profile.updatedAt));
    
            tableHTML = tableHTML + '<tr><td><a title="' + updatedAt + '" target="_blank" href="https://facebook.com/' + profile.facebook + '">' + name + "</a></td><td>" + 
            encodeHtmlEntity(profile.notes) + "</td></tr>\n";
            //encodeHtmlEntity(profile.notes) + "</td><td><span id='profileRemove" + i + "'> X </span></td></tr>\n";

        };

        tableHTML = tableHTML + "\n</table>";
        table.innerHTML = tableHTML;

        // set handlers for removal icons
        /*
        for (var i = allProfilesLength; i--; i>= 0) {
            document.getElementById('profileRemove'+i).onclick = function() { removeProfile(i); };
        }
        */
        //writeLog('table: ' + tableHTML);
        

    });
}
    