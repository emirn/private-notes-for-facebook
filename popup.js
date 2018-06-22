

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

    var output =  buf.join('');

    output = output.replace("\r\n", "<br/>").replace("\n", "<br/>").replace("\r", "<br/>");
    return output;
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
            data = {
                "profiles": '[\
                  {"twitter": "emironic", "twitterName": "Evgenii Mironic", "notes": "software developer, tech entrepreneur, maker of Private Notes extension for Facebook."}, \
                  {"facebook": "evg.mmi", "facebookName": "Evgenii Mironichev", "notes": "software developer, tech entrepreneur, maker of Private Notes extension for Facebook."}\
                ]'
            };
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

            // facebook
            var facebook = '';
            if (profile.facebook)
                facebook = 'https://facebook.com/'  + profile.facebook;

            var facebookName = '';
            if (profile.facebookName != undefined && profile.facebookName != "")
                facebookName = profile.facebookName;
            
            // twitter
            var twitter = '';
            if (profile.twitter)
                twitter = 'https://twitter.com/' + profile.twitter;
    
            var twitterName = '';

            if (profile.twitterName != undefined && profile.twitterName != "")
                twitterName = profile.twitterName;
    

            var updatedAt = '';
            if (profile.updatedAt) updatedAt = dateToString(new Date(profile.updatedAt));

            outputCSV = outputCSV + '"' + twitter + '","' +  twitterName + '","' + facebook + '","' + facebookName + '","' + input + '","'+  updatedAt + "\"\r\n";
        };

        var currentDate = dateToString(new Date());
        
        link.textContent = "Export as CSV";
        link.download = "PrivateNotesForTwitterAndFacebook-" + currentDate + ".csv";        
        link.href = "data:text/csv,Twitter,TwitterName,Facebook,FacebookName,Notes,UpdatedAt\n" + outputCSV;
        link.text = "Export as CSV..";    
    

        // making a table
        var table = document.getElementById('main_table');

        table.innerHTML = '<i>please wait...</i>'
        var tableHTML = "<table width='99%'>\n";

        for (var i = allProfilesLength; i--; i>= 0) {
            var profile = allProfiles[i];

            var updatedAt = '';
            if (profile.updatedAt) updatedAt = dateToString(new Date(profile.updatedAt));

            if (profile.facebook){
                tableHTML = tableHTML + '<tr><td>';
                tableHTML = tableHTML + '<a title="' + updatedAt + '" target="_blank" href="https://facebook.com/' + profile.facebook + '"><i class="fa fab fa-facebook"></i> ' + profile.facebookName + "</a>";
            }
            if (profile.twitter){
                tableHTML = tableHTML + '<tr><td>';                
                tableHTML = tableHTML + '<a title="' + updatedAt + '" target="_blank" href="https://twitter.com/' + profile.twitter + '"><i class="fa fab fa-twitter"></i> ' + profile.twitterName + "</a>";
            }
            
            tableHTML = tableHTML + "</td><td>" + encodeHtmlEntity(profile.notes) + "</td></tr>\n";
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
    