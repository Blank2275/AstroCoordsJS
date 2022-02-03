const asin = (a) => {return Math.asin(a)};
const acos = (a) => {return Math.acos(a)};
const sin = (a) => {return Math.sin(a * Math.PI / 180)};
const cos = (a) => {return Math.cos(a * Math.PI / 180)};
const sec = (a) => {return 1 / Math.cos(a * Math.PI / 180)}


//app.get("/get-altaz-from-radec-deg/:ra/:dec/:lat/:lon/:time", (req, res) => {

//app.get("/get-altaz-from-radec-dms/:ra/:dec/:lat/:lon/:time", (req, res) => {
function radecToaltazDms(ra, dec, lat, lon, time){
    var answer = radecToaltaz(ra, dec, lat, lon, time);
    answer['alt'] = degreesToDms(answer['alt']);
    answer['az'] = degreesToDms(answer['az']);
    return answer;
};

function altazToradecDms(alt, az, lat, lon, time){
    var answer = altazToradec(alt, az, lat, lon, time);
    answer['ra'] = degreesToDms(answer['ra']);
    answer['dec'] = degreesToDms(answer['dec']);
    return answer;
};

function altazToradecHms(alt, az, lat, lon, time){
    var answer = altazToradec(alt, az, lat, lon, time);
    answer['ra'] = degreesToHms(answer['ra']);
    answer['dec'] = degreesToDms(answer['dec']);
    return answer;
};

console.log(altazToradecHms(-34.6825, 63.7814, 40.5853, -105.0844, new Date('February 1, 2022 12:00:00').getTime()))
function getLST(time, lon){
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
    return lst;
}

function radecToaltaz(ra, dec, lat, lon, time){
    const lst = getLST(time, lon);
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
function altazToradec(alt, az, lat, lon, time){
    /*
    right ascension (α)
    declination (δ)
    altitude (a)
    azimuth (A)
    siderial time (ST)
    latitude (φ) (Φ)
    */
    var lst = getLST(time, lon);
    var dec = asin(sin(lat)*sin(alt) + cos(lat)*cos(alt)*cos(az)) * (180 / Math.PI);
    var ha = asin(sin(az)*cos(alt) / cos(dec)) * (180 / Math.PI);//acos((sin(alt) - sin(lat)*sin(dec)) * (sec(lat) * sec(dec))) * (180 / Math.PI);//acos((sin(alt) - sin(lat)*sin(dec)) / (cos(lat)*cos(dec))) * (180 / Math.PI);
    var ra = lst - ha;
    console.log(ha)
    return {
        "ra": ra,
        "dec": dec
    }
}

function degreesToDms(val) {
    if(val > 0){
        var deg = Math.floor(val);
        var leftover = val - deg;
        var minutes = Math.floor(leftover * 60);
        leftover = leftover - (minutes / 60);
        var seconds = Math.floor(leftover * 3600 * 100) / 100;
        return [deg, minutes, seconds]
    } else{
        var deg = Math.ceil(val);
        var leftover = Math.abs(val - deg);
        var minutes = Math.floor(leftover * 60);
        leftover = Math.abs(leftover - (minutes / 60));
        var seconds = Math.floor(leftover * 3600 * 100) / 100;
        return [deg, minutes, seconds]
    }
}

function degreesToHms(val) {
    var hours = Math.floor(val / 15);
    var minutes = Math.floor(((val/15)-hours)*60);
    var seconds = Math.floor(((((val/15)-hours)*60)-minutes)*60 * 100) / 100;
    return [hours, minutes, seconds]
}