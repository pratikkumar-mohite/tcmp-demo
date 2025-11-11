import './Location.css';

const Location: React.FC = () => {
  return (
    <section className="location-section" id="location">
      <div className="container">
        <h2 className="section-title">Location</h2>
        <div className="location-content">
          <div className="event-details">
            <h3>Event Details</h3>
            <div className="detail-item">
              <strong>Venue:</strong> AppDirect India
            </div>
            <div className="detail-item">
              <strong>Address:</strong> Pune, Maharashtra, India
            </div>
            <div className="detail-item">
              <strong>Date:</strong> To be announced
            </div>
            <div className="detail-item">
              <strong>Time:</strong> To be announced
            </div>
          </div>
          <div className="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3930.310034205593!2d73.92600257972352!3d18.515585566381823!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c18cf4eaad8d%3A0xc5835f1d9e3a91d3!2sAppDirect%20India!5e0!3m2!1sen!2sin!4v1762854087901!5m2!1sen!2sin"
              width="600"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="AppDirect India Location"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;

