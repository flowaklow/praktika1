
let offers = [];
let markers = [];
let userLat, userLon; 


document.addEventListener("DOMContentLoaded", function() {
    const map = L.map('map').setView([56.946, 24.105], 13); 

  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);


    map.on('click', function(e) {
        const lat = e.latlng.lat;
        const lon = e.latlng.lng;
        document.getElementById("latitude").value = lat.toFixed(6);
        document.getElementById("longitude").value = lon.toFixed(6);

     
        const marker = L.marker([lat, lon]).addTo(map);

    
        marker.bindPopup(`
            <div style="text-align: center;">
                <p><strong>Platums:</strong> ${lat.toFixed(6)}</p>
                <p><strong>Garums:</strong> ${lon.toFixed(6)}</p>
                <button style="background: red; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px;" 
                    onclick="removeMarker(${markers.length})">✖ Noņemt</button>
            </div>
        `);


        markers.push(marker);
    });
});


function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        document.getElementById("location-output").innerText =
            "Jūsu pārlūkprogramma neatbalsta atrašanās vietas noteikšanu.";
    }
}


function showPosition(position) {
    userLat = position.coords.latitude;
    userLon = position.coords.longitude;

    console.log(`User Coordinates: ${userLat.toFixed(4)}, ${userLon.toFixed(4)}`); 

    document.getElementById("location-output").innerHTML = `
        <p>Platums: ${userLat.toFixed(4)}</p>
        <p>Garums: ${userLon.toFixed(4)}</p>
    `;


    const nearbyOffers = findNearbyOffers(userLat, userLon);
    displayOffers(nearbyOffers);
}


function showError(error) {
    let message = "";
    switch (error.code) {
        case error.PERMISSION_DENIED:
            message = "Lietotājs atteicās dalīties ar atrašanās vietu.";
            break;
        case error.POSITION_UNAVAILABLE:
            message = "Atrašanās vietas informācija nav pieejama.";
            break;
        case error.TIMEOUT:
            message = "Pieprasījums pēc atrašanās vietas beidzās.";
            break;
        case error.UNKNOWN_ERROR:
            message = "Nezināma kļūda.";
            break;
    }
    document.getElementById("location-output").innerText = message;
}


function submitOffer(event) {
    event.preventDefault();

    const name = document.getElementById("cafe-name").value;
    const menu = document.getElementById("menu").value;
    const price = document.getElementById("price").value;
    const lat = parseFloat(document.getElementById("latitude").value);
    const lon = parseFloat(document.getElementById("longitude").value);

    const newOffer = {
        name,
        menu,
        price,
        lat,
        lon,
    };

    offers.push(newOffer);
    alert("Piedāvājums pievienots!");

   
    const lastMarker = markers[markers.length - 1];
    if (lastMarker) {
        lastMarker.bindPopup(`
            <div style="text-align: center;">
                <h4>${name}</h4>
                <p><strong>Menu:</strong> ${menu}</p>
                <p><strong>Cena:</strong> ${price} EUR</p>
            </div>
        `);
    }

    document.getElementById("admin-form").reset();
}


function findNearbyOffers(userLat, userLon) {
    const maxDistance = 10; 

    const nearbyOffers = offers.filter((offer) => {
        const distance = calculateDistance(userLat, userLon, offer.lat, offer.lon);
        console.log(`Расстояние до ${offer.name}: ${distance.toFixed(2)} км`); 
        return distance <= maxDistance; 
    });

    console.log(`Найдено предложений в радиусе 10 км: ${nearbyOffers.length}`); 
    return nearbyOffers;
}


function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = degToRad(lat2 - lat1);
    const dLon = degToRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; 
}

function degToRad(deg) {
    return deg * (Math.PI / 180);
}


function displayOffers(offers) {
    const offersList = document.getElementById("offers-list");
    offersList.innerHTML = ""; 

    if (offers.length === 0) {
        offersList.innerHTML = "<p>Nav pieejamu piedāvājumu tuvumā.</p>";
        return;
    }

    offers.forEach((offer) => {
        const card = document.createElement("div");
        card.className = "offer-card";
        card.innerHTML = `
            <h3>${offer.name}</h3>
            <p>${offer.menu}</p>
            <p><strong>${offer.price} EUR</strong></p>
        `;
        offersList.appendChild(card);
    });
}


function removeMarker(index) {
    const marker = markers[index];
    marker.remove(); 
    markers.splice(index, 1); 
}
