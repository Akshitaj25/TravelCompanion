import React, { useState, useEffect } from "react";
import "../explore-page/explore_page.css";
import Close_Icon from "../../icons/svg/close_icon";
import Menu_Icon from "../../icons/svg/menu_icon";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import loading_gif from "../../images/loading.gif";
import PopUp from "../../components/popup/popup";
import { useNavigate } from "react-router-dom";
import App_Bar from "../../components/appbar/appbar";

function Explore_Page() {
  const navigate = useNavigate();
  const [showPopUp, setShowPopUp] = useState(false);
  const images = useSelector((state) => state.images);
  const userId = useSelector((state) => state.userId);
  const destination = useSelector((state) => state.destination);
  const location = useSelector((state) => state.location);
  const duration = useSelector((state) => state.duration);
  const date = useSelector((state) => state.date);
  const adults = useSelector((state) => state.adults);
  const child = useSelector((state) => state.child);
  const trip_data = useSelector((state) => state.trip_data);
  const { id, days } = useParams();
  const initial_trip_data = useSelector((state) => state.initial_trip_data);
  const [customizationInput, setCustomizationInput] = useState("");
  const [loading, setLoading] = useState(false);

  const saveList = async (json, destination, user_id) => {
    try {
      const response = await axios.post("http://localhost:8000/add-list", {
        json,
        destination,
        user_id,
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleSaveList = async() => {
    if(userId){
      await saveList(tripData, tripData.destination, userId);
      setShowPopUp(true);
    }else{
      navigate("/signin")
    }
  };

  const handleInputChange = (event) => {
    setCustomizationInput(event.target.value);
  };

  const [tripData, setTrip_detail] = useState(null);

  const [showMenu, setShowMenu] = useState(false);
  function handle_menubtn() {
    setShowMenu(!showMenu);
  }

  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5001/details");

        if (response.ok) {
          const data = await response.json();
          console.log(data[destination][days]["it"]);
          setTrip_detail(data[destination][days]);
        } else {
          const errorData = await response.json();
          setError(errorData.error);
        }
      } catch (error) {
        setError("An error occurred");
      }
    };

    fetchDetails();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!tripData) {
    return <div>Loading...</div>;
  }

  // Function to fetch itinerary data
  const fetchItinerary = async (string, destination, numDays, summary) => {
    try {
      const response = await axios.get("http://127.0.0.1:5001/gen_it", {
        params: {
          string,
          destination,
          num_days: numDays,
          summary,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error:", error);
      throw new Error("An error occurred while fetching itinerary data");
    }
  };

  const handleButtonClick = async () => {
    setLoading(true);
    console.log(tripData.summary);
    await fetchItinerary(
      customizationInput,
      tripData.destination,
      tripData.num_days,
      tripData.summary
    )
      .then((itineraryData) => {
        setTrip_detail(itineraryData);
        setLoading(false);
        console.log(itineraryData);
      })
      .catch((error) => {
        // Handle errors
        console.error(error);
        setLoading(false);
      });
    // Perform some action when the button is clicked
    console.log("Button clicked!");
  };

  const handlePopup = () => {
    setShowPopUp(false);
  };

  return (
    <div className="main-outer-div">
      {showPopUp && (
        <div className="popup-outer-div">
          <div className="popup-iner-div">
            <div className="closebtn" onClick={handlePopup}>
              <Close_Icon />
            </div>
          </div>
          <div className="popupcontent">
            <div className="popupheading">Hello, User</div>
            <div className="popupsubheading">Your vacation plan has been safely stored in the yourlist.</div>
            <div className="popupsubheading">After calculating all the expenses and other details, our team will contact you.</div>
          </div>
        </div>
      )}
      <div className="ep-main-div">
        <App_Bar />
        <div className="ep-div-1">
          <div
            className="ep-main-image"
            style={{
              backgroundImage: `url(${tripData["header_image"]})`,
            }}
          ></div>
          <div className="ep-div-1-detail">
            <div className="ep-deal-div"></div>
            <div className="ep-place-title">
              Discover {tripData.destination}'s Charm
            </div>
            {/* <div className="ep-place-new-cost">
              Rs. {initial_trip_data[id]["cost"]}
            </div> */}
            {loading ? (
              <img className="loading-gif" src={loading_gif} alt="GIF" />
            ) : (
              <div className="customize-field">
                <input
                  type="text"
                  placeholder="Customise package"
                  value={customizationInput}
                  onChange={handleInputChange}
                />
                <button onClick={handleButtonClick}>Customise</button>
              </div>
            )}
          </div>
        </div>
        {/* <div className="ep-div-2">{dayPlans}</div> */}
        {tripData["it"].map((day, index) => (
          <div className="trip-div-main-box">
            <div className="trip-div-inner-box" key={index}>
              <h2>{day.day}</h2>
              <div className="inner-detil-div">
                <div className="trip-detail-div">
                  {day.activities.map((activity, index) => (
                    <div>
                      <div className="location-name" key={index}>
                        {activity}
                      </div>
                      <div className="location-description" key={index}>
                        {
                        Array.isArray(day.description[activity]) ? (
                          day.description[activity].map((descriptionLine, index) => (
                            <React.Fragment key={index}>
                              {descriptionLine}
                              <br />
                            </React.Fragment>
                          ))
                        ) : (
                          <React.Fragment>
                            {day.description[activity]}
                            <br />
                          </React.Fragment>
                        )
                        }

                      </div>
                    </div>
                  ))}
                </div>
                <div
                  className="place-img"
                  style={{
                    backgroundImage: `url(${day.image})`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
        <div className="include-div">
          <div className="include-inner-div">
            <h2>What's Included</h2>
            <div>
              ✓ Sightseeing as per the itinerary
              <br></br>✓ All Transfers, excursions & sightseeing as per the
              itinerary by ac car
              <br></br>✓ All toll taxes, parking fees, Fuel and driver's
              allowances
              <br></br>✓ Welcome drink on arrival
              <br></br>✓ All Transport & Hotels Related Taxes
            </div>
          </div>
        </div>
        {/* https://www.google.com/travel/flights */}
        <button
          className="confirm-btn"
          onClick={() => {
            handleSaveList();
          }}
        >
          Save Itinerary
        </button>
        {/* <button
          className="confirm-btn"
          onClick={() => {
            window.open("https://www.google.com/travel/flights", "_blank");
          }}
        >
          Search Flights
        </button> */}
      </div>
    </div>
  );
}

export default Explore_Page;
