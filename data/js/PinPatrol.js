$(document).ready(function(){
    var os = getOS();
    var sEmptyTable;
    if (os === 'macOS') {
        sEmptyTable = `<div id=\"filesclick\" class=\"note\">Click here or drag and drop <b>SiteSecurityServiceState.txt</b> file from your profile or any other file with <b>SiteSecurityServiceState.txt</b> format. OS Detected: ${os}<br> On macOS you may need to open a terminal and run "chflags nohidden ~/Library/" first.</div><div class=\"note\"><b>File location on macOS:</b> ~/Library/Application Support/Firefox/Profiles/&lt;default profile folder&gt;</div>`
    } else if (os === 'Linux') {
        sEmptyTable = `<div id=\"filesclick\" class=\"note\">Click here or drag and drop <b>SiteSecurityServiceState.txt</b> file from your profile or any other file with <b>SiteSecurityServiceState.txt</b> format. OS Detected: ${os}</div><div class=\"note\"><b>Linux:</b> ~/.mozilla/firefox/&lt;default profile folder&gt;</div>`
    } else if (os === 'Windows') {
        sEmptyTable = `<div id=\"filesclick\" class=\"note\">Click here or drag and drop <b>SiteSecurityServiceState.txt</b> file from your profile or any other file with <b>SiteSecurityServiceState.txt</b> format. OS Detected: ${os}</div><div class=\"note\"><b>Windows:</b> %appdata%\\Mozilla\\Firefox\\Profiles\\&lt;default profile folder&gt;</div>`
    } else {
        sEmptyTable = '<div id=\"filesclick\" class=\"note\">Click here or drag and drop <b>SiteSecurityServiceState.txt</b> file from your profile or any other file with <b>SiteSecurityServiceState.txt</b> format. OS could not be detected.<br>On macOS you may need to open a terminal and run "chflags nohidden ~/Library/" first.</div><div class=\"note\"><b>Windows:</b> %appdata%\\Mozilla\\Firefox\\Profiles\\&lt;default profile folder&gt;<br><b>Mac OS X:</b> ~/Library/Application Support/Firefox/Profiles/&lt;default profile folder&gt;<br><b>Linux:</b> ~/.mozilla/firefox/&lt;default profile folder&gt;</div>'
    }
    var table = $('#tableFile').DataTable({
        "initComplete": function( settings, json ) {
            $('div.loading').remove();
        },
        "oLanguage": {"sEmptyTable": sEmptyTable},
        "columnDefs": [{
            "targets": 3,
            "createdCell": function (td, cellData, rowData, row, col) {
                $(td).attr('title', cellData);

            },
            "render": function (data, type, full, meta) {
                var d = new Date("1970-01-01");
                d.setDate(d.getTime() + data);
                return d.toDateString();
            }
        }, {
            "targets": 4,
            "createdCell": function (td, cellData, rowData, row, col) {
                $(td).attr('title', cellData);

            },
            "render": function (data, type, full, meta) {
                var lastrow = data.split(",");
                //date expire
                var d = new Date();
                d.setTime(lastrow[0]);

                return d.toUTCString();
            }

        }, {
            "targets": 5,
            "createdCell": function (td, cellData, rowData, row, col) {
                $(td).attr('title', cellData);
            },
            "render": function (data, type, full, meta) {
                //security property set
                var property = "";
                if(data === 0){
                    property = "SecurityPropertyUnset";
                }
                else if(data === 1){
                    property = "SecurityPropertySet";
                }
                else{
                    property = "SecurityPropertyKnockout";
                }

                return property;
            }
        }]
    });

    var dropTable = document.getElementById("tableFile");
    dropTable.addEventListener('dragover', handleDragOver, false);
    dropTable.addEventListener('drop', handleJSONDrop, false);

    document.getElementById('files').addEventListener('change', handleFileSelect, false);
    $("#filesclick").click(function() {
        if ($("#tableFileBody").hasClass('emptyTable')){
            $( "#files" ).click();
        }
    });
});

function handleFileSelect(evt) {
  var files = evt.target.files; // FileList object

  // Loop through the FileList and read
  for (var i = 0, f; f = files[i]; i++) {
    if (f.name === 'SiteSecurityServiceState.txt' && f.type === 'text/plain') {
    var reader = new FileReader();

    // Closure to capture the file information.
    reader.onload = (function(theFile) {
        return function(e) {
            var text = e.target.result;
            var list = text.split("\n");
            list.pop(); //delete the last

            var table = $('#tableFile').DataTable();
            table.rows().remove().draw(false);
            writeTable(list);
          };
        })(f);

        reader.readAsText(f);

        $("#tableFileBody").removeClass('emptyTable'); // Only read from file first time
    } else {
            alert('This isn´t file SiteSecurityServiceState.txt');
        }
    }
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

 function handleJSONDrop(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var files = evt.dataTransfer.files;
    // Loop through the FileList and read
    for (var i = 0, f; f = files[i]; i++) {
        if (f.name === 'SiteSecurityServiceState.txt' && f.type === 'text/plain') {
        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function(theFile) {
          return function(e) {
            var text = e.target.result;
            var list = text.split("\n");
            list.pop(); //delete the last

            var table = $('#tableFile').DataTable();
            table.rows().remove().draw(false);
            writeTable(list);
          };
        })(f);

        reader.readAsText(f);

        $("#tableFileBody").removeClass('emptyTable'); // Only read from file first time
        } else {
            alert('This isn´t file SiteSecurityServiceState.txt');
        }
    }
}

function writeTable(list){

    for(var i = 0; i<list.length; i++) {
        var columns = list[i].split("\t");
        for (var j = 0; j < columns.length; j++) {
            switch (j) {
                case 0:
                    var firtsrow = columns[j].split(":");
                    var domain = firtsrow[0];
                    var HSTS = firtsrow[1];
                    break;
                case 1:
                    var score = columns[j];
                    break;
                case 2:
                    var dateDate = columns[j];

                    break;
                case 3:
                    var lastrow = columns[j].split(",");
                    //date expire
                    var dateExpire = lastrow[0];
                    var property = lastrow[1];

                    //include subdomains
                    var subDomains = lastrow[2] === '1' ? "includeSubdomains" : " - ";

                    if(typeof lastrow[3] !== 'undefined' && lastrow[3] !== '0' && lastrow[3] !== '2'){
                        var pins = lastrow[3].split("=");
                        var temp = "";
                        for(var k = 0; k < pins.length; k++){
                            if(pins[k] != ""){
                                temp = pins[k] + "=" + "<br/>" + temp
                            }
                        }
                        var fpins = temp;
                    }
                    else{
                        var fpins = " - ";
                    }
                    break;
            }
        }
        var table = $('#tableFile').DataTable();
        table.row.add([domain, HSTS, score, dateDate, dateExpire, property, subDomains, fpins]).draw(false);
    }
    $('#dropfiles').remove();
}

function getOS() {
    var platform = window.navigator.platform,
        macOSPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
        windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
        os = null;

    if (macOSPlatforms.indexOf(platform) !== -1) {
        os = 'macOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
        os = 'Windows';
    } else if (!os && /Linux/.test(platform)) {
        os = 'Linux';
    }
    
    return os;
}
