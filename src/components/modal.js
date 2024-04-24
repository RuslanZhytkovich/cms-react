import React from 'react';

const Modal = ({ children, closeModal }) => {
    const handleModalClick = (e) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    return (
        <div className="modal" onClick={handleModalClick}>
            <div className="modal-content">
                <span className="close" onClick={closeModal}>&times;</span>
                {children}
            </div>
        </div>
    );
};

export default Modal;
