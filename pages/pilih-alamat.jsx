import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  GoogleMap,
  LoadScript,
  MarkerF,
  InfoBox,
  StandaloneSearchBox,
} from "@react-google-maps/api";

// style untuk google maps
const containerStyle = {
  width: "100%",
  height: "400px",
};

//opsi settingan untuk google maps
const optMap = {
  disableDefaultUI: true,
  streetViewControl: false,
  fullscreenControl: false,
  mapTypeControl: false,
  zoomControl: false,
};

//opsi settingan untuk info text box di google maps
const optInfo = { closeBoxURL: "", enableEventPropagation: true };

//opsi settingan untuk LoadScript di google maps
const libraries = ["drawing", "places"];

export default function PilihAlamat() {
  const [searchBox, setSearchBox] = useState("");
  const searchBoxRef = useRef(null);
  const [currentAddress, setCurrentAddress] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [currentLocation, setCurrentLocation] = useState({});
  const [selectedLocation, setSelectedLocation] = useState({
    lat: 0,
    lng: 0,
  });
  const [textButton, setTextButton] = useState("Lanjut");

  useEffect(() => {
    // cek lokasi saat ini dengan api google maps
    const showCoordinates = (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      setCurrentLocation({
        lat: latitude,
        lng: longitude,
      });
      setSelectedLocation({
        lat: latitude,
        lng: longitude,
      });

      axios
        .get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_KEY_GMAPS}`
        )
        .then((response) => {
          // Extract the address from the API response
          const results = response.data.results;
          if (results.length > 0) {
            const address = results[0].formatted_address;
            setCurrentAddress(address);
            setSelectedAddress(address);
          } else {
            console.log("No results found.");
          }
        })
        .catch((error) => {
          console.log("Error:", error.message);
        });
    };

    // cek device support GPS location or not
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showCoordinates);
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }, []);

  // function untuk mencari longtitude, latitude dan address saat search di input box
  const handlePlacesChanged = () => {
    if (searchBoxRef.current && searchBoxRef.current.getPlaces) {
      const places = searchBoxRef.current.getPlaces();
      // setSearchBox('')

      if (places && places.length > 0) {
        const { geometry, formatted_address } = places[0];
        const { lat, lng } = geometry.location;

        setSelectedLocation({
          lat: parseFloat(lat()),
          lng: parseFloat(lng()),
        });
        setSelectedAddress(formatted_address);
        setSearchBox(formatted_address);
      }
    }
  };

  // function untuk mencari longtitude, latitude dan address saat search dgn geser titik
  const handleMarkerDragEnd = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setSelectedLocation({
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    });

    axios
      .get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_KEY_GMAPS}`
      )
      .then((response) => {
        const results = response.data.results;
        if (results.length > 0) {
          const address = results[0].formatted_address;
          setSelectedAddress(address);
        } else {
          console.log("No results found.");
        }
      })
      .catch((error) => {
        console.log("Error:", error.message);
      });
  };

  // function untuk mengunakan lokasi saat ini di GPS
  const handleUseCurrentAddress = () => {
    setSearchBox("");
    setSelectedAddress(currentAddress);
    setSelectedLocation(currentLocation);
  };

  return (
    <>
      <div className="min-h-screen flex flex-col justify-between">
        <div>
          <LoadScript
            googleMapsApiKey={process.env.NEXT_PUBLIC_KEY_GMAPS}
            libraries={libraries}
          >
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={selectedLocation}
              zoom={15}
              options={optMap}
            >
              {/* Child components, such as markers, info windows, etc. */}
              {/* Titik Google Maps */}
              <MarkerF
                draggable={true}
                position={selectedLocation}
                onDragEnd={handleMarkerDragEnd}
                // icon={{ url: "/images/iconMarker.png" }}
              />

              {/* Info Box Lokasi Titik */}
              <InfoBox position={selectedLocation} options={optInfo}>
                <div className="w-36">
                  <div className="bg-white p-2 rounded-xl bg-opacity-70 border border-primary">
                    {selectedAddress}
                  </div>
                </div>
              </InfoBox>
            </GoogleMap>

            <div className="font-primary  flex flex-col items-center px-5 py-5">
              <div className="flex flex-col px-3 space-y-5 relative">
                {/* Input untuk cari alamat */}
                <StandaloneSearchBox
                  ref={searchBoxRef}
                  onLoad={(ref) => (searchBoxRef.current = ref)}
                  onPlacesChanged={handlePlacesChanged}
                >
                  <>
                    <input
                      type="text"
                      placeholder="Cari Alamat"
                      className="w-full px-10 py-2 rounded-full border-2 border-gray-300 focus:outline-none "
                      value={searchBox}
                      onChange={(e) => setSearchBox(e.target.value)}
                    />
                  </>
                </StandaloneSearchBox>

                {/* Untuk menggunakan lokasi saat ini di GPS */}
                <button
                  className="flex space-x-3"
                  type="button"
                  onClick={handleUseCurrentAddress}
                >
                  <div className="flex flex-col items-start space-y-1">
                    <p className="font-semibold text-sm">
                      Gunakan Alamat Saat ini
                    </p>
                    <p className="text-xs text-[#8C8C8C] text-left">
                      {currentAddress}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </LoadScript>
        </div>

        {/* Untuk mencari outlet KFC terdekat dari lokasi */}
        <div className="p-3">
          <button
            className="bg-[#F15A23] w-full py-3 rounded-3xl text-white"
            // onClick={searchOutlet}
          >
            {textButton}
          </button>
        </div>
      </div>
    </>
  );
}
