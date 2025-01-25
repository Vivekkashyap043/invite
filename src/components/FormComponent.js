import React, { useState, useEffect } from "react";
import { set, useForm } from "react-hook-form";
import PhoneInput from "react-phone-input-2";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { useLocation, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-phone-input-2/lib/style.css";
import "./FormComponent.css";

export default function VisitorForm() {

  const [loading, setLoading] = useState(false); // Loading state
  const [selectedMemberType, setSelectedMemberType] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);
  const [formattedValue, setFormattedValue] = useState(null);
  const [phoneErr, setPhoneErr] = useState(null);
  const [phoneValidErr, setPhoneValidErr] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [submitFlag, setSubmitFlag] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [clickCount, setClickCount] = useState(0);
  const [vehicleErrorMessages, setVehicleErrorMessages] = useState({});
  const vehicleNumberPattern = /^[a-z]{2}[0-9]{2}[a-z]{1,2}[0-9]{4}$/;

  const [menCount, setMenCount] = useState(0);
  const [womenCount, setWomenCount] = useState(0);
  const [boysCount, setBoysCount] = useState(0);
  const [girlsCount, setGirlsCount] = useState(0);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const L1_lookup = queryParams.get("L1_lookup");
  const LinkIDLookup = queryParams.get("LinkIDLookup");
  const Home_Office = queryParams.get("Home_Office");
  const navigate = useNavigate();


  const today = new Date(); // Current date
  const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()); // One year from today



  const checkValidLink = async () => {
    console.log(LinkIDLookup, Home_Office, L1_lookup);
    setLoading(true);
    const url = `https://oyster-app-7jt2c.ondigitalocean.app/check-valid-link-id?linkId=${LinkIDLookup}`;
    console.log("url: ", url);
    const response = await fetch(url);
    console.log(response)
    if (!response.ok) {
      console.error("Error fetching data");
      navigate("/error");
    }

    const data = await response.json();

    if (data.isValid) {
      console.log("Valid Link ID");
    } else {
      navigate("/error");
    }

    setLoading(false);
  }

  useEffect(() => {
    if (LinkIDLookup) {
      checkValidLink();
    }else{
      navigate("/error");
    }
  }, []);


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();


  const handleAddVehicle = () => {
    if (clickCount < 5) {
      setClickCount(clickCount + 1);
      console.log(clickCount)
    }
    setVehicles([
      ...vehicles,
      { Vehicle_Type: "", Vehicle_Number: "", ID: Date.now() },
    ]);
  };

  const handleRemoveVehicle = (index) => {
    const updatedVehicles = vehicles.filter((_, i) => i !== index);
    setVehicles(updatedVehicles);
    setClickCount(clickCount - 1);
  };

  const handleTextChange = (index, field, value) => {
    const updatedVehicles = vehicles.map((vehicle, i) =>
      i === index ? { ...vehicle, [field]: value } : vehicle
    );

    setVehicles(updatedVehicles);

    // Validate the specific field and remove error if it's valid
    const vehicle = updatedVehicles[index];
    const updatedErrors = { ...vehicleErrorMessages };

    if (field === "Vehicle_Number") {
      if (vehicleNumberPattern.test(value.replace(/\s+/g, '').toLowerCase())) {
        if (updatedErrors[vehicle.ID]) {
          delete updatedErrors[vehicle.ID].vecnum;
          if (Object.keys(updatedErrors[vehicle.ID]).length === 0) {
            delete updatedErrors[vehicle.ID];
          }
        }
      } else {
        updatedErrors[vehicle.ID] = {
          ...updatedErrors[vehicle.ID],
          vecnum: "Invalid Vehicle Number",
        };
      }
    }

    if (field === "Vehicle_Type") {
      if (value !== "") {
        if (updatedErrors[vehicle.ID]) {
          delete updatedErrors[vehicle.ID].vectype;
          if (Object.keys(updatedErrors[vehicle.ID]).length === 0) {
            delete updatedErrors[vehicle.ID];
          }
        }
      } else {
        updatedErrors[vehicle.ID] = {
          ...updatedErrors[vehicle.ID],
          vectype: "Please select Vehicle Type",
        };
      }
    }

    setVehicleErrorMessages(updatedErrors);
  };



  const vehicleValidate = () => {

    let valid = true;
    const errors = {};

    vehicles.forEach((vehicle, index) => {
      const vehicleNumber = vehicle.Vehicle_Number;
      console.log("vehicle number: ", vehicle)
      if (
        !vehicleNumberPattern.test(vehicleNumber.replace(/\s+/g, '').toLowerCase())
      ) {
        errors[vehicle.ID] = { vecnum: `Invalid Vehicle Number` }
        valid = false;
      }
      if (vehicle.Vehicle_Type === '') {
        errors[vehicle.ID] = { ...errors[vehicle.ID], vectype: `Please select Vehicle Type` };
        valid = false;
      }
    });
    console.log("object: ", errors)
    setVehicleErrorMessages(errors);

    console.log("*****************: ", vehicles)
    console.log("vehicleValidate", vehicleErrorMessages);
    return valid;
  };




  // Handle phone input change
  const handlePhoneChange = (value) => {
    if (!value) {
      setFormattedValue(""); // Set a default empty value
      return;
    }
    setFormattedValue('+' + value);
    validatePhoneNumber(value); // Validate as the user types
  };

  // Validate phone number
  const validatePhoneNumber = (value) => {
    if (!value) {
      setPhoneErr("Phone number is required");
      setPhoneValidErr(null);
      return false;
    } else {
      setPhoneErr(null);
      const parsedPhoneNumber = parsePhoneNumberFromString(value, "IN"); // Assume India as default country
      if (!parsedPhoneNumber || !parsedPhoneNumber.isValid()) {
        setPhoneValidErr("Invalid phone number");
        return false;
      } else {
        setPhoneValidErr(null);
        return true;
      }
    }
  };

  useEffect(() => {
    if (submitFlag) {
      validatePhoneNumber(formattedValue);
    }
  }, [submitFlag, formattedValue]);


  const onSubmit = async (data) => {
    if (!vehicleValidate() || !validatePhoneNumber(formattedValue) || !selectedGender || !selectedMemberType) {
      return;
    }
  
    setLoading(true);
    try {
      // Add counts to the submitted data
      const groupData = {
        menCount,
        womenCount,
        boysCount,
        girlsCount,
      };
  
      if (selectedGender === "Male" && selectedMemberType === "Single") {
        groupData.menCount = 1;
      }
  
      if (selectedGender === "Female" && selectedMemberType === "Single") {
        groupData.womenCount = 1;
      }
  
      const finalData = {
        ...data,
        phone: formattedValue,
        ...groupData,
        selectedGender,
        selectedMemberType,
        dateOfVisit: selectedDate,
        L1_lookup,
        LinkIDLookup,
        Home_Office,
        vehicles,
      };
  
      // Format date as DD-MMM-YYYY
      const date = new Date(finalData.dateOfVisit);
      const day = String(date.getDate()).padStart(2, "0");
      const month = date.toLocaleString("en-US", { month: "short" });
      const year = date.getFullYear();
      finalData.dateOfVisit = `${day}-${month}-${year}`;
  
      // Create FormData
      const formData = new FormData();
      formData.append("data", JSON.stringify(finalData));
  
      // Append photo file
      if (data.photo[0]) {
        formData.append("file", data.photo[0]); // Assume single file upload
      }
  
      console.log("FormData:", Array.from(formData.entries()));
  
      const url = "https://oyster-app-7jt2c.ondigitalocean.app/post-visitor-data";
      const response = await fetch(url, {
        method: "POST",
        body: formData, // FormData handles content type automatically
      });
  
      const responseData = await response.json();

      console.log("Response Data: ", responseData);
  
      if (!response.ok) {
        console.error("Error during submission");
        setLoading(false);
        return;
      }

      if(response.status === 200) {
      window.location.assign("https://srisathyasailokasevagurukulam.org/submission-message-ashram-management/");
      }
      
    } catch (error) {
      console.error("Error during submission:", error);
      setLoading(false);
    }
  };
  



  return (
    <div className="form-container">
      {loading ? (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      ) :
      <form onSubmit={handleSubmit(onSubmit)} className="visitor-form">
        {/* Member Type */}
        <label className="form-label">Members</label>
        <div className="button-group">
          <button
            type="button"
            className={`button ${selectedMemberType === "Single" ? "button-selected" : ""}`}
            onClick={() => setSelectedMemberType("Single")}
          >
            Single
          </button>
          <button
            type="button"
            className={`button ${selectedMemberType === "Group" ? "button-selected" : ""}`}
            onClick={() => setSelectedMemberType("Group")}
          >
            Group
          </button>
        </div>
        {submitFlag && selectedMemberType === null && <p className="error-text">Please select a member type</p>}

        {selectedMemberType === "Group" && (
          <>
            <label className="form-label">No. of Men</label>
            <input
              type="number"
              className="form-input"
              value={menCount}
              onChange={(e) => setMenCount(Number(e.target.value))}
              min="0"
            />

            <label className="form-label">No. of Women</label>
            <input
              type="number"
              value={womenCount}
              onChange={(e) => setWomenCount(Number(e.target.value))}
              className="form-input"
              min="0"
            />

            <label className="form-label">No. of Boys</label>
            <input
              type="number"
              value={boysCount}
              onChange={(e) => setBoysCount(Number(e.target.value))}
              className="form-input"
              min="0"
            />

            <label className="form-label">No. of Girls</label>
            <input
              type="number"
              value={girlsCount}
              onChange={(e) => setGirlsCount(Number(e.target.value))}
              className="form-input"
              min="0"
            />
          </>
        )}

        {/* Prefix */}
        <label className="form-label">Prefix</label>
        <select {...register("prefix", { required: true })} className="form-input">
          <option value="">Select</option>
          <option value="Mr">Mr</option>
          <option value="Ms">Ms</option>
          <option value="Dr">Dr</option>
        </select>
        {errors.prefix && <p className="error-text">Prefix is required</p>}

        {/* First Name */}
        <label className="form-label">First Name</label>
        <input
          type="text"
          placeholder="First Name"
          {...register("firstName", { required: "First Name is required" })}
          className="form-input"
        />
        {errors.firstName && <p className="error-text">{errors.firstName.message}</p>}

        {/* Last Name */}
        <label className="form-label">Last Name</label>
        <input
          type="text"
          placeholder="Last Name"
          {...register("lastName", { required: "Last Name is required" })}
          className="form-input"
        />
        {errors.lastName && <p className="error-text">{errors.lastName.message}</p>}

        {/* Phone */}
        <label className="form-label">Phone</label>
        <PhoneInput
          country={"in"}
          disableCountryCode={false}
          onChange={handlePhoneChange}
          inputStyle={{
            width: "100%",
            height: "40px",
            fontSize: "16px",
          }}
          containerStyle={{
            width: "100%",
          }}
          countryCodeEditable={false}
        />
        {phoneErr && <p className="error-text">{phoneErr}</p>}
        {phoneValidErr && <p className="error-text">{phoneValidErr}</p>}


        {/* Gender */}
        <label className="form-label">Gender</label>
        <div className="button-group">
          <button
            type="button"
            className={`button ${selectedGender === "Male" ? "button-selected" : ""}`}
            onClick={() => setSelectedGender("Male")}
          >
            Male
          </button>
          <button
            type="button"
            className={`button ${selectedGender === "Female" ? "button-selected" : ""}`}
            onClick={() => setSelectedGender("Female")}
          >
            Female
          </button>
        </div>
        {submitFlag && selectedGender === null && <p className="error-text">Please select a gender</p>}

        {/* Photo Upload */}
        <label className="form-label">Photo</label>
        <input type="file"
          accept="image/*"
          className="form-input"
          {...register("photo")} />


        {/* Date of Visit */}
        <label className="form-label">Date of Visit</label>
        {/* <input
          type="date"
          value="2022-01-22"
          {...register("dateOfVisit", { required: "Date of visit is required" })}
          className="form-input"
          min={new Date().toISOString().split("T")[0]} // Disable past dates
        /> */}
        <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        dateFormat="dd/MM/yyyy"
        className="form-input"
        minDate={today}
        maxDate={maxDate}
        placeholderText="dd/mm/yyyy"
      />
       {submitFlag && selectedDate === null && (
        <p className="error-text">Please select a date of visit</p>
      )}


        {/* Vehicle Information */}
        <label className="form-label">Vehicle Information</label>
        {/* <div style={{ display: "flex", fontWeight: "bold", marginBottom: "10px" }}>
          <span style={{ flex: 1 }}>Vehicle Type</span>
          <span style={{ flex: 1 }}>Vehicle Number</span>
        </div> */}
        {vehicles.map((vehicle, index) => (
          <>
            <>
              {/* Vehicle Type Dropdown */}
              <label className="form-label">Vehicle Type</label>
              <select
                className="form-input"
                value={vehicle.Vehicle_Type}
                onChange={(e) =>
                  handleTextChange(index, "Vehicle_Type", e.target.value)
                }
              // style={{ flex: 1, marginRight: "10px" }}
              >
                <option value="">Select</option>
                <option value="2-Wheeler">2-Wheeler</option>
                <option value="Car">Car</option>
                <option value="Bus">Bus</option>
                <option value="Taxi">Taxi</option>
                <option value="School Bus">School Bus</option>
                <option value="Police Van">Police Van</option>
                <option value="Van">Van</option>
                <option value="Auto">Auto</option>
                <option value="Ambulance">Ambulance</option>
                <option value="Truck">Truck</option>
                <option value="Tractor">Tractor</option>
                <option value="Cement Mixer">Cement Mixer</option>
                <option value="Fire Engine">Fire Engine</option>
                <option value="Transport Van">Transport Van</option>
                <option value="Bulldozer">Bulldozer</option>
                <option value="Roller Machine">Roller Machine</option>
              </select>
              {
                vehicleErrorMessages[vehicle.ID]?.vectype && <p className="error-text">{vehicleErrorMessages[vehicle.ID]?.vectype}</p>
              }


              {/* Vehicle Number Input */}
              <label className="form-label">Vehicle Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="KA 01 CU 1234"
                value={vehicle.Vehicle_Number}
                onChange={(e) =>
                  handleTextChange(index, "Vehicle_Number", e.target.value)
                }
              />
              {
                vehicleErrorMessages[vehicle.ID]?.vecnum && <p className="error-text">{vehicleErrorMessages[vehicle.ID]?.vecnum}</p>
              }

              {/* Remove Button */}
              <button
                onClick={() => handleRemoveVehicle(index)}
                className="remove-button"
              >
                Remove
              </button>
              <hr style={{ border: "2.5px solid black", margin: "35px 0" }} />
              
            </>
          </>
        ))}

        {/* Add Vehicle Button */}
        {
          clickCount < 5 && (
            <a
              onClick={handleAddVehicle}
              className="add-vehicle-button"
            >
              Add New Vehicle
            </a>
          )
        }

        {/* Submit */}
        <button type="submit" className="submit-button" onClick={() => {
          setSubmitFlag(true);
          vehicleValidate();
        }}>
          Submit
        </button>
      </form>
      }
    </div>
  );
}
