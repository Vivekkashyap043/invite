import React from "react";

const ErrorComponent = () => {
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      textAlign: "center",
      fontFamily: "Arial, sans-serif",
    },
    heading: {
      color: "red",
      fontSize: "2.5rem",
      margin: "0.5rem",
    },
    subtitle: {
      color: "#555",
      fontSize: "1.2rem",
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Invalid URL!</h1>
      <p style={styles.subtitle}>Sorry, this URL is not valid anymore.</p>
    </div>
  );
};

export default ErrorComponent;
