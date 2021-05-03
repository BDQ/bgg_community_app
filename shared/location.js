import * as Location from 'expo-location';



export const findCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        location => {

            console.log("location: ", location)


            return Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            }).then(loc => {
                console.log("reversed location", loc)
                console.log("returning location")
                global.location = loc[0]

            })



        },
        error => console.log(error.message),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
};