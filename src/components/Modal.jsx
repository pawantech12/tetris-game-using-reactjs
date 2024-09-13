import PropTypes from "prop-types";

const Modal = ({ onClose, score }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
      <div className="bg-gray-700 p-8 w-1/3 rounded-lg shadow-lg text-center">
        <h2 className="text-4xl font-bold mb-4">Game Over</h2>
        <p className="text-xl mb-6">Your Score: {score}</p>
        <button
          onClick={onClose}
          className="px-4 font-medium text-xl py-2 bg-custom-green text-white rounded-lg "
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

Modal.propTypes = {
  onClose: PropTypes.func.isRequired,
  score: PropTypes.number.isRequired,
};

export default Modal;
