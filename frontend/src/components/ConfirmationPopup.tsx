import './ConfirmationPopup.css';

interface ConfirmationPopupProps {
  onClose: () => void;
  attendeeName: string;
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({ onClose, attendeeName }) => {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-icon">✓</div>
        <h2 className="popup-title">Registration Successful!</h2>
        <p className="popup-message">
          Thank you, {attendeeName}! You have successfully registered for the event.
        </p>
        <button className="popup-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ConfirmationPopup;

