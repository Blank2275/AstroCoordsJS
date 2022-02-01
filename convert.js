var app = require('express')();
var http = require('http').createServer(app);

const asin = (a) => {return Math.asin(a)};
const acos = (a) => {return Math.acos(a)};
const sin = (a) => {return Math.sin(a * Math.PI / 180)};
const cos = (a) => {return Math.cos(a * Math.PI / 180)};

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/example.html');
});

app.get("/get-altaz-from-radec-deg/:ra/:dec/:lat/:lon/:time", (req, res) => {
    var ra = parseFloat(req.params.ra);
    var dec = parseFloat(req.params.dec);
    var lat = parseFloat(req.params.lat);
    var lon = parseFloat(req.params.lon);
    var time = parseFloat(req.params.time);
    var answer = convert(ra, dec, lat, lon, time);
    res.send(answer);
});

app.get("/get-altaz-from-radec-dms/:ra/:dec/:lat/:lon/:time", (req, res) => {
    var ra = parseFloat(req.params.ra);
    var dec = parseFloat(req.params.dec);
    var lat = parseFloat(req.params.lat);
    var lon = parseFloat(req.params.lon);
    var time = parseFloat(req.params.time);
    var answer = convert(ra, dec, lat, lon, time);
    answer['alt'] = degreesToDms(answer['alt']);
    answer['az'] = degreesToDms(answer['az']);
    res.send(answer);
});

console.log(convert(84.0917,-5.3789,40.5853,-105.0844,new Date().getTime()));//'January 1, 2021 01:00:00'
function convert(ra, dec, lat, lon, time){
    time = new Date(time)
    const J2000Date = new Date('January 1, 2000 12:00:00').getTime();
    const diff = time.getTime() - J2000Date;
    const d = diff / (1000 * 60 * 60 * 24);
    var hours = time.getUTCHours();
    var minutes = time.getUTCMinutes();
    var seconds = time.getUTCSeconds();
    var ms = time.getUTCSeconds();
    var utc = (hours * (1000 * 60 * 60) + minutes * (1000 * 60) + seconds * 1000 + ms) / (1000 * 60 * 60 * 24) * 360;//(now.getTime() - beginning.getTime()) / (1000 * 60 * 60 * 24) * 360;
    var lst = 100.46 + (0.985647 * d) + lon + utc;
    if(lst > 360){
        while(lst > 360){
            lst -= 360;
        }
    } else if(lst < 0){
        while(lst < 0){
            lst += 360;
        }
    }
    //console.log(lst)
    var ha = lst - ra
    if (ha < 0) {ha += 360}
    var alt = asin(sin(dec)*sin(lat)+cos(dec)*cos(lat)*cos(ha)) * (180 / Math.PI);
    var a = acos((sin(dec) - sin(alt) * sin(lat)) / (cos(alt) * cos(lat))) * (180 / Math.PI)
    var az = 0;
    if(sin(ha) < 0){
        az = a;
    } else {
        az = 360 - a;
    }
    return { 
        "alt": alt,
        "az": az
    }
}

function degreesToDms(val) {
    var deg = Math.floor(val);
    var leftover = val - deg;
    var minutes = Math.floor(leftover * 60);
    leftover = leftover - (minutes / 60);
    var seconds = Math.floor(leftover * 3600);
    return [deg, minutes, seconds]
}

http.listen(8080, () => {
    console.log('listening on port 8080');
});